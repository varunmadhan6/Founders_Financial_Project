import psycopg2
from flask import Flask, jsonify, request
import yfinance as yf

app = Flask(__name__)

# Neon PostgreSQL connection
DB_URL = "postgresql://neondb_owner:npg_o8xCfh3UqaOA@ep-mute-thunder-a5suzp7k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

def get_db_connection():
    return psycopg2.connect(DB_URL)

@app.route('/stocks/add', methods=['POST'])
def add_stocks():
    try:
        symbols = request.json.get("symbols", [])  # Expecting a JSON list of stock symbols
        if not symbols:
            return jsonify({"error": "No stock symbols provided"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        for symbol in symbols:
            stock = yf.Ticker(symbol)
            stock_info = stock.info

            stock_data = (
                stock_info.get("symbol", symbol),
                stock_info.get("longName"),
                stock_info.get("sector"),
                stock_info.get("industry"),
                stock_info.get("marketCap"),
                stock_info.get("currentPrice"),
                stock_info.get("trailingPE"),
                stock_info.get("dividendYield"),
            )

            cur.execute("""
                INSERT INTO stocks (symbol, name, sector, industry, market_cap, price, pe_ratio, dividend_yield)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (symbol) DO UPDATE 
                SET price = EXCLUDED.price, 
                    market_cap = EXCLUDED.market_cap,
                    pe_ratio = EXCLUDED.pe_ratio,
                    dividend_yield = EXCLUDED.dividend_yield,
                    last_updated = CURRENT_TIMESTAMP
            """, stock_data)

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Stocks added successfully", "stocks": symbols})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
