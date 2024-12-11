# text_processing.py
from flask import Blueprint, request, jsonify

from services.text_analysis import generate_analysis
import firebase_admin

text_processing_bp = Blueprint("text_processing", __name__)


@text_processing_bp.route("/process-text", methods=["POST"])
async def process_text():

    # options = {
    #     "serviceAccountId": "my-client-id@my-project-id.iam.gserviceaccount.com",
    # }
    # default_app = firebase_admin.initialize_app(options=options)

    data = request.get_json()
    text = data["text"]

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Use the service to extract keywords
    result = await generate_analysis(text)

    # TODO : handle the case when the result is None (no keywords or sentences extracted)

    return jsonify(result)
