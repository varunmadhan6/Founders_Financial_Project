from flask import Blueprint, request, jsonify 
from app.utils.db import get_db_connection
from functools import lru_cache
import time
from datetime import datetime, timedelta

# Define a Blueprint for stock report routes
stock_report_bp = Blueprint('stock_report', __name__)

# Cache stock data for 1 hour to avoid hitting rate limits
@lru_cache(maxsize=100)
def get_cached_stock_history(symbol, timestamp, period):
    try:
        # Map periods to date ranges
        period_mapping = {
            "week": 7,
            "month": 30,
            "year": 365,
            "5 years": 1825
        }

        if period not in period_mapping:
            raise ValueError("Invalid period. Use 'week', 'month', 'year', or '5 years'.")

        # Calculate the start date based on the period
        days = period_mapping[period]
        start_date = (datetime.now() - timedelta(days=days)).date()

        # Query the database for historical data
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT date, closing_price, high_52week AS high, low_52week AS low
            FROM stock_data
            WHERE stock_symbol = %s AND date >= %s
            ORDER BY date ASC
        """, (symbol, start_date))
        rows = cur.fetchall()

        # Also compute the 52-week high/low
        one_year_ago = (datetime.now() - timedelta(days=365)).date()
        cur.execute("""
            SELECT
              MAX(closing_price) AS high,
              MIN(closing_price) AS low
            FROM stock_data
            WHERE stock_symbol = %s AND date >= %s
        """, (symbol, one_year_ago))
        high_low = cur.fetchone()

        cur.close()
        conn.close()

        if not rows:
            raise ValueError("No historical data available")

        # Format the time‑series data
        result = []
        for date, closing_price, high, low in rows:
            if period in ("week", "month"):
                time_label = date.strftime("%b %d")
            else:  # "year" or "5 years"
                time_label = date.strftime("%b %Y")
            result.append({
                "time": time_label, 
                "price": round(float(closing_price), 2),
                "high": round(float(high), 2),
                "low": round(float(low), 2)
            })

        # Fetch stock metadata
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT company_name, sector, industry
            FROM stocks2
            WHERE stock_symbol = %s
        """, (symbol,))
        metadata = cur.fetchone()
        cur.close()
        conn.close()

        # Safely unpack the 52-week high/low
        week52High = round(float(high_low[0]), 2) if high_low and high_low[0] is not None else None
        week52Low  = round(float(high_low[1]), 2) if high_low and high_low[1] is not None else None

        stock_info = {
            "name": metadata[0] if metadata else symbol,
            "currentPrice": result[-1]["price"],
            "week52High": week52High,
            "week52Low": week52Low
        }

        return {"data": result, "info": stock_info}

    except Exception as e:
        return {"error": f"Error fetching data for {symbol}: {str(e)}"}

@stock_report_bp.route('/getStockHistory', methods=['GET'])
def get_stock_history():
    symbol = request.args.get('symbol', '').strip().upper()
    period = request.args.get('period', 'week')

    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    try:
        # Cache results using hourly timestamp
        timestamp = int(time.time() / 3600)
        result = get_cached_stock_history(symbol, timestamp, period)
        if "error" in result:
            return jsonify({"error": result["error"]}), 400
        return jsonify({
            "symbol": symbol,
            "period": period,
            "data": result["data"],
            "stockInfo": result["info"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500