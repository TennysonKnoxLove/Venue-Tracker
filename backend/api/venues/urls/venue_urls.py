from django.urls import path
from ..views.venue_views import VenueList, VenueDetail, StateVenueList

urlpatterns = [
    path('', VenueList.as_view(), name='venue-list'),
    path('<int:pk>/', VenueDetail.as_view(), name='venue-detail'),
    path('states/<int:state_id>/venues/', StateVenueList.as_view(), name='state-venue-list'),
]
