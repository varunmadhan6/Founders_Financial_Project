from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Import and register route blueprints
    from app.routes.api_test import api_test_bp
    # from app.routes.test2 import test2_bp
    from app.routes.stock_report import stock_report_bp

    app.register_blueprint(api_test_bp, url_prefix='/api/api_test')
    # app.register_blueprint(test2_bp, url_prefix='/api/test2')
    app.register_blueprint(stock_report_bp, url_prefix='/api/stock_report')

    return app
