import psycopg2
import os
from app.config import Config

def get_db_connection():
    return psycopg2.connect(Config.DATABASE_URL)

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
    
    # Create stocks table if it doesn't exist
    cur.execute('''
    CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(100),
        sector VARCHAR(100),
        industry VARCHAR(100),
        market_cap BIGINT,
        price NUMERIC,
        pe_ratio NUMERIC,
        dividend_yield NUMERIC,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create a stock_data table for historical data
    cur.execute('''
    CREATE TABLE IF NOT EXISTS stocks2 (
        stock_symbol VARCHAR(10) PRIMARY KEY,
        company_name VARCHAR(255),
        sector VARCHAR(100),
        industry VARCHAR(100)
    )
    ''')


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
    
    conn.commit()
    cur.close()
    conn.close()