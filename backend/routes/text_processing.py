from flask import Blueprint, request, jsonify
from services.text_analysis import extract_keywords

text_processing_bp = Blueprint('text_processing', __name__)

@text_processing_bp.route('/process-text', methods=['POST'])
def process_text():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Use the service to extract keywords
    keywords = extract_keywords(text)
    return jsonify({'keywords': keywords})
