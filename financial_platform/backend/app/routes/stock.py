from flask import Blueprint, jsonify, request
from app.services.stock_service import StockService
from app.services.stock_data import HistoricalStockService
from datetime import datetime, timedelta
from app.utils.db import get_db_connection

stock_bp = Blueprint('stock', __name__)
@stock_bp.route('/getStockInfo', methods=['GET'])
def get_stock_info():
    symbol = request.args.get('symbol', '').strip().upper()
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400
    try:
        stock_data, error = StockService.get_stock_info(symbol)
        if error:
            return jsonify({"error": error}), 500
        return jsonify(stock_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@stock_bp.route('/stocks/add', methods=['POST'])
def add_stocks():
    try:
        symbols = request.json.get("symbols", [])
        if not symbols:
            return jsonify({"error": "No stock symbols provided"}), 400
        added_symbols, error = StockService.add_stocks(symbols)
        if error:
            return jsonify({"error": error}), 500
        return jsonify({
            "message": "Stocks added successfully",
            "stocks": added_symbols
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@stock_bp.route('/stocks/history/update', methods=['POST'])
def update_historical_data():
    try:
        symbols = request.json.get("symbols", [])
        if not symbols:
            return jsonify({"error": "No stock symbols provided"}), 400
        result = HistoricalStockService.insert_day_range_data_with_movement(symbols)
        return jsonify({
            "message": "Today's market pulse and current day stock data updated successfully.",
            "market_pulse": result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stock_bp.route('/stocks/history/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    try:
        symbol = symbol.strip().upper()
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        # Query the stock_data table for the specified range
        from app.utils.db import get_db_connection
        conn = get_db_connection()
        cur = conn.cursor()
        query = '''
            SELECT date, closing_price, high_52week, low_52week
            FROM stock_data
            WHERE stock_symbol = %s
        '''
        params = [symbol]
        if start_date:
            query += ' AND date >= %s'
            params.append(start_date)
        if end_date:
            query += ' AND date <= %s'
            params.append(end_date)
        query += ' ORDER BY date ASC'
        cur.execute(query, params)
        results = []
        for row in cur.fetchall():
            results.append({
                "date": row[0].isoformat(),
                "closing_price": float(row[1]),
                "high_52week": float(row[2]),
                "low_52week": float(row[3])
            })
        cur.close()
        conn.close()
        # Get company information
        company_info = {}
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute('''
                SELECT company_name, sector, industry
                FROM stocks2
                WHERE stock_symbol = %s
            ''', (symbol,))
            company_data = cur.fetchone()
            if company_data:
                company_info = {
                    "company_name": company_data[0],
                    "sector": company_data[1],
                    "industry": company_data[2]
                }
            cur.close()
            conn.close()
        except Exception:
            # Continue even if company info can't be retrieved
            pass
        return jsonify({
            "symbol": symbol,
            "company_info": company_info,
            "historical_data": results,
            "count": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@stock_bp.route('/stocks/52week/<symbol>', methods=['GET'])
def get_52week_data(symbol):
    try:
        symbol = symbol.strip().upper()
        high_52week, low_52week = HistoricalStockService.get_52week_high_low(symbol)
        return jsonify({
            "symbol": symbol,
            "high_52week": float(high_52week),
            "low_52week": float(low_52week)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@stock_bp.route('/movement-counters', methods=['GET'])
def get_movement_counters():
    counters, error = StockService.get_stock_movement_counters()
    print(counters)
    if error:
        return jsonify({"error": error}), 500
    return jsonify(counters), 200

@stock_bp.route('/new-highs-lows', methods=['GET'])
def get_new_highs_lows():
    data, error = StockService.get_new_highs_lows()
    if error:
        return jsonify({"error": error}), 500
    return jsonify(data), 200

@stock_bp.route("/api/market-pulse", methods=["GET"])
def get_market_pulse_data():
    """
    Returns market pulse data from the database in the format expected by the frontend.
    
    Expected DB Columns from market_pulse:
      - date
      - new_highs
      - new_lows
      - advanced
      - declined
      - unchanged
      - ad_spread
    
    Transforms each row to include:
      - date (ISO string)
      - newHighs, newLows, advanced, declined, unchanged, adSpread (renamed)
      - cumulativeADLine: cumulative (advanced - declined)
      - newHighRateOfChange, newLowRateOfChange: daily % change compared to previous day
      - acceleration: change difference in newHighs (custom metric)
    """
    # Optionally, you can get the time range parameter if you want to filter the rows.
    time_range = request.args.get("range", "1M")
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT date, new_highs, new_lows, advanced, declined, unchanged, ad_spread 
        FROM market_pulse
        ORDER BY date ASC
    """)
    rows = cur.fetchall()
    # print(rows)
    cur.close()
    conn.close()

    market_data = []
    cumulative_advanced = 0
    cumulative_declined = 0
    
    # These variables will hold the previous day's new_highs/new_lows for rate-of-change/acceleration calculations
    prev_newHighs = None
    prev_newLows = None
    prev_diff = None

    for row in rows:
        # Unpack each row; the order is assumed to be:
        # (date, new_highs, new_lows, advanced, declined, unchanged, ad_spread)
        date_val, new_highs, new_lows, advanced, declined, unchanged, ad_spread = row
        print(date_val, new_highs, new_lows, advanced, declined, unchanged, ad_spread)
        # Convert the date to an ISO string if needed.
        if isinstance(date_val, datetime):
            date_str = date_val.date().isoformat()
        else:
            date_str = str(date_val)

        # Update cumulative advances and declines
        cumulative_advanced += advanced
        cumulative_declined += declined
        cumulativeADLine = cumulative_advanced - cumulative_declined

        # Compute daily rate of change for new highs and new lows.
        if prev_newHighs is not None:
            newHighRateOfChange = ((new_highs - prev_newHighs) / prev_newHighs * 100) if prev_newHighs != 0 else 0
        else:
            newHighRateOfChange = 0

        if prev_newLows is not None:
            newLowRateOfChange = ((new_lows - prev_newLows) / prev_newLows * 100) if prev_newLows != 0 else 0
        else:
            newLowRateOfChange = 0

        # Compute acceleration metric: difference today minus the previous difference.
        if prev_newHighs is not None:
            diff = new_highs - prev_newHighs
            if prev_diff is not None:
                acceleration = diff - prev_diff
            else:
                acceleration = 0
            prev_diff = diff
        else:
            acceleration = 0

        # Store the current values for use in the next iteration.
        prev_newHighs = new_highs
        prev_newLows = new_lows

        record = {
            "date": date_str,
            "newHighs": new_highs,
            "newLows": new_lows,
            "advanced": advanced,
            "declined": declined,
            "unchanged": unchanged,
            "adSpread": ad_spread,
            "cumulativeADLine": cumulativeADLine,
            "newHighRateOfChange": round(newHighRateOfChange, 2),
            "newLowRateOfChange": round(newLowRateOfChange, 2),
            "acceleration": round(acceleration, 2)
        }
        market_data.append(record)

    # (Optional) You can apply additional filtering based on "time_range" if needed.

    return jsonify(market_data)