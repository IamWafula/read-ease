# text_processing.py
from flask import Blueprint, request, jsonify

from services.text_analysis import generate_analysis

from utils.decorators import authorization_required, async_authorization_required
from services.caching import cache_url, retrieve_cache_url

import json

text_processing_bp = Blueprint("process-text", __name__)


@text_processing_bp.route("/process-text", methods=["POST"])
@async_authorization_required()
async def process_text():
    data = request.get_json()
    text = data["text"]
    url = data.get("url")

    if url:
        # Check if the URL is already cached
        cached_data = retrieve_cache_url(repr(url))

        if cached_data:
            return jsonify(cached_data)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Use the service to extract keywords
    result = await generate_analysis(text)

    if url:
        cache_url(repr(url), result)
    # TODO : handle the case when the result is None (no keywords or sentences extracted)

    return jsonify(result)
