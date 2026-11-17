from django.conf import settings
from django.urls import include, path

from content.views import ProtectedMediaView, public_media

# L'admin intégré de Django n'est volontairement PAS enregistré ici : ce
# projet utilise un panneau d'administration sur mesure (l'app Next.js sous
# /admin) reposant entièrement sur l'API ci-dessous. Exposer en plus la page
# de connexion /admin/ de Django ne ferait qu'ajouter une surface d'attaque
# inutilisée et sans throttle pour le même compte utilisateur.
urlpatterns = [
    path('api/', include('content.urls')),
]

urlpatterns += [
    # Données personnelles (CV, lettres de motivation) — staff authentifié uniquement.
    # Doit précéder la route média fourre-tout ci-dessous.
    path('media/applications/<path:path>', ProtectedMediaView.as_view()),
    # Tout le reste sous /media/ (photos du site, logos...) est destiné à être
    # public, donc servi sans condition (pas seulement en DEBUG) pour continuer
    # à fonctionner avec DEBUG=False en production. public_media refuse toute
    # graphie qui se résout dans media/applications/.
    path(f'{settings.MEDIA_URL.strip("/")}/<path:path>', public_media),
]
