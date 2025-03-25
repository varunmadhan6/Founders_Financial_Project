import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file in the root directory
load_dotenv()

class Config:
    # Use your exact environment variables
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "fallback-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    DATABASE_URL = os.environ.get("DATABASE_URL")
    DEBUG = os.environ.get("FLASK_ENV") == "development"