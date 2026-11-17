from datetime import timedelta

from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Impose une reconnexion après ce délai, même si le token n'a jamais été
# révoqué explicitement. Limite l'impact d'un token fuité depuis un appareil
# partagé ou une extension de navigateur compromise.
TOKEN_TTL = timedelta(days=14)


class ExpiringTokenAuthentication(TokenAuthentication):
    """`Authorization: Token <key>` vérifié contre AdminToken, qui ne stocke
    qu'une empreinte SHA-256 de chaque clé (jamais la clé elle-même)."""

    def authenticate_credentials(self, key):
        from .models import AdminToken

        token = (
            AdminToken.objects.select_related("user")
            .filter(key_hash=AdminToken.hash_key(key))
            .first()
        )
        if token is None or not token.user.is_active:
            raise AuthenticationFailed("Jeton invalide.")
        if timezone.now() - token.created > TOKEN_TTL:
            token.delete()
            raise AuthenticationFailed("Session expirée, veuillez vous reconnecter.")
        return token.user, token
