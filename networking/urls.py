from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.NetworkingEventViewSet, basename='networking-event')
router.register(r'opportunities', views.NetworkingOpportunityViewSet, basename='networking-opportunity')
router.register(r'attendees', views.EventAttendeeViewSet, basename='event-attendee')
router.register(r'milestones', views.ApplicationMilestoneViewSet, basename='application-milestone')

urlpatterns = [
    path('', include(router.urls)),
] 