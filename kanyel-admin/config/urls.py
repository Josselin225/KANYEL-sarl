from django.conf import settings
from django.urls import include, path
from django.views.static import serve as serve_static

from content.views import ProtectedMediaView

# The built-in Django admin is intentionally NOT registered here: this
# project uses a custom admin panel (the Next.js app under /admin) backed
# entirely by the API below. Exposing Django's own /admin/ login in
# addition would just be unused, unthrottled attack surface for the same
# user account.
urlpatterns = [
    path('api/', include('content.urls')),
]

urlpatterns += [
    # Personal data (CVs, cover letters) — authenticated staff only.
    # Must come before the catch-all media route below.
    path('media/applications/<path:path>', ProtectedMediaView.as_view()),
    # Everything else under /media/ (site photos, logos...) is meant to be
    # publicly visible, so it's served unconditionally (not just DEBUG) so
    # it keeps working once DEBUG=False in production. Move to a CDN/object
    # storage (e.g. S3) if traffic grows significantly.
    path(
        f'{settings.MEDIA_URL.strip("/")}/<path:path>',
        serve_static,
        {'document_root': settings.MEDIA_ROOT},
    ),
]
