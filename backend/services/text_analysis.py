# text_analysis.py

import unittest
import os
import ast

from dotenv import load_dotenv
import google.generativeai as genai

# jwt imports


async def generate_analysis(text):

    # Configure the API with the key
    load_dotenv()
    genai.configure(api_key=os.getenv("API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")

    """Helper method to generate analysis using the Gemini model"""
    prompt = f""" 
        Extract key information from the text below following these specific requirements:

        1. Keywords extraction rules:
            - Extract the most important keywords or phrases
            - Each keyword should be 1-3 words maximum
            - Include only nouns, proper names, and technical terms
            - Exclude common words and generic verbs
            - Keywords should be lowercase unless they are proper nouns
            - Sort keywords alphabetically
            - Remove any punctuation from keywords

        2. Key sentences extraction rules:
            - Extract the most important sentences
            - Selected sentences must contain core ideas or conclusions
            - Sentences should be complete and verbatim from the text
            - Remove any redundant sentences
            - Keep original punctuation and capitalization

        3. Output format: Return a Python dictionary in exactly this format:
        {{
            "keywords": [
                "keyword1",
                "keyword2",
                "keyword3"
            ],
            "sentences": [
                "First key sentence from the text.",
                "Second key sentence from the text.",
                "Third key sentence from the text."
            ]
        }}

        Text to analyze: {text}
        """
    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Remove code block markers if present
    if raw_text.startswith("```") and raw_text.endswith("```"):
        raw_text = raw_text.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
        if raw_text.startswith("python"):
            raw_text = raw_text[6:].strip()

    try:
        # Use ast.literal_eval instead of eval for safety
        return ast.literal_eval(raw_text)
    except (SyntaxError, ValueError):
        # If parsing fails, return empty results
        return {"keywords": [], "sentences": []}
