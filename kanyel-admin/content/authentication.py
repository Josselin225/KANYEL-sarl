from datetime import timedelta

from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Forces re-login after this long, even if the token was never explicitly
# revoked. Mitigates the impact of a token leaked from a shared device or a
# compromised browser extension.
TOKEN_TTL = timedelta(days=14)


class ExpiringTokenAuthentication(TokenAuthentication):
    """`Authorization: Token <key>` against AdminToken, which stores only a
    SHA-256 digest of each key (never the key itself)."""

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
