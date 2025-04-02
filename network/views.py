from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Industry, Connection, Interaction
from .serializers import (
    IndustrySerializer,
    ConnectionSerializer,
    ConnectionDetailSerializer,
    InteractionSerializer,
    InteractionDetailSerializer
)

class IndustryViewSet(viewsets.ModelViewSet):
    """ViewSet for the Industry model"""
    queryset = Industry.objects.all()
    serializer_class = IndustrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']

class ConnectionViewSet(viewsets.ModelViewSet):
    """ViewSet for the Connection model"""
    serializer_class = ConnectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'company', 'position', 'notes', 'location']
    ordering_fields = ['name', 'company', 'last_contact', 'date_met', 'created_at', 'updated_at']
    
    def get_queryset(self):
        """Return connections for the authenticated user"""
        return Connection.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return different serializers for list and detail views"""
        if self.action == 'retrieve':
            return ConnectionDetailSerializer
        return ConnectionSerializer
    
    def perform_create(self, serializer):
        """Set the user when creating a connection"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def record_interaction(self, request, pk=None):
        """Record a new interaction with this connection"""
        connection = self.get_object()
        
        # Create the interaction
        serializer = InteractionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(connection=connection)
            
            # Update last_contact date on the connection
            connection.last_contact = timezone.now().date()
            connection.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def due_for_followup(self, request):
        """Get connections that are due for a follow-up"""
        today = timezone.now().date()
        
        # Get connections with interactions marked for follow-up on or before today
        connections = self.get_queryset().filter(
            interactions__follow_up_date__lte=today,
            interactions__completed=False
        ).distinct()
        
        serializer = self.get_serializer(connections, many=True)
        return Response(serializer.data)

class InteractionViewSet(viewsets.ModelViewSet):
    """ViewSet for the Interaction model"""
    serializer_class = InteractionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['notes', 'follow_up_notes', 'interaction_type']
    ordering_fields = ['date', 'follow_up_date', 'created_at']
    
    def get_queryset(self):
        """Return interactions for the authenticated user's connections"""
        return Interaction.objects.filter(connection__user=self.request.user)
    
    def get_serializer_class(self):
        """Return different serializers for list and detail views"""
        if self.action == 'retrieve':
            return InteractionDetailSerializer
        return InteractionSerializer
    
    @action(detail=True, methods=['post'])
    def complete_followup(self, request, pk=None):
        """Mark a follow-up as completed"""
        interaction = self.get_object()
        interaction.completed = True
        interaction.save()
        serializer = self.get_serializer(interaction)
        return Response(serializer.data) 