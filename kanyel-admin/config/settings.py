"""
Paramètres Django du projet config.

Généré par 'django-admin startproject' avec Django 6.1.1.

Pour plus d'informations sur ce fichier, voir
https://docs.djangoproject.com/en/6.1/topics/settings/

Pour la liste complète des paramètres et de leurs valeurs, voir
https://docs.djangoproject.com/en/6.1/ref/settings/
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Construire les chemins dans le projet ainsi : BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')


def _env_list(name, default=''):
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(',') if item.strip()]


# AVERTISSEMENT DE SÉCURITÉ : gardez secrète la clé utilisée en production !
# Repli sur une clé réservée au dev pour que `manage.py runserver` fonctionne
# sans fichier .env, mais la production DOIT définir DJANGO_SECRET_KEY (voir .env.example).
_INSECURE_DEFAULT_KEY = 'django-insecure-dev-only-key-do-not-use-in-production'
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', _INSECURE_DEFAULT_KEY)

# AVERTISSEMENT DE SÉCURITÉ : n'activez pas le debug en production !
# Désactivé sauf activation explicite, donc un .env absent/non chargé reste sûr.
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'

# Échouer bruyamment plutôt que servir silencieusement la production avec une
# clé secrète publique et devinable (qui permettrait de forger sessions/tokens).
if not DEBUG and SECRET_KEY == _INSECURE_DEFAULT_KEY:
    raise RuntimeError(
        'DJANGO_SECRET_KEY must be set to a real secret when DJANGO_DEBUG=False. '
        'Generate one and add it to the production .env file.'
    )

ALLOWED_HOSTS = _env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')


# Définition de l'application

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'content',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = _env_list(
    'CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000'
)

CSRF_TRUSTED_ORIGINS = _env_list('CSRF_TRUSTED_ORIGINS', '')

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'

# Durcissement réservé à la production. Désactivé en DEBUG pour que le dev local en http:// fonctionne.
if not DEBUG:
    # nginx termine le TLS et transmet du HTTP simple ; sans ceci, Django croirait
    # chaque requête non sécurisée et SECURE_SSL_REDIRECT bouclerait.
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Partagé entre les processus workers (contrairement au cache mémoire par défaut),
# pour que les limites de débit tiennent sous gunicorn avec plusieurs workers.
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': BASE_DIR / '.cache',
    }
}

REST_FRAMEWORK = {
    # Nombre de reverse proxies de confiance devant Django. 0 = utiliser l'adresse
    # TCP du pair et ignorer le X-Forwarded-For fourni par le client (qu'un
    # attaquant pourrait forger pour contourner toute limite de débit). 1 derrière nginx.
    'NUM_PROXIES': int(os.environ.get('DJANGO_NUM_PROXIES', '0')),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/hour',
        'login': '5/hour',
        'forms': '10/hour',
        'search': '120/hour',
        'visit': '30/hour',
    },
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'content.authentication.ExpiringTokenAuthentication',
    ],
}

# Plafond strict de la taille du corps des requêtes (uploads compris), indépendant
# des validateurs par champ de models.py — un filet de défense en profondeur contre
# les tentatives de déni de service par charges volumineuses.
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 Mo
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 Mo

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Base de données
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Validation des mots de passe
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 10},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalisation
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = 'fr-fr'

TIME_ZONE = 'Africa/Abidjan'

USE_I18N = True

USE_TZ = True


# Fichiers statiques (CSS, JavaScript, images)
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = 'static/'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# E-mail
# https://docs.djangoproject.com/en/6.1/topics/email/#topic-email-configuration
# Envoie une alerte à l'adresse principale de l'entreprise à chaque message de
# contact, candidature ou demande de devis reçu. Repli sur un affichage dans la
# console (aucun envoi réel) tant que EMAIL_HOST_USER/EMAIL_HOST_PASSWORD ne sont pas définis.

EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)

EMAIL_BACKEND = (
    'django.core.mail.backends.smtp.EmailBackend'
    if EMAIL_HOST_USER
    else 'django.core.mail.backends.console.EmailBackend'
)
