from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
from functools import lru_cache
import time

app = Flask(__name__)
CORS(app)

# Cache stock data for 5 minutes to avoid hitting rate limits
@lru_cache(maxsize=100)
def get_cached_stock_data(symbol, timestamp):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
        if not info or 'longName' not in info:
            raise ValueError(f"No data found for symbol: {symbol}")
            
        return {
            "name": info.get('longName'),
            "currentPrice": info.get('currentPrice') or info.get('regularMarketPrice'),
            "marketCap": info.get('marketCap'),
            "peRatio": info.get('trailingPE'),
            "week52High": info.get('fiftyTwoWeekHigh'),
            "week52Low": info.get('fiftyTwoWeekLow')
        }
    except Exception as e:
        raise Exception(f"Error fetching data for {symbol}: {str(e)}")

@app.route('/api/getStockInfo', methods=['GET'])
def get_stock_info():
    symbol = request.args.get('symbol', '').strip().upper()
    
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400
        
    try:
        # Cache for 5 minutes
        timestamp = int(time.time() / 300)
        stock_data = get_cached_stock_data(symbol, timestamp)
        return jsonify(stock_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)