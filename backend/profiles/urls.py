from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistProfileViewSet, SocialLinkViewSet

router = DefaultRouter()
router.register(r'profile', ArtistProfileViewSet, basename='profile')
router.register(r'social-links', SocialLinkViewSet, basename='social-links')

urlpatterns = [
    path('', include(router.urls)),
] 