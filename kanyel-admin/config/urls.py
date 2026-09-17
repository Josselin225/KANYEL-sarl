from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.static import serve as serve_static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('content.urls')),
]

# Served unconditionally (not just DEBUG) so uploaded photos/logos keep
# working once DEBUG=False in production. Fine for this site's traffic;
# move to a CDN/object storage (e.g. S3) if traffic grows significantly.
urlpatterns += [
    path(
        f'{settings.MEDIA_URL.strip("/")}/<path:path>',
        serve_static,
        {'document_root': settings.MEDIA_ROOT},
    ),
]
