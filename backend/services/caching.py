import os
from dotenv import load_dotenv

import redis
import json


def get_redis_client():
    load_dotenv()

    if os.getenv("ENV") == "production":
        pass
    else:
        return redis.Redis(host="localhost", port="6379")


def cache_url(url, summarized_data):
    redis_client = get_redis_client()

    if redis_client:
        redis_client.hset(
            url,
            mapping={
                "keywords": json.dumps(summarized_data["keywords"]),
                "sentences": json.dumps(summarized_data["sentences"]),
            },
        )
        redis_client.expire(url, 60 * 5)  # 5 minutes


def retrieve_cache_url(url):
    redis_client = get_redis_client()

    if redis_client:

        keywords = redis_client.hget(url, "keywords")
        sentences = redis_client.hget(url, "sentences")

        if keywords and sentences:
            return {
                "keywords": json.loads(keywords.decode("utf-8")),
                "sentences": json.loads(sentences.decode("utf-8")),
            }
    return None
