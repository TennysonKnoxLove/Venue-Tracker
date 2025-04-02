from django.urls import path
from .views.state_views import StateList, StateDetail
from .views.venue_views import VenueList, VenueDetail, StateVenueList
from .views.ai_views import VenueDiscoveryView, SearchHistoryListView, SearchResultsDetailView, ImportSearchResultsView

urlpatterns = [
    # State endpoints
    path('states/', StateList.as_view(), name='state-list'),
    path('states/<int:pk>/', StateDetail.as_view(), name='state-detail'),
    
    # Venue endpoints
    path('venues/', VenueList.as_view(), name='venue-list'),
    path('venues/<int:pk>/', VenueDetail.as_view(), name='venue-detail'),
    path('states/<int:state_id>/venues/', StateVenueList.as_view(), name='state-venue-list'),
    
    # AI Discovery endpoints
    path('ai/discover/', VenueDiscoveryView.as_view(), name='venue-discovery'),
    path('ai/searches/', SearchHistoryListView.as_view(), name='search-history'),
    path('ai/searches/<int:pk>/', SearchResultsDetailView.as_view(), name='search-results'),
    path('ai/searches/<int:pk>/import/', ImportSearchResultsView.as_view(), name='import-venues'),
] 