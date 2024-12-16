from flask import Blueprint, request, jsonify


main_bp = Blueprint("main", __name__)


@main_bp.route("/", methods=["POST", "GET"])
def main():
    return jsonify({"message": "Logged in successfully"})
