import bcrypt
from app.utils.db import get_db_connection

class User:
    @staticmethod
    def find_by_username(username):
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id, username, email, password_hash, created_at FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return user
    
    @staticmethod
    def create(username, email, password):
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if username or email already exists
        cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
        if cur.fetchone():
            cur.close()
            conn.close()
            return None, "Username or email already exists"
        
        # Insert new user
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (username, email, password_hash)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return user_id, None
    
    @staticmethod
    def verify_password(stored_hash, password):
        return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    
    @staticmethod
    def update_last_login(user_id):
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user_id,))
        conn.commit()
        
        cur.close()
        conn.close()