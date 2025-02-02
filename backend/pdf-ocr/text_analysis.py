# text_analysis.py

import unittest
import os
import ast

from dotenv import load_dotenv
import google.generativeai as genai

from groq import Groq

import asyncio
import pprint
import json

# jwt imports


def example_groq(text):

    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Explain the importance of fast language models",
            }
        ],
        model="llama-3.3-70b-versatile",
    )


async def generate_analysis_groq(text):

    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    prompt = f"""
        Extract key information from the text below following these specific requirements:

        1. **Keywords extraction rules**:
        - Extract the most important keywords or phrases that capture the core ideas of the text.
        - Each keyword should be 1-3 words maximum.
        - Include only nouns, proper names, and technical terms.
        - Exclude common words and generic verbs.
        - Keywords should be lowercase unless they are proper nouns.
        - Sort keywords alphabetically.
        - Remove any punctuation from keywords.
        - Each paragraph in the text must have multiple keywords extracted.
        - **Examples**:
            - Valid: "machine learning," "Einstein," "global warming."
            - Invalid: "is," "run," "quickly."
        

        2. **Key sentences extraction rules**:
        - Extract the most important sentences that collectively allow the main idea of the passage to be understood.
        - Each paragraph must have at least two topic sentences selected.
        - Topic sentences should include opening sentences, summary statements, or sentences with strong claims or conclusions.
        - Selected sentences must contain core ideas, conclusions, or unique insights central to the text.
        - Sentences should be complete and verbatim from the text.
        - Remove any redundant or peripheral sentences.
        - Keep original punctuation and capitalization.
        - **Note**: Paragraphs are separated by two newline characters or 4-5 sentences

        3. **Output format**: Return a JSON in exactly this format:

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

        **Note**: The extracted sentences and keywords should work together to provide a clear understanding of the main idea of the passage. Ensure each paragraph in the text is represented by at least two topic sentences and multiple keywords.

        Text to analyze: {text}
    """

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        temperature=0.5,
    )

    try:
        raw_text = chat_completion.choices[0].message.content

        pprint.pprint(text)

        pprint.pprint(json.loads(raw_text))

        return ast.literal_eval(raw_text)
    except (SyntaxError, ValueError):
        # If parsing fails, return empty results
        return {"keywords": [], "sentences": []}


async def generate_analysis_sentence_rank(text):
    # Configure the API with the key
    load_dotenv()
    genai.configure(api_key=os.getenv("API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")

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
        - Rank each sentence based on how much information it provides:
            - **Low**: The sentence provides little to no new information or is overly generic.
            - **Average**: The sentence provides some relevant information but lacks unique or critical insights.
            - **High**: The sentence conveys key ideas, core arguments, or critical information central to understanding the main text.
        - Consider sentences independently and in the context of the paragraph they belong to.
        - Be consistent in applying the ranking criteria.

        3. **Output format**:
        - Return the results as a Python dictionary in this exact format:
        {{
            "keywords": [
                "keyword1",
                "keyword2",
                "keyword3"
            ],
            "sentences": [
                ["sentence 1", "low"],
                ["sentence 2", "average"],
                ["sentence 3", "high"]
            ]
        }}

        4. **Examples**:
        - **Low**: "The sky is blue." (Generic, not critical to the text's meaning.)
        - **Average**: "The experiment produced unexpected results, but further analysis is needed." (Somewhat relevant but not highly informative.)
        - **High**: "The discovery of DNA's double-helix structure revolutionized biology and genetics." (Highly informative and central to the topic.)

        **Note**: The extracted sentences and keywords should work together to provide a clear understanding of the main idea of the passage. 

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


async def generate_analysis(text):

    # Configure the API with the key
    load_dotenv()
    genai.configure(api_key=os.getenv("API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")

    """Helper method to generate analysis using the Gemini model"""
    prompt = f""" 
        Extract key information from the text below following these specific requirements:

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

        2. **Key sentences extraction rules**:
        - Extract the most important sentences that collectively allow the main idea of the passage to be understood.
        - Selected sentences must contain core ideas, conclusions, or unique insights central to the text.
        - Sentences should be complete and verbatim from the text.
        - Remove any redundant or peripheral sentences.
        - Keep original punctuation and capitalization.

        3. **Output format**: Return a Python dictionary in exactly this format:

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

        **Note**: The extracted sentences and keywords should work together to provide a clear understanding of the main idea of the passage. 

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


async def main():
    text = """"Spain,[f] formally the Kingdom of Spain,[a][g] is a country in Southwestern Europe with territories in North Africa.[11][h] Featuring the southernmost point of continental Europe, It is the largest country in Southern Europe and the fourth-most populous European Union member state. Spanning across the majority of the Iberian Peninsula, its territory also includes the Canary Islands, in the Atlantic Ocean, the Balearic Islands, in the Mediterranean Sea, and the autonomous cities of Ceuta and Melilla, in Africa. Peninsular Spain is bordered to the north by France, Andorra, and the Bay of Biscay; to the east and south by the Mediterranean Sea and Gibraltar; and to the west by Portugal and the Atlantic Ocean. Spain's capital and largest city is Madrid, and other major urban areas include Barcelona, Valencia, Seville, Zaragoza, Málaga, Murcia and Palma de Mallorca. In early antiquity, the Iberian Peninsula was inhabited by Celts, Iberians, and other pre-Roman peoples. With the Roman conquest of the Iberian Peninsula, the province of Hispania was established. Following the Romanization and Christianization of Hispania, the fall of the Western Roman Empire ushered in the inward migration of tribes from Central Europe, including the Visigoths, who formed the Visigothic Kingdom centred on Toledo. In the early eighth century, most of the peninsula was conquered by the Umayyad Caliphate, and during early Islamic rule, Al-Andalus became a dominant peninsular power centred on Córdoba. Several Christian kingdoms emerged in Northern Iberia, chief among them Asturias, León, Castile, Aragon, Navarre, and Portugal; made an intermittent southward military expansion and repopulation, known as the Reconquista, repelling Islamic rule in Iberia, which culminated with the Christian seizure of the Nasrid Kingdom of Granada in 1492. The dynastic union of the Crown of Castile and the Crown of Aragon in 1479 under the Catholic Monarchs is often considered the de facto unification of Spain as a nation-state.During the Age of Discovery, Spain pioneered the exploration of the New World, made the first circumnavigation of the globe and formed one of the largest empires in history.[12] The Spanish Empire reached a global scale and spread across all continents, underpinning the rise of a global trading system fueled primarily by precious metals. In the 18th century, the Bourbon reforms centralized mainland Spain.[13] In the 19th century, after the Napoleonic occupation and the victorious Spanish War of independence, the following political divisions between liberals and absolutists led to the breakaway of most of the American colonies. These political divisions finally converged in the 20th century with the Spanish Civil War, giving rise to the Francoist dictatorship that lasted until 1975. With the restoration of democracy and its entry into the European Union, the country experienced an economic boom that profoundly transformed it socially and politically. Since the Siglo de Oro, Spanish art, architecture, music, poetry, painting, literature, and cuisine have been influential worldwide, particularly in Western Europe and the Americas. As a reflection of its large cultural wealth, Spain is the world's second-most visited country, has one of the world's largest numbers of World Heritage Sites, and it is the most popular destination for European students.[14] Its cultural influence extends to over 600 million Hispanophones, making Spanish the world's second-most spoken native language and the world's most widely spoken Romance language.[15] Spain is a secular parliamentary democracy and a constitutional monarchy,[16] with King Felipe VI as head of state. A developed country, it is a major advanced capitalist economy,[17] with the world's fifteenth-largest by both nominal GDP and PPP. Spain is a member of the United Nations, the European Union, the eurozone, North Atlantic Treaty Organization (NATO), a permanent guest of the G20, and is part of many other international organizations such as the Council of Europe (CoE), the Organization of Ibero-American States (OEI), the Union for the Mediterranean, the Organisation for Economic Co-operation and Development (OECD), the Organization for Security and Co-operation in Europe (OSCE), and the World Trade Organization (WTO)."""

    return await generate_analysis_groq(text)
