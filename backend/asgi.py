# Asgi file to run the flask app using uvicorn server
from asgiref.wsgi import WsgiToAsgi
import uvicorn

# flask app imports
from flask import Flask
from config import Config
from flask_cors import CORS

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from flask_sqlalchemy import SQLAlchemy

# blueprint imports
from routes.text_processing import text_processing_bp
from routes.user import user_bp
from routes.main import main_bp

from dotenv import load_dotenv
import os


def create_app():

    load_dotenv()

    app = Flask(__name__)
    CORS(app, allow_headers="*")

    limiter = Limiter(
        app,
        default_limits=["1 per minute"],
    )

    # Register the blueprint for text processing
    app.register_blueprint(user_bp, url_prefix="/user")

    app.register_blueprint(text_processing_bp)

    return app


app = create_app()
asgi_app = WsgiToAsgi(app)

if __name__ == "__main__":
    uvicorn.run(asgi_app, host="0.0.0.0", port=3000, log_level="info")
