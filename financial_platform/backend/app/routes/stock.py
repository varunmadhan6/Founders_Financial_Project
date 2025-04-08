from flask import Blueprint, jsonify, request
from app.services.stock_service import StockService
from app.services.stock_data import HistoricalStockService

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
        
        errors = HistoricalStockService.populate_data(symbols)
        
        if errors:
            # Return partial success with error details
            return jsonify({
                "message": "Historical data update completed with some errors",
                "errors": errors,
                "success_count": len(symbols) - len(errors)
            }), 207  # 207 Multi-Status
        
        return jsonify({
            "message": "Historical stock data updated successfully",
            "symbols": symbols
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