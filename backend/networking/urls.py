from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NetworkingDiscoveryView, 
    EventViewSet, 
    EventTypeViewSet, 
    OpportunityViewSet,
    MilestoneViewSet
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'event-types', EventTypeViewSet, basename='event-type')
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')
router.register(r'milestones', MilestoneViewSet, basename='milestone')

urlpatterns = [
    path('opportunities-search/', NetworkingDiscoveryView.as_view(), name='networking-opportunities-search'),
    path('', include(router.urls)),
] 