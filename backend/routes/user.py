# text_processing.py
from flask import Blueprint, request, jsonify

from utils.decorators import authorization_required, async_authorization_required

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

import os

import json


user_bp = Blueprint("user", __name__)


def get_mongo_client():
    if os.getenv("ENV") == "production":
        pass
    else:
        return AsyncIOMotorClient(os.getenv("MONGO_URI"))


@user_bp.route("/add_document", methods=["POST"])
@async_authorization_required()
async def add_document():
    data = request.get_json()
    user_id = data["uid"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    document = {
        "title": "Untitled Document",
        "text": "",
        "user_id": user_id,
        "keywords": [],
        "sentences": [],
    }

    result = await collection.insert_one(document)

    print(result)

    return jsonify({"document_id": str(50)}), 200


@user_bp.route("/get_documents", methods=["POST"])
@async_authorization_required()
async def get_documents():
    data = request.get_json()
    user_id = data["uid"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    documents = await collection.find({"user_id": user_id}).to_list(length=None)

    return json.loads(json.dumps(documents, default=str))


@user_bp.route("/delete_document", methods=["POST"])
@async_authorization_required()
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
@async_authorization_required()
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


@user_bp.route("/change_document_text", methods=["POST"])
@async_authorization_required()
async def change_document_text():
    data = request.get_json()
    user_id = data["uid"]
    document_id = data["document_id"]
    text = data["text"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    result = await collection.update_one(
        {"user_id": user_id, "_id": document_id}, {"$set": {"text": text}}
    )

    return jsonify(result)


@user_bp.route("/change_document_keywords", methods=["POST"])
@async_authorization_required()
async def change_document_keywords():
    data = request.get_json()
    user_id = data["uid"]
    document_id = data["document_id"]
    keywords = data["keywords"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    result = await collection.update_one(
        {"user_id": user_id, "_id": document_id}, {"$set": {"keywords": keywords}}
    )

    return jsonify(result)


@user_bp.route("/change_document_sentences", methods=["POST"])
@async_authorization_required()
async def change_document_sentences():
    data = request.get_json()
    user_id = data["uid"]
    document_id = data["document_id"]
    sentences = data["sentences"]

    mong_client = get_mongo_client()

    db = mong_client.get_database("readEase")
    collection = db.get_collection("documents")

    result = await collection.update_one(
        {"user_id": user_id, "_id": document_id}, {"$set": {"sentences": sentences}}
    )

    return jsonify(result)
