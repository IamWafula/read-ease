import unittest
import os
import ast 
import google.generativeai as genai

class TestGeminiTextAnalysis(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up Gemini API configuration before running tests"""
        genai.configure(api_key=os.environ["API_KEY"])
        cls.model = genai.GenerativeModel("gemini-1.5-flash")

    def generate_analysis(self, text):
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
        response = self.model.generate_content(prompt)
        raw_text = response.text.strip()

        # Remove code block markers if present
        if raw_text.startswith("```") and raw_text.endswith("```"):
            raw_text = raw_text.split('\n', 1)[1].rsplit('\n', 1)[0].strip()
            if raw_text.startswith('python'):
                raw_text = raw_text[6:].strip()
        
        try:
            # Use ast.literal_eval instead of eval for safety
            return ast.literal_eval(raw_text)
        except (SyntaxError, ValueError):
            # If parsing fails, return empty results
            return {
                "keywords": [],
                "sentences": []
            }

    def test_complete_return(self):
        """Test that the function returns a dictionary with the expected keys."""
        text = "The quick brown fox jumps over the lazy dog."
        output = self.generate_analysis(text)
        
        self.assertIsInstance(output, dict)
        self.assertIn("keywords", output)
        self.assertIn("sentences", output)
        self.assertIsInstance(output["keywords"], list)
        self.assertIsInstance(output["sentences"], list)

    def test_extract_keywords(self):
        """Test that the function returns keywords that make sense for the input text."""
        text = "The quick brown fox jumps over the lazy dog."
        output = self.generate_analysis(text)
        
        self.assertGreater(len(output["keywords"]), 0)
        for keyword in output["keywords"]:
            self.assertIsInstance(keyword, str)
            # Convert both to lowercase for case-insensitive comparison
            self.assertIn(keyword.lower(), text.lower())

    def test_extract_keywords_empty(self):
        """Test that the function handles empty input appropriately."""
        text = ""
        output = self.generate_analysis(text)
        
        self.assertEqual(output["keywords"], [])
        self.assertEqual(output["sentences"], [])

    def test_only_punctuation(self):
        """Test that the function handles input with only punctuation."""
        text = ".,!?-"
        output = self.generate_analysis(text)
        
        self.assertEqual(output["keywords"], [])
        self.assertTrue(len(output["sentences"]) == 0)

    def test_no_punctuation_keywords(self):
        """Test that keywords don't contain punctuation."""
        text = "The quick brown fox jumps over the lazy dog!"
        output = self.generate_analysis(text)
        
        punctuation = [".", ",", "!", "?", "-"]
        for keyword in output["keywords"]:
            for punct in punctuation:
                self.assertNotIn(punct, keyword)

    def test_technical_content(self):
        """Test handling of technical content with specific terms."""
        text = "Python is a programming language. It supports object-oriented programming and functional programming paradigms."
        output = self.generate_analysis(text)
        
        technical_terms = ["python", "programming", "object-oriented", "functional"]
        found_technical = False
        for keyword in output["keywords"]:
            if any(term.lower() in keyword.lower() for term in technical_terms):
                found_technical = True
                break
        self.assertTrue(found_technical, "Should identify technical terms as keywords")

    def test_sentence_preservation(self):
        """Test that extracted sentences maintain original formatting and punctuation."""
        text = "First sentence! Second sentence? Third sentence."
        output = self.generate_analysis(text)
        
        for sentence in output["sentences"]:
            self.assertTrue(any(sentence in text for text in [text]))
            self.assertTrue(any(punct in sentence for punct in [".", "!", "?"]))

if __name__ == "__main__":
    unittest.main()