import os
from dotenv import load_dotenv

load_dotenv()

USE_ATLAS = os.getenv("USE_ATLAS", "False").lower() == "true"

if USE_ATLAS:
    MONGO_URI = os.getenv("MONGO_URI")
else:
    MONGO_DB_CONFIG = {
        "HOST": os.getenv("MONGO_HOST", "localhost"),
        "PORT": int(os.getenv("MONGO_PORT", 27017)),
        "USERNAME": os.getenv("MONGO_USER", ""),
        "PASSWORD": os.getenv("MONGO_PASSORD", ""),
        "NAME": os.getenv("MONGO_DB", "employeedb"),
    }
