from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VenueOutreachViewSet, generate_email

router = DefaultRouter()
router.register(r'outreach', VenueOutreachViewSet, basename='outreach')

urlpatterns = [
    path('', include(router.urls)),
    path('generate/', generate_email, name='generate-email'),
] 