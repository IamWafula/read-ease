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
    model = genai.GenerativeModel("gemini-1.5-pro")

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
        {{
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
        }}
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
    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Remove code block markers if present
    if raw_text.startswith("```") and raw_text.endswith("```"):
        raw_text = raw_text.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
        if raw_text.startswith("python"):
            raw_text = raw_text[6:].strip()

    print(raw_text)

    try:
        # Use ast.literal_eval instead of eval for safety
        return ast.literal_eval(raw_text)
    except (SyntaxError, ValueError):
        # If parsing fails, return empty results
        return {"keywords": [], "sentences": []}
