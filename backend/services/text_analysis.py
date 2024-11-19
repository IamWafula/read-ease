import google.generativeai as genai
from config import Config

# Configure the API with the key
genai.configure(api_key=Config.API_KEY)


def extract_keywords(text):
    # Define the prompt for keyword extraction
    prompt = f"Extract the key words and key phrases from the following text:\n\n{text}"

    # Initialize the model
    model = genai.GenerativeModel("gemini-1.5-flash")

    # Generate the response
    response = model.generate_content(prompt)

    # Process the response to extract keywords
    keywords = response.text.strip()
    keywords_list = [keyword.strip() for keyword in keywords.split(",")]
    return keywords_list
