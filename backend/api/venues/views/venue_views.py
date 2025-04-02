from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView

from ..models import Venue, State
from ..serializers import VenueSerializer

class VenueList(ListCreateAPIView):
    """View for listing and creating venues"""
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return venues belonging to the current user
        return Venue.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Ensure venue is associated with current user
        serializer.save(user=self.request.user)

class VenueDetail(RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting a venue"""
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return venues belonging to the current user
        return Venue.objects.filter(user=self.request.user)

class StateVenueList(ListAPIView):
    """View for listing venues for a specific state"""
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get state_id from URL
        state_id = self.kwargs.get('state_id')
        
        # Only return venues for the specific state and belonging to the current user
        return Venue.objects.filter(
            state_id=state_id,
            user=self.request.user
        ) 