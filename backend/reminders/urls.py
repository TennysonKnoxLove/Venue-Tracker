from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderViewSet

reminder_router = DefaultRouter()
reminder_router.register(r'', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('', include(reminder_router.urls)),
    path('overdue/', ReminderViewSet.as_view({'get': 'overdue'}), name='reminder-overdue'),
    path('today/', ReminderViewSet.as_view({'get': 'today'}), name='reminder-today'),
    path('upcoming/', ReminderViewSet.as_view({'get': 'upcoming'}), name='reminder-upcoming'),
]
