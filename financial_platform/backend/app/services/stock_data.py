import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta, date
from app.utils.db import get_db_connection

class HistoricalStockService:
    @staticmethod
    def get_52week_high_low(stock_symbol):
        """
        Retrieve the 52-week high and low prices for a given stock symbol.
        (Used elsewhere; this version calculates from 1y of data.)
        """
        try:
            stock = yf.Ticker(stock_symbol)
            data = stock.history(period="1y")
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
    def insert_current_day_data_with_movement(symbols):
        """
        For each provided stock symbol, fetch today's data, compute the rolling 52‑week high/low,
        determine movement relative to yesterday, and insert today's row into stock_data.
        Then, if at least one symbol has valid (i.e. trading day) data, aggregate the data and
        insert/update the market_pulse table. Finally, if there are more than 365 valid weekday entries,
        delete the oldest valid row.
        """
        today_date = date(2025, 4, 28)

        total_new_highs = 0
        total_new_lows = 0
        total_advanced  = 0
        total_declined  = 0
        total_unchanged = 0

        valid_data_found = False  # Flag to track if today's data is available for any symbol

        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                data_full = ticker.history(period="1y")
                if data_full.empty:
                    print(f"No historical data for {symbol}, skipping...")
                    continue

                # Compute rolling 52‑week high/low
                data_full['52wk_high'] = data_full['High'].rolling(window='365d', min_periods=1).max()
                data_full['52wk_low'] = data_full['Low'].rolling(window='365d', min_periods=1).min()

                mask = data_full.index.date == today_date
                if not mask.any():
                    print(f"No data for {symbol} on {today_date}, skipping...")
                    continue

                valid_data_found = True  # At least one symbol provided valid data for today
                current_row = data_full[mask].iloc[-1]
                closing_price      = current_row['Close']
                current_52wk_high  = current_row['52wk_high']
                current_52wk_low   = current_row['52wk_low']

                # Retrieve the previous row for this symbol
                conn_prev = get_db_connection()
                cur_prev = conn_prev.cursor()
                cur_prev.execute("""
                    SELECT closing_price, high_52week, low_52week
                    FROM stock_data
                    WHERE stock_symbol = %s AND date < %s
                    ORDER BY date DESC LIMIT 1
                """, (symbol, today_date))
                prev_row = cur_prev.fetchone()
                cur_prev.close()
                conn_prev.close()

                is_advanced = False
                is_declined = False
                is_unchanged = False
                is_new_high = False
                is_new_low = False

                if prev_row:
                    prev_close, prev_52wk_high, prev_52wk_low = prev_row
                    if closing_price > prev_close:
                        is_advanced = True
                    elif closing_price < prev_close:
                        is_declined = True
                    else:
                        is_unchanged = True

                    if closing_price > prev_52wk_high:
                        is_new_high = True
                    if closing_price < prev_52wk_low:
                        is_new_low = True

                # Insert today's data into stock_data
                conn_ins = get_db_connection()
                cur_ins = conn_ins.cursor()
                cur_ins.execute("""
                    INSERT INTO stock_data (stock_symbol, date, closing_price, high_52week, low_52week)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (stock_symbol, date) DO NOTHING;
                """, (symbol, today_date, closing_price, current_52wk_high, current_52wk_low))
                conn_ins.commit()
                cur_ins.close()
                conn_ins.close()

                # Tally the aggregated values
                if prev_row:
                    if is_new_high:
                        total_new_highs += 1
                    if is_new_low:
                        total_new_lows += 1
                    if is_advanced:
                        total_advanced += 1
                    elif is_declined:
                        total_declined += 1
                    elif is_unchanged:
                        total_unchanged += 1

            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue

        # Only update the market_pulse table if at least one symbol has valid data
        if valid_data_found:
            ad_spread = total_advanced - total_declined

            conn_mp = get_db_connection()
            cur_mp = conn_mp.cursor()
            cur_mp.execute("""
                INSERT INTO market_pulse (date, new_highs, new_lows, advanced, declined, unchanged, ad_spread)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (date) DO UPDATE
                SET new_highs = EXCLUDED.new_highs,
                    new_lows = EXCLUDED.new_lows,
                    advanced = EXCLUDED.advanced,
                    declined = EXCLUDED.declined,
                    unchanged = EXCLUDED.unchanged,
                    ad_spread = EXCLUDED.ad_spread;
            """, (today_date, total_new_highs, total_new_lows, total_advanced, total_declined, total_unchanged, ad_spread))
            conn_mp.commit()
            cur_mp.close()
            conn_mp.close()

            # Delete the oldest valid weekday row if there are more than 365 valid rows in market_pulse.
            conn_cleanup = get_db_connection()
            cur_cleanup = conn_cleanup.cursor()
            # Count only records from weekdays (i.e. excluding Saturday=6 and Sunday=0)
            cur_cleanup.execute("""
                SELECT COUNT(*) FROM market_pulse
                WHERE EXTRACT(DOW FROM date) NOT IN (0, 6)
            """)
            valid_count = cur_cleanup.fetchone()[0]
            if valid_count > 365:
                cur_cleanup.execute("""
                    DELETE FROM market_pulse
                    WHERE date = (
                        SELECT date FROM market_pulse
                        WHERE EXTRACT(DOW FROM date) NOT IN (0, 6)
                        ORDER BY date ASC
                        LIMIT 1
                    )
                """)
                conn_cleanup.commit()
            cur_cleanup.close()
            conn_cleanup.close()

            return {
                "date": today_date.isoformat(),
                "new_highs": total_new_highs,
                "new_lows": total_new_lows,
                "advanced": total_advanced,
                "declined": total_declined,
                "unchanged": total_unchanged,
                "ad_spread": ad_spread
            }
        else:
            print("No valid trading data found for today.")
            return None

    @staticmethod
    def backfill_market_pulse(symbols):
        """
        Backfill the market_pulse table for all dates between 2024-04-06 and 2025-03-26
        that exist in the database (i.e. valid trading days).

        For each date and each symbol:
        - Retrieve the stock_data row for that date.
        - Retrieve the most recent stock_data row prior to that date.
        - Determine if the symbol advanced, declined, or was unchanged based on the closing price.
        - Determine if the symbol hit a new 52‑week high/low (by comparing the current closing price
            to the previous record's high_52week/low_52week).
        Then, aggregate these counts over all symbols and insert (or update) a record into market_pulse.

        Returns:
        A dictionary mapping each processed date (as an ISO string) to its aggregated metrics.
        """
        # Define the date range for backfilling.
        start_date = '2025-04-25'
        end_date = '2025-05-26'
        
        # Query the database for distinct dates in stock_data within the given range.
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT date 
            FROM stock_data
            WHERE date BETWEEN %s AND %s
            ORDER BY date ASC
        """, (start_date, end_date))
        date_rows = cur.fetchall()
        cur.close()
        conn.close()
        
        # Convert dates to Python date objects if necessary.
        date_list = []
        for row in date_rows:
            dt = row[0]
            if not isinstance(dt, date):
                dt = datetime.strptime(dt, '%Y-%m-%d').date()
            date_list.append(dt)
        
        results = {}
        
        # Process each valid date.
        for d in date_list:
            total_new_highs = 0
            total_new_lows = 0
            total_advanced  = 0
            total_declined  = 0
            total_unchanged = 0
            
            for symbol in symbols:
                try:
                    # Retrieve today's record for this symbol from stock_data.
                    conn_curr = get_db_connection()
                    cur_curr = conn_curr.cursor()
                    cur_curr.execute("""
                        SELECT closing_price, high_52week, low_52week
                        FROM stock_data
                        WHERE stock_symbol = %s AND date = %s
                        LIMIT 1
                    """, (symbol, d))
                    current_row = cur_curr.fetchone()
                    cur_curr.close()
                    conn_curr.close()
                    
                    # If no record exists for this symbol on d, skip it.
                    if not current_row:
                        continue
                    
                    current_close, current_52wk_high, current_52wk_low = current_row
                    
                    # Retrieve the most recent record before date d for this symbol.
                    conn_prev = get_db_connection()
                    cur_prev = conn_prev.cursor()
                    cur_prev.execute("""
                        SELECT closing_price, high_52week, low_52week
                        FROM stock_data
                        WHERE stock_symbol = %s AND date < %s
                        ORDER BY date DESC
                        LIMIT 1
                    """, (symbol, d))
                    prev_row = cur_prev.fetchone()
                    cur_prev.close()
                    conn_prev.close()
                    
                    # If no previous record exists, skip comparison for this symbol.
                    if not prev_row:
                        continue
                    
                    prev_close, prev_52wk_high, prev_52wk_low = prev_row
                    
                    # Determine price movement.
                    if current_close > prev_close:
                        total_advanced += 1
                    elif current_close < prev_close:
                        total_declined += 1
                    else:
                        total_unchanged += 1
                    
                    # Determine if a new high/low occurred by comparing closing price with previous 52‑week values.
                    if current_close > prev_52wk_high:
                        total_new_highs += 1
                    if current_close < prev_52wk_low:
                        total_new_lows += 1
                        
                except Exception as e:
                    print(f"Error processing {symbol} on {d}: {e}")
                    continue
            
            ad_spread = total_advanced - total_declined
            
            # Insert or update the market_pulse record for date d.
            conn_mp = get_db_connection()
            cur_mp = conn_mp.cursor()
            cur_mp.execute("""
                INSERT INTO market_pulse (date, new_highs, new_lows, advanced, declined, unchanged, ad_spread)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (date) DO UPDATE
                SET new_highs = EXCLUDED.new_highs,
                    new_lows = EXCLUDED.new_lows,
                    advanced = EXCLUDED.advanced,
                    declined = EXCLUDED.declined,
                    unchanged = EXCLUDED.unchanged,
                    ad_spread = EXCLUDED.ad_spread;
            """, (d, total_new_highs, total_new_lows, total_advanced, total_declined, total_unchanged, ad_spread))
            conn_mp.commit()
            cur_mp.close()
            conn_mp.close()
            
            results[str(d)] = {
                "new_highs": total_new_highs,
                "new_lows": total_new_lows,
                "advanced": total_advanced,
                "declined": total_declined,
                "unchanged": total_unchanged,
                "ad_spread": ad_spread
            }
        
        return results