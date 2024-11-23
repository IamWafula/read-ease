import google.generativeai as genai
import os
import ast
# Set up the API key for authentication
genai.configure(api_key=os.environ["API_KEY"])

# Initialize the model
model = genai.GenerativeModel("gemini-1.5-flash")

# Read the content of your 'text.md' file (assuming it's in the 'temp' folder)
file_path = '../temp/text.md'
with open(file_path, 'r') as file:
    text = file.read()

# Define the prompt for keyword and phrase extraction
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

3. Output format:
Return a Python dictionary in exactly this format:
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

4. Additional instructions:
   - If the text is too short (less than 100 words), extract as many keywords and sentences as possible
   - If the text contains numerical data or statistics, prioritize including them in the key sentences
   - If the text is not in English, extract keywords and sentences in the original language
   - Return only the Python dictionary without any additional text or formatting
   - Do not include any string formatting markers like quotes in the actual output - they should be part of the dictionary syntax

Text to analyze:
{text}
"""

# Generate the response
response = model.generate_content(prompt)

# Debug: Check the raw response text
print("Model Response Text:", response.text)

# Strip Markdown code block syntax if present
raw_text = response.text.strip()
if raw_text.startswith("```") and raw_text.endswith("```"):
    raw_text = raw_text.split('\n', 1)[1].rsplit('\n', 1)[0].strip()

# Try to parse the response into a Python dictionary
try:
    # Using ast.literal_eval for safe evaluation
    output_dict = ast.literal_eval(raw_text)
    if not isinstance(output_dict, dict):
        raise ValueError("The output is not a dictionary.")
except (SyntaxError, ValueError) as e:
    print("Failed to parse response as Python dictionary. Response text:")
    print(raw_text)
    raise ValueError(f"The model response could not be parsed. Error: {e}")

# Print the dictionary to verify its structure
print("Extracted Data:")
print(output_dict)