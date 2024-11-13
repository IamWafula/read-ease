import google.generativeai as genai
import os

# Set up the API key for authentication
genai.configure(api_key=os.environ["API_KEY"])

# Initialize the model
model = genai.GenerativeModel("gemini-1.5-flash")

# Read the content of your 'text.md' file (assuming it's in the 'temp' folder)
file_path = '../temp/text.md'
with open(file_path, 'r') as file:
    text = file.read()

# Define the prompt for keyword extraction
prompt = f"Extract the key words and key phrases from the following text:\n\n{text}"

# Generate the response
response = model.generate_content(prompt)

# Process the response to extract keywords
# Assuming the model output is a string of comma-separated keywords or phrases
keywords = response.text.strip()

# Format the response into a Python list of keywords
# If the keywords are returned in a format like "keyword1, keyword2, keyword3", we can split by commas
keywords_list = [keyword.strip() for keyword in keywords.split(',')]

# Print the list of extracted keywords
print("Extracted Keywords List:")
print(keywords_list)