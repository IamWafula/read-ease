# text_processing.py
from flask import Blueprint, request, jsonify

from services.text_analysis import generate_analysis

from utils.decorators import authorization_required, async_authorization_required
from services.caching import cache_url, retrieve_cache_url

import json

# imports for embeddings
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
import google.generativeai as genai
import os
from spacy.lang.en import English
import numpy as np
from sentence_transformers import util
import pickle


text_processing_bp = Blueprint("process-text", __name__)


# @text_processing_bp.route("/text", methods=["POST"])
# @async_authorization_required()
async def process_text():
    data = request.get_json()
    text = data["text"]
    ranking = data.get("ranking", False)

    # TODO: re-introduce caching
    url = data.get("url", False)
    # url = None

    if ranking:
        ranking = int(ranking)

    result = None

    if url:
        # Check if the URL is already cached
        cached_data = retrieve_cache_url(repr(url))

        if cached_data:
            result = json.loads(cached_data)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Use the service to extract keywords only if the result is not already cached
    if result is None:
        result = await generate_analysis(text)

        if url:
            cache_url(repr(url), result)

    only_rank_sentences = []

    for sentence in result["sentences"]:
        sentence_rank = sentence[1]
        sentence_text = sentence[0]
        if sentence[1] >= ranking:
            only_rank_sentences.append(sentence_text)

    result["sentences"] = only_rank_sentences

    # TODO : handle the case when the result is None (no keywords or sentences extracted)

    return jsonify(result)


def generate_embeddings(text, my_key):
    genai.configure(api_key=os.getenv("IAN_API_KEY"))

    response = genai.embed_content(model="models/text-embedding-004", content=text)

    return response


def get_embeddings(sentences, key):
    embeddings = []
    for sentence in sentences:
        embeddings.append(generate_embeddings(sentence, key)["embedding"])
    return embeddings


def generate_full_text_embeddings(sentence_embeddings):

    # using the mean of the embeddings
    full_text_embedding = np.mean(sentence_embeddings, axis=0)

    return full_text_embedding


# TODO: Ensure that we eliminate atleast half
def cosine_to_rank(cosine_score):
    # convert cosine score to a rank
    buckets = [0.65, 0.7, 0.75, 0.8, 0.9]
    buckets = sorted(buckets, reverse=True)

    for i, bucket in enumerate(buckets):
        if cosine_score >= bucket:
            return 5 - i + 1

    return 0


def get_key_sentences(all_sentences, embeddings, full_text_embedding, n=5):

    embeddings = np.array(embeddings)

    # Compute cosine-similarities
    cosine_scores = util.pytorch_cos_sim(full_text_embedding, embeddings)

    # Find the pairs with the highest cosine similarity scores
    pairs = []
    for i in range(len(cosine_scores[0])):
        pairs.append({"index": i, "score": cosine_scores[0][i]})

    # Sort scores in decreasing order
    pairs = sorted(pairs, key=lambda x: x["score"], reverse=True)

    top_sentences = []

    for pair in pairs:
        sentence_score = float(pair["score"])
        sentence_rank = cosine_to_rank(sentence_score)

        top_sentences.append((all_sentences[pair["index"]], sentence_rank))

    return top_sentences


def get_all_sentences(text):
    nlp = English()
    nlp.add_pipe("sentencizer", first=True)

    def split_sentences(text):
        doc = nlp(text)
        return [sent.text for sent in doc.sents]

    all_sentences = split_sentences(text)

    return all_sentences


@text_processing_bp.route("/text", methods=["POST"])
async def process_text_transformer():
    print("Processing text")
    data = request.get_json()
    text = str(data["text"])
    ranking = data.get("ranking", False)
    result = {
        "sentences": [],
        "keywords": [],
    }

    all_sentences = get_all_sentences(text)

    # get the embeddings

    # uncomment this like when testing
    # if os.path.exists("embeddings.pkl"):
    #     with open("embeddings.pkl", "rb") as f:
    #         embeddings = pickle.load(f)
    # else:
    print("Generating embeddings")
    embeddings = get_embeddings(all_sentences, os.getenv("IAN_API_KEY"))

    # save the embeddings
    with open("embeddings.pkl", "wb") as f:
        pickle.dump(embeddings, f)

    print("Generating full text embeddings")
    full_text_embedding = generate_full_text_embeddings(embeddings)

    print("Getting key sentences")
    top_sentences = get_key_sentences(all_sentences, embeddings, full_text_embedding)

    if ranking:
        ranking = int(ranking)

        only_rank_sentences = []

        for sentence in top_sentences:
            sentence_rank = sentence[1]
            sentence_text = sentence[0]
            if sentence_rank >= ranking:
                only_rank_sentences.append(sentence_text)

        result["sentences"] = only_rank_sentences

    return jsonify(result)
