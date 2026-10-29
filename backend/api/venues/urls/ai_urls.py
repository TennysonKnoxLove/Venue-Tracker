from django.urls import path
from ..views.ai_views import VenueDiscoveryView, ImportSearchResultsView

urlpatterns = [
    path('discover/', VenueDiscoveryView.as_view(), name='venue-discovery'),
    path('searches/<int:pk>/import/', ImportSearchResultsView.as_view(), name='import-venues'),
]
