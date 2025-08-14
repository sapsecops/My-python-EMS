import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

USE_ATLAS = os.getenv("USE_ATLAS", "False").lower() == "true"

MONGO_DB_CONFIG = {
    "HOST": os.getenv("MONGO_HOST", "localhost"),
    "PORT": int(os.getenv("MONGO_PORT", "27017")),
    "NAME": os.getenv("MONGO_NAME", "employeedb"),
    "USERNAME": os.getenv("MONGO_USER", ""),
    "PASSWORD": os.getenv("MONGO_PASS", ""),
    "AUTH_SOURCE": os.getenv("MONGO_AUTH_SOURCE", "admin"),
}

MONGO_URI = os.getenv("MONGO_URI", "")

_client = None

def _build_client():
    if USE_ATLAS:
        if not MONGO_URI:
            raise RuntimeError("USE_ATLAS=True but MONGO_URI is not set")
        return MongoClient(MONGO_URI)
    # Local / self-hosted
    if MONGO_DB_CONFIG["USERNAME"]:
        return MongoClient(
            host=MONGO_DB_CONFIG["HOST"],
            port=MONGO_DB_CONFIG["PORT"],
            username=MONGO_DB_CONFIG["USERNAME"],
            password=MONGO_DB_CONFIG["PASSWORD"],
            authSource=MONGO_DB_CONFIG["AUTH_SOURCE"],
        )
    return MongoClient(MONGO_DB_CONFIG["HOST"], MONGO_DB_CONFIG["PORT"])

def get_client():
    global _client
    if _client is None:
        _client = _build_client()
    return _client

def get_db():
    return get_client()[MONGO_DB_CONFIG["NAME"]]
