# api_test.py

import unittest
import os
import ast
import google.generativeai as genai
import dotenv

dotenv.load_dotenv()


class TestGeminiTextAnalysis(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up Gemini API configuration before running tests"""
        genai.configure(api_key=os.environ["API_KEY"])
        cls.model = genai.GenerativeModel("gemini-1.5-flash")

    def generate_analysis(self, text):
        """Helper method to generate analysis using the Gemini model"""
        prompt = f""" 
        Analyze the text below and rank each sentence based on its relevance in conveying information. Follow these specific instructions:

        1. **Keywords extraction rules**:
        - Extract the most important keywords or phrases that capture the core ideas of the text.
        - Each keyword should be 1-3 words maximum.
        - Include only nouns, proper names, and technical terms.
        - Exclude common words and generic verbs.
        - Keywords should be lowercase unless they are proper nouns.
        - Sort keywords alphabetically.
        - Remove any punctuation from keywords.
        - **Examples**:
            - Valid: "machine learning," "Einstein," "global warming."
            - Invalid: "is," "run," "quickly."

        2. **Relevance ranking for sentences**:
        - **Rank each sentence on a scale of 1-5** based on how much information it provides:
            - **1 (Lowest)**: The sentence provides little to no new information or is overly generic.
            - **2**: The sentence offers some relevant details but lacks strong relevance or uniqueness.
            - **3**: The sentence provides useful information but is not essential to understanding the core text.
            - **4**: The sentence conveys important information and contributes significantly to understanding the text.
            - **5 (Highest)**: The sentence is highly critical, providing key insights or central ideas.
        - **Consider embedded or compound sentences**:
            - If a sentence contains multiple pieces of information separated by conjunctions or commas, evaluate each component independently.
            - Extract the embedded sentence or phrase if it conveys a distinct and important idea, treating it as a separate sentence.
            - Example: *"The sky is blue, and the sun is shining"* contains two parts: *"The sky is blue"* and *"The sun is shining."* Each should be evaluated and ranked separately.

        3. **Output format**:
        - Return the results as a Python dictionary in this exact format:
        ```python
        {
            "keywords": [
                "keyword1",
                "keyword2",
                "keyword3"
            ],
            "sentences": [
                ["sentence 1", 1],
                ["sentence 2", 3],
                ["sentence 3", 5]
            ]
        }
        ```

        4. **Examples**:
        - **1 (Lowest)**: *"The sky is blue."* (Generic, not critical to the text's meaning.)
        - **2**: *"The experiment produced unexpected results, but further analysis is needed."* (Somewhat relevant but not highly informative.)
        - **3**: *"During the late 19th century, economic reforms shaped industrial growth."* (Useful context but not the main focus.)
        - **4**: *"The discovery of penicillin marked the beginning of the antibiotic era in medicine."* (Important contribution to the topic.)
        - **5 (Highest)**: *"DNA's double-helix structure, discovered in 1953, revolutionized biology and genetics."* (Central to understanding the subject.)

        **Note**:
        The extracted sentences and keywords should work together to provide a clear understanding of the main idea of the passage. Ensure consistency in applying ranking criteria, and include all relevant embedded ideas as individual sentences where applicable.

        **Text to analyze**: {text}
        """
        response = self.model.generate_content(prompt)
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
