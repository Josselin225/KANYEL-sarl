from datetime import timedelta

from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Forces re-login after this long, even if the token was never explicitly
# revoked. Mitigates the impact of a token leaked from a shared device or a
# compromised browser extension.
TOKEN_TTL = timedelta(days=14)


class ExpiringTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if timezone.now() - token.created > TOKEN_TTL:
            token.delete()
            raise AuthenticationFailed("Session expirée, veuillez vous reconnecter.")
        return user, token
