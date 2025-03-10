from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for frontend communication

    from app.routes import main  # Import routes
    app.register_blueprint(main)  # Register blueprint

    return app
