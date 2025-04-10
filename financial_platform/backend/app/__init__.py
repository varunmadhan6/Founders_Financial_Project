from flask import Flask
from app.config import Config
from app.extensions import jwt, cors
from app.utils.db import init_db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    cors.init_app(app)
    jwt.init_app(app)
    
    # Initialize database 
    init_db()
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.stock_report import stock_report_bp
    from app.routes.stock import stock_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(stock_report_bp, url_prefix='/api/stock_report')
    app.register_blueprint(stock_bp, url_prefix='/api/stock')
    
    return app