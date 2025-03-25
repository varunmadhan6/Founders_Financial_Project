import psycopg2
import os
from flask import Flask, jsonify, request
import yfinance as yf
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
from datetime import timedelta
from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Enable CORS for all routes with the correct configuration
CORS(app, resources={r"/*": {"origins": "*"}})

# Set up JWT
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-secret-key-for-development")  # Change this in production!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Neon PostgreSQL connection
DB_URL = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_o8xCfh3UqaOA@ep-mute-thunder-a5suzp7k-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require")

def get_db_connection():
    return psycopg2.connect(DB_URL)

# Create users table if it doesn't exist
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create users table
    cur.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
    )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

# Initialize the database on startup
init_db()

@app.route('/stocks/add', methods=['POST'])
@jwt_required()  # Protect this endpoint
def add_stocks():
    try:
        # Get current user
        current_user = get_jwt_identity()
        
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

        return jsonify({
            "message": "Stocks added successfully", 
            "stocks": symbols,
            "user": current_user
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a GET endpoint for stock info
@app.route('/api/getStockInfo', methods=['GET'])
@jwt_required(optional=True)  # Optional JWT verification
def get_stock_info():
    symbol = request.args.get('symbol', '').strip().upper()
    
    if not symbol:
        return jsonify({"error": "Stock symbol is required"}), 400
        
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
        if not info or 'longName' not in info:
            raise ValueError(f"No data found for symbol: {symbol}")
            
        stock_data = {
            "name": info.get('longName'),
            "currentPrice": info.get('currentPrice') or info.get('regularMarketPrice'),
            "marketCap": info.get('marketCap'),
            "peRatio": info.get('trailingPE'),
            "week52High": info.get('fiftyTwoWeekHigh'),
            "week52Low": info.get('fiftyTwoWeekLow')
        }
        
        # Get current user if logged in
        current_user = get_jwt_identity()
        if current_user:
            stock_data["message"] = f"Hello, {current_user}!"
        
        return jsonify(stock_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/register', methods=['OPTIONS'])
def handle_options():
    return '', 200

# User registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    # Hash the password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if username or email already exists
        cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
        if cur.fetchone():
            return jsonify({"error": "Username or email already exists"}), 409
        
        # Insert new user
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (username, email, password_hash)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "access_token": access_token
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

# User login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Find user
        cur.execute("SELECT id, username, password_hash FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
            return jsonify({"error": "Invalid username or password"}), 401
        
        # Update last login time
        cur.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user[0],))
        conn.commit()
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        return jsonify({
            "message": "Login successful",
            "user_id": user[0],
            "username": user[1],
            "access_token": access_token
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

# Get current user
@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user = get_jwt_identity()
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id, username, email, created_at FROM users WHERE username = %s", (current_user,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "created_at": user[3]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

# Logout (client-side only as JWT is stateless)
@app.route('/api/logout', methods=['POST'])
def logout():
    # JWT is stateless, so we don't need to do anything server-side
    # The client will handle removing the token
    return jsonify({"message": "Logout successful"})

if __name__ == '__main__':
    app.run(debug=True)