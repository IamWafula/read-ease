from flask import Blueprint, request, jsonify

import firebase_admin
from firebase_admin import credentials, auth

import os

cred = credentials.Certificate("utils/firebaseAccountKey.json")
firebase_admin.initialize_app(cred)


def authorization_required():

    def decorator(func):
        def wrapper(*args, **kwargs):
            if "Authorization" not in request.headers:
                return jsonify({"error": "Unauthorized"}), 401

            bearer_secret = request.headers.get("Authorization").split(" ")

            if len(bearer_secret) != 2:
                return jsonify({"error": "Unauthorized"}), 401

            secret = bearer_secret[1]

            request_body = request.get_json()

            if not request_body:
                return jsonify({"error": "Unauthorized"}), 401

            if "uid" not in request_body:
                return jsonify({"error": "Unauthorized"}), 401

            try:
                decoded_token = auth.verify_id_token(secret)
                uid = decoded_token["uid"]
                if uid != request_body["uid"]:
                    return jsonify({"error": "Unauthorized"}), 401
            except:
                return jsonify({"error": "Unauthorized"}), 401

            return func(*args, **kwargs)

        return wrapper

    return decorator
