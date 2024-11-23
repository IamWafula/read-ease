from flask import Blueprint, request, jsonify

from services.text_analysis import generate_analysis

text_processing_bp = Blueprint("text_processing", __name__)


@text_processing_bp.route("/process-text", methods=["POST"])
def process_text():
    data = request.get_json()
    text = data["text"]

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Use the service to extract keywords
    result = generate_analysis(text)
    # TODO : handle the case when the result is None (no keywords or sentences extracted)

    return jsonify(result)
