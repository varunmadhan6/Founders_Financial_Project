from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Use the DEBUG setting from config
    port = int(os.environ.get("PORT", 5000))  # default 5000 if not set
    app.run(host="0.0.0.0", port=port)