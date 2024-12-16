# text_processing.py
from flask import Blueprint, request, jsonify

from utils.decorators import authorization_required, async_authorization_required

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

import os

import json
from bson.objectid import ObjectId


user_bp = Blueprint("user", __name__)


def get_mongo_client():
    if os.getenv("ENV") == "production":
        return AsyncIOMotorClient(
            os.getenv("MONGO_URI"), tlsAllowInvalidCertificates=True
        )
    else:
        return AsyncIOMotorClient(
            os.getenv("MONGO_URI"), tlsAllowInvalidCertificates=True
        )


@user_bp.route("/add_document", methods=["POST"])
@async_authorization_required()
async def add_document():
    try:
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

        document_id = result.inserted_id
        document_id = str(document_id)

        return jsonify({"document_id": document_id}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500


@user_bp.route("/get_document", methods=["POST"])
@async_authorization_required()
async def get_document_by_id():
    try:
        data = request.get_json()
        user_id = data["uid"]
        document_id = data["document_id"]

        mong_client = get_mongo_client()

        db = mong_client.get_database("readEase")
        collection = db.get_collection("documents")

        document = await collection.find_one(
            {"user_id": user_id, "_id": ObjectId(document_id)}
        )

        if document is None:
            return jsonify({"error": "Document not found"}), 404

        document["_id"] = str(document["_id"])

        return jsonify(document), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 404


@user_bp.route("/get_documents", methods=["POST"])
@async_authorization_required()
async def get_documents():

    try:
        data = request.get_json()
        user_id = data["uid"]

        mong_client = get_mongo_client()

        db = mong_client.get_database("readEase")
        collection = db.get_collection("documents")

        documents = await collection.find({"user_id": user_id}).to_list(length=None)

        return json.loads(json.dumps(documents, default=str))
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 404


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
