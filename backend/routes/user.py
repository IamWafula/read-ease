# text_processing.py
from flask import Blueprint, request, jsonify

from utils.decorators import authorization_required

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient


user_bp = Blueprint("user", __name__)


def get_mongo_client():
    if os.getenv("ENV") == "production":
        pass
    else:
        return AsyncIOMotorClient(os.getenv("MONGO_URI"))


@user_bp.route("/add_document", methods=["POST"])
@authorization_required()
async def add_document():
    data = request.get_json()
    text = data["text"]
    user_id = data["uid"]
    keywords = data["keywords"]
    sentences = data["sentences"]
    title = data["title"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    document = {
        "text": text,
        "user_id": user_id,
        "keywords": keywords,
        "sentences": sentences,
    }

    result = await collection.insert_one(document)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    return jsonify(result)


@user_bp.route("/add_document", methods=["POST"])
@authorization_required()
async def get_documents():
    data = request.get_json()
    user_id = data["uid"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    documents = await collection.find({"user_id": user_id}).to_list(length=None)

    return jsonify(documents)


@user_bp.route("/delete_document", methods=["POST"])
@authorization_required()
async def delete_document():
    data = request.get_json()
    user_id = data["uid"]
    document_id = data["document_id"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    result = await collection.delete_one({"user_id": user_id, "_id": document_id})

    return jsonify(result)


@user_bp.route("/change_document_title", methods=["POST"])
@authorization_required()
async def change_document_title():
    data = request.get_json()
    user_id = data["uid"]
    document_id = data["document_id"]
    title = data["title"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    result = await collection.update_one(
        {"user_id": user_id, "_id": document_id}, {"$set": {"title": title}}
    )

    return jsonify(result)
