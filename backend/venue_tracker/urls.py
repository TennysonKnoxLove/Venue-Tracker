from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('api.users.urls')),
    path('api/states/', include('api.venues.urls.state_urls')),
    path('api/venues/', include('api.venues.urls.venue_urls')),
    path('api/contacts/', include('api.contacts.urls')),
    path('api/audio/', include('api.audio.urls')),
    path('api/ai/', include('api.venues.urls.ai_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 