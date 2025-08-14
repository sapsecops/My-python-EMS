import os
from pathlib import Path
from .config import USE_ATLAS, MONGO_URI, MONGO_DB_CONFIG

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-change-this'
DEBUG = False
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'employees',
]

MIDDLEWARE = [
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'backend.urls'

DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': MONGO_DB_CONFIG["NAME"] if not USE_ATLAS else None,
        'CLIENT': {
            'host': MONGO_URI if USE_ATLAS else MONGO_DB_CONFIG["HOST"],
            'port': None if USE_ATLAS else MONGO_DB_CONFIG["PORT"],
            'username': None if USE_ATLAS else MONGO_DB_CONFIG["USERNAME"],
            'password': None if USE_ATLAS else MONGO_DB_CONFIG["PASSWORD"],
        }
    }
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'