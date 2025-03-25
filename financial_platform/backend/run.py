from app import create_app

app = create_app()

if __name__ == '__main__':
    # Use the DEBUG setting from config
    from app.config import Config
    app.run(debug=Config.DEBUG)