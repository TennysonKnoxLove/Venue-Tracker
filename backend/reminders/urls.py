from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderViewSet, ReminderNotificationViewSet, ReminderCategoryViewSet, debug_urls

# Debug print
print("DEBUG_URL_SETUP: Setting up reminders/urls.py router")

# Create a router for the main reminder endpoints
reminder_router = DefaultRouter()
reminder_router.register(r'', ReminderViewSet, basename='reminder')

# Separate categories and notifications from main router for better control
category_router = DefaultRouter()
category_router.register(r'', ReminderCategoryViewSet, basename='reminder-category')

notification_router = DefaultRouter()
notification_router.register(r'', ReminderNotificationViewSet, basename='reminder-notification')

# Debug print registered URLs
print(f"DEBUG_URL_SETUP: Categories URL pattern: {category_router.urls[1].pattern}")

# Add specific routes for reminders
urlpatterns = [
    # Include router URLs with explicit prefixes
    path('', include(reminder_router.urls)),
    path('categories/', include(category_router.urls)),
    path('notifications/', include(notification_router.urls)),
    
    # Direct action endpoints
    path('overdue/', ReminderViewSet.as_view({'get': 'overdue'}), name='reminder-overdue'),
    path('today/', ReminderViewSet.as_view({'get': 'today'}), name='reminder-today'),
    path('upcoming/', ReminderViewSet.as_view({'get': 'upcoming'}), name='reminder-upcoming'),
    
    # Debug view
    path('debug_urls/', debug_urls, name='debug-urls'),
]

# Debug print
print("DEBUG_URL_SETUP: Reminders URL setup complete with urlpatterns:", [str(pattern) for pattern in urlpatterns])

print("DEBUG_FIX: Reminders URL setup complete with categories endpoint explicitly defined") 