from flask import Flask, request, jsonify

app = Flask(__name__)

# Defining the route that receives text and returns processed data
@app.route('/process-text', methods=['POST'])
def process_text():
    # Get the text from the request's JSON body
    text = request.json.get('text')
    
    # Calling the text processing function here to get keywords and sentences
    # Assuming the function is named `extract_keywords_and_sentences`
    # from yerkem_module import extract_keywords_and_sentences  # Uncomment when Yerkem's code is available
    
    # Mock response (Replace this with the actual function call once Yerkem’s code is available)
    keywords = ["example", "keywords", "from", "text"]
    sentences = text.split(". ")  # Simple sentence splitting; replace with actual processing logic

    # Respond with the processed data
    return jsonify({
        'keywords': keywords,
        'sentences': sentences
    })

if __name__ == '__main__':
    app.run(debug=True)
