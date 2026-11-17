"""
Configuration ASGI du projet config.

Expose l'appelable ASGI sous la forme d'une variable de module nommée ``application``.

Pour plus d'informations sur ce fichier, voir
https://docs.djangoproject.com/en/6.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_asgi_application()
