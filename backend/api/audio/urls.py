from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.audio_views import AudioFileViewSet

router = DefaultRouter()
router.register('', AudioFileViewSet, basename='audio')

urlpatterns = [
    path('', include(router.urls)),
] 