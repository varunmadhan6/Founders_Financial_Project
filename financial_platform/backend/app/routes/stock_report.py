from flask import Blueprint, request, jsonify
import yfinance as yf
from functools import lru_cache
import time

# Define a Blueprint for stock report routes
stock_report_bp = Blueprint('stock_report', __name__)

# Cache stock data for 5 minutes to avoid hitting rate limits
@lru_cache(maxsize=100)
def get_cached_stock_history(symbol, timestamp, period):
    try:
        stock = yf.Ticker(symbol)

        valid_periods = {
            "day": "1d",
            "week": "7d",
            "month": "1mo",
            "year": "1y"
        }

        if period not in valid_periods:
            raise ValueError("Invalid period. Use 'day', 'week', 'month', or 'year'.")

        hist = stock.history(period=valid_periods[period], interval="1h" if period == "day" else "1d")
        #print(hist)
        if hist.empty:
            raise ValueError("No historical data available")

        return [{"time": str(index), "price": row["Close"]} for index, row in hist.iterrows()]

    except Exception as e:
        return {"error": f"Error fetching data for {symbol}: {str(e)}"}


@stock_report_bp.route('/getStockHistory', methods=['GET'])
def get_stock_history():
    symbol = request.args.get('symbol', '').strip().upper()
    period = request.args.get('period', 'day')  # Default to daily

    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400

    try:
        # Cache results for 5 minutes
        timestamp = int(time.time() / 3600)
        history_data = get_cached_stock_history(symbol, timestamp, period)

        return jsonify({"symbol": symbol, "period": period, "data": history_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500