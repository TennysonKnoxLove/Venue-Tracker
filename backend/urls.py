from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from ai import views as ai_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from reminders.views import ReminderNotificationViewSet, ReminderCategoryViewSet

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('api.users.urls')),
    path('api/states/', include('api.venues.urls.state_urls')),
    path('api/venues/', include('api.venues.urls.venue_urls')),
    path('api/audio/', include('api.audio.urls')),
    path('api/contacts/', include('api.contacts.urls')),
    path('api/ai/', include('api.venues.urls.ai_urls')),
    
    # Venue discovery endpoints
    path('api/ai/discover/', ai_views.discover_venues, name='discover_venues'),
    path('api/ai/discover-opportunities/', ai_views.discover_opportunities, name='discover_opportunities'),
    path('api/ai/searches/', ai_views.get_search_history, name='search_history'),
    path('api/ai/searches/<str:search_id>/', ai_views.get_search_results, name='search_results'),
    path('api/ai/searches/<str:search_id>/import/', ai_views.import_venues, name='import_venues'),
    path('api/ai/searches/<str:search_id>/import-opportunities/', ai_views.import_opportunities, name='import_opportunities'),
    
    # New features
    path('api/network/', include('network.urls')),
    
    # Direct endpoint for reminder categories (fixing the 404 issue)
    path('api/reminders/categories/', ReminderCategoryViewSet.as_view({'get': 'list', 'post': 'create'}), name='reminder-categories-direct'),
    path('api/reminders/categories/<int:pk>/', ReminderCategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='reminder-category-detail-direct'),
    
    # Include other reminders URLs after the direct categories endpoint
    path('api/reminders/', include('reminders.urls')),
    
    path('api/networking/', include('networking.urls')),
    path('api/profiles/', include('profiles.urls')),
    path('api/email-generator/', include('email_generator.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/budget/', include('budget.urls')),
    
    # Root level notifications (shortcut to reminders/notifications)
    path('api/notifications/', ReminderNotificationViewSet.as_view({'get': 'list'}), name='notifications-list'),
    path('api/notifications/mark_all_read/', ReminderNotificationViewSet.as_view({'post': 'mark_all_read'}), name='notifications-mark-all-read'),
    path('api/notifications/<int:pk>/', ReminderNotificationViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='notifications-detail'),
    path('api/notifications/<int:pk>/mark_read/', ReminderNotificationViewSet.as_view({'post': 'mark_read'}), name='notifications-mark-read'),
    
    # WebSocket URLs are handled by ASGI in asgi.py
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 