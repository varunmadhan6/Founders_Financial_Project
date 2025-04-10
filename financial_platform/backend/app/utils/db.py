import psycopg2
import os
from app.config import Config

def get_db_connection():
    return psycopg2.connect(Config.DATABASE_URL)

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create users table (if not exists)
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
    
    # Create stocks2 table (for stock metadata)
    cur.execute('''
    CREATE TABLE IF NOT EXISTS stocks2 (
        stock_symbol VARCHAR(10) PRIMARY KEY,
        company_name VARCHAR(255),
        sector VARCHAR(100),
        industry VARCHAR(100)
    )
    ''')
    
    # Create stock_data table (for historical daily data)
    cur.execute('''
    CREATE TABLE IF NOT EXISTS stock_data (
        stock_symbol VARCHAR(10),
        date DATE,
        closing_price DECIMAL(10, 2),
        high_52week DECIMAL(10, 2),
        low_52week DECIMAL(10, 2),
        PRIMARY KEY (stock_symbol, date),
        FOREIGN KEY (stock_symbol) REFERENCES stocks2(stock_symbol)
    )
    ''')
    
    # Create market_pulse table (aggregated market data)
    cur.execute('''
    CREATE TABLE IF NOT EXISTS market_pulse (
        date DATE PRIMARY KEY,
        new_highs INTEGER,
        new_lows INTEGER,
        advanced INTEGER,
        declined INTEGER,
        unchanged INTEGER,
        ad_spread INTEGER
    )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()
