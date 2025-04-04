from flask import Blueprint, request, jsonify
import yfinance as yf
from functools import lru_cache
import time
from datetime import datetime

# Define a Blueprint for stock report routes
stock_report_bp = Blueprint('stock_report', __name__)

# Cache stock data for 1 hour to avoid hitting rate limits
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
        
        valid_intervals = {
            "day": "15m",    # 15-minute intervals for day
            "week": "1h",    # 1-hour intervals for week
            "month": "1d",   # 1-day intervals for month
            "year": "1wk"    # 1-week intervals for year
        }

        if period not in valid_periods:
            raise ValueError("Invalid period. Use 'day', 'week', 'month', or 'year'.")

        # Get historical data with appropriate interval
        hist = stock.history(period=valid_periods[period], interval=valid_intervals[period])
        
        if hist.empty:
            raise ValueError("No historical data available")

        # Format time based on period
        result = []
        for index, row in hist.iterrows():
            # Format time display based on period
            if period == "day":
                time_label = index.strftime("%H:%M")
            elif period == "week":
                time_label = index.strftime("%a %H:%M")
            elif period == "month":
                time_label = index.strftime("%b %d")
            else:  # year
                time_label = index.strftime("%b %Y")
                
            result.append({
                "time": time_label,
                "price": round(float(row["Close"]), 2)
            })
        
        # Get additional stock info
        try:
            info = stock.info
            stock_info = {
                "name": info.get("shortName", symbol),
                "currentPrice": result[-1]["price"] if result else None,
                "marketCap": info.get("marketCap"),
                "peRatio": info.get("forwardPE"),
                "week52High": info.get("fiftyTwoWeekHigh"),
                "week52Low": info.get("fiftyTwoWeekLow"),
            }
        except:
            # If additional info can't be fetched, use basic info
            stock_info = {
                "name": symbol,
                "currentPrice": result[-1]["price"] if result else None,
                "marketCap": None,
                "peRatio": None,
                "week52High": None,
                "week52Low": None,
            }
        
        return {"data": result, "info": stock_info}

    except Exception as e:
        return {"error": f"Error fetching data for {symbol}: {str(e)}"}


@stock_report_bp.route('/getStockHistory', methods=['GET'])
def get_stock_history():
    symbol = request.args.get('symbol', '').strip().upper()
    period = request.args.get('period', 'day')  # Default to daily

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