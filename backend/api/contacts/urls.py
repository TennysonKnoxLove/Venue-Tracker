from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.contact_views import ContactHistoryViewSet

router = DefaultRouter()
router.register('', ContactHistoryViewSet, basename='contacts')

urlpatterns = [
    path('', include(router.urls)),
] 