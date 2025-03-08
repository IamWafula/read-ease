from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import session

limiter = Limiter(
    key_func=lambda: session.get("user_id") or get_remote_address(),
    default_limits=["5 per day"]
)