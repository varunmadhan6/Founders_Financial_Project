import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from app.utils.db import get_db_connection  # Assumes a similar db utility as in your first file

class HistoricalStockService:
    @staticmethod
    def get_52week_high_low(stock_symbol):
        """
        Retrieve the 52-week high and low prices for a given stock symbol.
        """
        try:
            stock = yf.Ticker(stock_symbol)
            data = stock.history(period="1y")  # Last 1 year of data
            if data.empty:
                raise ValueError(f"No historical data found for symbol: {stock_symbol}")
            high_52week = data['High'].max()
            low_52week = data['Low'].min()
            return high_52week, low_52week
        except Exception as e:
            raise Exception(f"Error getting 52-week high/low for {stock_symbol}: {e}")

    @staticmethod
    def insert_stock_metadata(stock_symbol):
        """
        Insert stock metadata into the stocks2 table.
        """
        try:
            stock = yf.Ticker(stock_symbol)
            info = stock.info
            company_name = info.get('longName', '')
            sector = info.get('sector', '')
            industry = info.get('industry', '')
            
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO stocks2 (stock_symbol, company_name, sector, industry)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (stock_symbol) DO NOTHING;
            ''', (stock_symbol, company_name, sector, industry))
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            raise Exception(f"Error inserting metadata for {stock_symbol}: {e}")

    @staticmethod
    def insert_stock_data(stock_symbol):
        """
        Insert historical daily closing data into the stock_data table.
        For each day in the last 6 years, the function inserts the closing price as well as the current 52-week high/low.
        """
        try:
            stock = yf.Ticker(stock_symbol)
            # Define the date range (last 6 years)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=6*365)
            data = stock.history(start=start_date, end=end_date)
            if data.empty:
                raise ValueError(f"No historical data available for {stock_symbol}")
            
            # Get 52-week high and low (from the most recent year)
            high_52week, low_52week = HistoricalStockService.get_52week_high_low(stock_symbol)
            
            conn = get_db_connection()
            cur = conn.cursor()
            # Iterate over the historical data and insert each record
            for index, row in data.iterrows():
                date_val = index.date()
                closing_price = row['Close']
                cur.execute('''
                    INSERT INTO stock_data (stock_symbol, date, closing_price, high_52week, low_52week)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (stock_symbol, date) DO NOTHING;
                ''', (stock_symbol, date_val, closing_price, high_52week, low_52week))
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            raise Exception(f"Error inserting historical data for {stock_symbol}: {e}")

    @staticmethod
    def populate_data(symbols):
        """
        For each symbol provided, insert metadata and historical daily data.
        """
        errors = {}
        for stock_symbol in symbols:
            try:
                HistoricalStockService.insert_stock_metadata(stock_symbol)
                HistoricalStockService.insert_stock_data(stock_symbol)
                print(f"Data for {stock_symbol} populated successfully.")
            except Exception as e:
                errors[stock_symbol] = str(e)
                print(f"Error for {stock_symbol}: {e}")
        return errors

if __name__ == '__main__':
    # Example list of S&P 500 stock symbols (replace with full list as needed)
    sp500_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META"]
    errors = HistoricalStockService.populate_data(sp500_symbols)
    if errors:
        print("Some symbols encountered errors:")
        for symbol, err in errors.items():
            print(f"{symbol}: {err}")
