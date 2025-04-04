from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.stock_service import StockService

stock_bp = Blueprint('stock', __name__, url_prefix='/api')

@stock_bp.route('/getStockInfo', methods=['GET'])
def get_stock_info():
    symbol = request.args.get('symbol', '').strip().upper()
    
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400
        
    try:
        stock_data, error = StockService.get_stock_info(symbol)
        
        if error:
            return jsonify({"error": error}), 500
        
        # Get current user if logged in
        current_user = get_jwt_identity()
        if current_user:
            stock_data["message"] = f"Hello, {current_user}!"
        
        return jsonify(stock_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stock_bp.route('/stocks/add', methods=['POST'])
def add_stocks():
    try:
        # Get current user
        current_user = get_jwt_identity()
        
        symbols = request.json.get("symbols", [])
        if not symbols:
            return jsonify({"error": "No stock symbols provided"}), 400

        added_symbols, error = StockService.add_stocks(symbols)
        
        if error:
            return jsonify({"error": error}), 500

        return jsonify({
            "message": "Stocks added successfully", 
            "stocks": added_symbols,
            "user": current_user
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500