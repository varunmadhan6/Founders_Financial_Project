from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.route('/stock/<symbol>')
def get_stock_data(symbol):
    stock = yf.Ticker(symbol.upper())
    data = stock.history(period="1d")

    if data.empty:
        return jsonify({"error": "Stock not found"}), 404

    latest_price = data["Close"].iloc[-1]
    change = latest_price - data["Open"].iloc[-1]
    change_percentage = f"{'+' if change > 0 else ''}{(change / data['Open'].iloc[-1] * 100):.2f}%"

    return jsonify({
        "name": symbol.upper(),
        "price": f"${latest_price:.2f}",
        "change": change_percentage
    })

@app.route('/historical/<symbol>')
def get_historical_data(symbol):
    stock = yf.Ticker(symbol.upper())
    data = stock.history(period="5d")

    if data.empty:
        return jsonify({"error": "No data available"}), 404

    historical_prices = [{"date": str(date.date()), "value": price} for date, price in zip(data.index, data["Close"])]

    return jsonify(historical_prices)

if __name__ == '__main__':
    app.run(debug=True)
