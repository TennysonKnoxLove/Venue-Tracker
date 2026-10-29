from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    EventTypeViewSet,
    OpportunityViewSet,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'event-types', EventTypeViewSet, basename='event-type')
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')

urlpatterns = [
    path('', include(router.urls)),
] 