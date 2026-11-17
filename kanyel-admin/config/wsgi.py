"""
Configuration WSGI du projet config.

Expose l'appelable WSGI sous la forme d'une variable de module nommée ``application``.

Pour plus d'informations sur ce fichier, voir
https://docs.djangoproject.com/en/6.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()
