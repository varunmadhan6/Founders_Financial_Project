import yfinance as yf
from app.utils.db import get_db_connection

class StockService:
    @staticmethod
    def get_stock_info(symbol):
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
            
            return stock_data, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def add_stocks(symbols):
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            
            added_symbols = []
            
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
                
                added_symbols.append(symbol)
            
            conn.commit()
            cur.close()
            conn.close()
            
            return added_symbols, None
        except Exception as e:
            if conn:
                conn.rollback()
                cur.close()
                conn.close()
            return None, str(e)