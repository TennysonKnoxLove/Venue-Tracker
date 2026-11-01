from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, filters
from rest_framework.decorators import action
from .models import Event, EventType, Opportunity
from .serializers import (
    EventSerializer,
    EventTypeSerializer,
    OpportunitySerializer,
)

class EventViewSet(viewsets.ModelViewSet):
    """API endpoint for managing networking events"""
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        """Return events created by the current user"""
        return Event.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events (today or in the future)"""
        today = timezone.now().date()
        events = self.get_queryset().filter(date__gte=today).order_by('date', 'time')
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past events (before today)"""
        today = timezone.now().date()
        events = self.get_queryset().filter(date__lt=today).order_by('-date', 'time')
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

class EventTypeViewSet(viewsets.ModelViewSet):
    """API endpoint for managing event types"""
    queryset = EventType.objects.all()
    serializer_class = EventTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class OpportunityViewSet(viewsets.ModelViewSet):
    """API endpoint for managing networking opportunities"""
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'organization', 'description', 'location']
    ordering_fields = ['deadline', 'created_at', 'updated_at']
    
    def get_queryset(self):
        """Return opportunities created by the current user"""
        return Opportunity.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        """Save the user with the opportunity"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active opportunities"""
        active_statuses = ['active', 'interviewing', 'offer_received']
        opportunities = self.get_queryset().filter(status__in=active_statuses)
        serializer = self.get_serializer(opportunities, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def closed(self, request):
        """Get closed opportunities"""
        closed_statuses = ['accepted', 'declined', 'closed']
        opportunities = self.get_queryset().filter(status__in=closed_statuses)
        serializer = self.get_serializer(opportunities, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update the status of an opportunity"""
        opportunity = self.get_object()
        status_value = request.data.get('status')
        
        if not status_value:
            return Response(
                {"error": "Status is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Verify the status is valid
        valid_statuses = [s[0] for s in Opportunity.STATUS_CHOICES]
        if status_value not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        opportunity.status = status_value
        opportunity.save()
        
        serializer = self.get_serializer(opportunity)
        return Response(serializer.data)
