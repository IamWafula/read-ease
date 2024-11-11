from flask import Blueprint, request, jsonify
from services.text_analysis import analyze_text

text_processing_bp = Blueprint('text_processing', __name__)

@text_processing_bp.route('/process-text', methods=['POST'])
def process_text():
    text = request.json.get('text')
    keywords, sentences = analyze_text(text)
    return jsonify({'keywords': keywords, 'sentences': sentences})
