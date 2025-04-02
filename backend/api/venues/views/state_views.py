from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models import State
from ..serializers import StateSerializer

class StateList(ListCreateAPIView):
    """View for listing and creating states"""
    serializer_class = StateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return states belonging to the current user
        return State.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Ensure state is associated with current user
        serializer.save(user=self.request.user)

class StateDetail(RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating and deleting a state"""
    serializer_class = StateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return states belonging to the current user
        return State.objects.filter(user=self.request.user) 