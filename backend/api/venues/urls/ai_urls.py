from django.urls import path
from ..views.ai_views import VenueDiscoveryView, SearchHistoryListView, SearchResultsDetailView, ImportSearchResultsView

urlpatterns = [
    path('discover/', VenueDiscoveryView.as_view(), name='venue-discovery'),
    path('searches/', SearchHistoryListView.as_view(), name='search-history'),
    path('searches/<int:pk>/', SearchResultsDetailView.as_view(), name='search-results'),
    path('searches/<int:pk>/import/', ImportSearchResultsView.as_view(), name='import-venues'),
]
