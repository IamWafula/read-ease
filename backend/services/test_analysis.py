import unittest
from text_analysis import extract_keywords


class TestTextAnalysis(unittest.TestCase):
    def test_complete_return(self):
        """
        Test that the function returns a dictionary with the expected keys.
        """
        text = "The quick brown fox jumps over the lazy dog."
        output = extract_keywords(text)
        keywords = output["keywords"]
        sentences = output["sentences"]

        self.assertIsInstance(output, dict)
        self.assertIn("keywords", output)
        self.assertIn("sentences", output)

    def test_extract_keywords(self):
        """
        Test that the function returns a list of keywords that are in the input text.
        """
        text = "The quick brown fox jumps over the lazy dog."
        output = extract_keywords(text)
        keywords = output["keywords"]
        sentences = output["sentences"]

        for keyword in keywords:
            self.assertIsInstance(keyword, str)
            self.assertIn(keyword, text)

    def test_extract_keywords_empty(self):
        """
        Test that the function returns an empty list when the input text is empty.
        """
        text = ""
        output = extract_keywords(text)
        keywords = output["keywords"]
        sentences = output["sentences"]

        self.assertEqual(keywords, [])

    def test_only_punctuation(self):
        """
        Test that the function returns an empty list when the input text is only punctuation.
        """
        text = ".,!?-"
        output = extract_keywords(text)
        keywords = output["keywords"]
        sentences = output["sentences"]

        self.assertEqual(keywords, [])

    def test_no_punctuation_keywords(self):
        """
        Test that the function returns keywords without punctuation
        """
        text = "The quick brown fox jumps over the lazy dog"
        output = extract_keywords(text)
        keywords = output["keywords"]
        sentences = output["sentences"]

        punctuation = [".", ",", "!", "?", "-"]
        for keyword in keywords:
            self.assertNotIn(keyword, punctuation)


if __name__ == "__main__":
    unittest.main()
