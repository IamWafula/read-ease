from flask import Flask
from routes.text_processing import text_processing_bp
from config import Config
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config.from_object(Config)

# Register the blueprint for text processing
app.register_blueprint(text_processing_bp)

if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"])
