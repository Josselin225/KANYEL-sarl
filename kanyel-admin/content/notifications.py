from django.conf import settings as django_settings
from django.core.mail import send_mail

from .models import SiteSettings


def notify_admin(subject: str, message: str) -> None:
    """Best-effort email alert to the company's main address. Never raises."""
    if not django_settings.EMAIL_HOST_USER:
        return
    site_settings = SiteSettings.objects.first()
    recipient = (site_settings.email_main if site_settings else "") or django_settings.DEFAULT_FROM_EMAIL
    if not recipient:
        return
    send_mail(
        subject,
        message,
        django_settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=True,
    )
