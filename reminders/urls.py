from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.ReminderCategoryViewSet, basename='reminder-category')
router.register(r'reminders', views.ReminderViewSet, basename='reminder')
router.register(r'notifications', views.ReminderNotificationViewSet, basename='reminder-notification')

urlpatterns = [
    path('', include(router.urls)),
] 