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

from routes.text_processing import text_processing_bp
from routes.main import main_bp

from dotenv import load_dotenv
import os


def create_app():

    load_dotenv()

    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    if os.getenv("ENV") == "production":
        URI = "postgresql://root:root@read-ease.service.local/readEase"
    else:
        URI = "postgresql://root:root@localhost:5432/readEase"

    # app.config["SQLALCHEMY_DATABASE_URI"] = URI
    # app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # db = SQLAlchemy(app)

    # class User(db.Model):
    #     id = db.Column(db.Integer, primary_key=True)
    #     username = db.Column(db.String(80), unique=True, nullable=False)
    #     email = db.Column(db.String(120), unique=True, nullable=False)

    #     def __repr__(self):
    #         return "<User %r>" % self.username

    # with app.app_context():
    #     db.create_all()

    # # read previous users
    # print("Users before saving:")
    # with app.app_context():
    #     users = User.query.all()
    #     for user in users:
    #         print(user.username)

    # with app.app_context():
    #     username = "admin"
    #     email = "random@mail.com"
    #     new_user = User(username=username, email=email)

    #     db.session.add(new_user)
    #     db.session.commit()

    # # read users now
    # print("Users after saving:")
    # with app.app_context():
    #     users = User.query.all()
    #     for user in users:
    #         print(user.username)

    limiter = Limiter(
        app,
        default_limits=["1 per minute"],
    )

    # Register the blueprint for text processing
    app.register_blueprint(text_processing_bp)

    return app


app = create_app()
asgi_app = WsgiToAsgi(app)

if __name__ == "__main__":
    uvicorn.run(asgi_app, host="0.0.0.0", port=3000, log_level="info")
