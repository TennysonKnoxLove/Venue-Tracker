from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import NetworkingEvent, NetworkingOpportunity, EventAttendee, ApplicationMilestone
from network.models import Connection
from .serializers import (
    NetworkingEventSerializer,
    NetworkingEventDetailSerializer,
    NetworkingOpportunitySerializer,
    NetworkingOpportunityDetailSerializer,
    EventAttendeeSerializer,
    ApplicationMilestoneSerializer
)

class NetworkingEventViewSet(viewsets.ModelViewSet):
    """ViewSet for networking events"""
    serializer_class = NetworkingEventSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'description', 'notes']
    ordering_fields = ['start_date', 'end_date', 'created_at', 'name']
    
    def get_queryset(self):
        """Return events for the authenticated user"""
        queryset = NetworkingEvent.objects.filter(user=self.request.user)
        
        # Filter by event type if provided
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
            
        # Filter by date range
        start_after = self.request.query_params.get('start_after')
        if start_after:
            queryset = queryset.filter(start_date__gte=start_after)
            
        start_before = self.request.query_params.get('start_before')
        if start_before:
            queryset = queryset.filter(start_date__lte=start_before)
        
        # Filter by industry
        industry_id = self.request.query_params.get('industry')
        if industry_id:
            queryset = queryset.filter(industries__id=industry_id)
            
        # Filter by virtual status
        virtual = self.request.query_params.get('virtual')
        if virtual is not None:
            is_virtual = virtual.lower() == 'true'
            queryset = queryset.filter(virtual=is_virtual)
            
        # Filter by registration status
        registered = self.request.query_params.get('registered')
        if registered is not None:
            is_registered = registered.lower() == 'true'
            queryset = queryset.filter(registered=is_registered)
            
        return queryset
    
    def get_serializer_class(self):
        """Return different serializers for list and detail views"""
        if self.action == 'retrieve':
            return NetworkingEventDetailSerializer
        return NetworkingEventSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        now = timezone.now()
        events = self.get_queryset().filter(start_date__gte=now)
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past events"""
        now = timezone.now()
        events = self.get_queryset().filter(end_date__lt=now)
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def add_attendee(self, request, pk=None):
        """Add an attendee to the event"""
        event = self.get_object()
        
        # Validate connection belongs to the user
        connection_id = request.data.get('connection')
        try:
            connection = Connection.objects.get(id=connection_id, user=request.user)
        except Connection.DoesNotExist:
            return Response(
                {'detail': 'Connection not found or does not belong to you'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if attendee already exists
        if EventAttendee.objects.filter(event=event, connection=connection).exists():
            return Response(
                {'detail': 'This connection is already an attendee'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create the attendee
        attendee_data = {
            'event': event.id,
            'connection': connection.id,
            'notes': request.data.get('notes', '')
        }
        
        serializer = EventAttendeeSerializer(data=attendee_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def remove_attendee(self, request, pk=None):
        """Remove an attendee from the event"""
        event = self.get_object()
        connection_id = request.data.get('connection')
        
        try:
            attendee = EventAttendee.objects.get(event=event, connection_id=connection_id)
            attendee.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except EventAttendee.DoesNotExist:
            return Response(
                {'detail': 'Attendee not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class NetworkingOpportunityViewSet(viewsets.ModelViewSet):
    """ViewSet for networking opportunities"""
    serializer_class = NetworkingOpportunitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'organization', 'description', 'requirements', 'notes']
    ordering_fields = ['created_at', 'deadline', 'date_posted']
    
    def get_queryset(self):
        """Return opportunities for the authenticated user"""
        queryset = NetworkingOpportunity.objects.filter(user=self.request.user)
        
        # Filter by opportunity type if provided
        opportunity_type = self.request.query_params.get('opportunity_type')
        if opportunity_type:
            queryset = queryset.filter(opportunity_type=opportunity_type)
            
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        # Filter by deadline
        deadline_before = self.request.query_params.get('deadline_before')
        if deadline_before:
            queryset = queryset.filter(deadline__lte=deadline_before)
            
        deadline_after = self.request.query_params.get('deadline_after')
        if deadline_after:
            queryset = queryset.filter(deadline__gte=deadline_after)
            
        # Filter by remote status
        remote = self.request.query_params.get('remote')
        if remote is not None:
            is_remote = remote.lower() == 'true'
            queryset = queryset.filter(remote=is_remote)
            
        # Filter by contact
        contact_id = self.request.query_params.get('contact')
        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)
            
        return queryset
    
    def get_serializer_class(self):
        """Return different serializers for list and detail views"""
        if self.action == 'retrieve':
            return NetworkingOpportunityDetailSerializer
        return NetworkingOpportunitySerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active opportunities"""
        opportunities = self.get_queryset().filter(
            Q(status='active') | Q(status='applied') | Q(status='interviewing') | Q(status='offered')
        )
        serializer = self.get_serializer(opportunities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def closed(self, request):
        """Get closed opportunities"""
        opportunities = self.get_queryset().filter(
            Q(status='accepted') | Q(status='rejected') | Q(status='expired') | Q(status='closed')
        )
        serializer = self.get_serializer(opportunities, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update the status of an opportunity"""
        opportunity = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in dict(NetworkingOpportunity.STATUS_CHOICES):
            return Response(
                {'detail': 'Invalid or missing status parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        opportunity.status = new_status
        opportunity.save()
        serializer = self.get_serializer(opportunity)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_milestone(self, request, pk=None):
        """Add a milestone to the opportunity"""
        opportunity = self.get_object()
        
        # Create the milestone
        milestone_data = {
            'opportunity': opportunity.id,
            'date': request.data.get('date'),
            'title': request.data.get('title'),
            'description': request.data.get('description', ''),
            'completed': request.data.get('completed', False)
        }
        
        serializer = ApplicationMilestoneSerializer(data=milestone_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EventAttendeeViewSet(viewsets.ModelViewSet):
    """ViewSet for event attendees"""
    serializer_class = EventAttendeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return attendees for the authenticated user's events"""
        return EventAttendee.objects.filter(event__user=self.request.user)

class ApplicationMilestoneViewSet(viewsets.ModelViewSet):
    """ViewSet for application milestones"""
    serializer_class = ApplicationMilestoneSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return milestones for the authenticated user's opportunities"""
        return ApplicationMilestone.objects.filter(opportunity__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_completed(self, request, pk=None):
        """Toggle the completed status of a milestone"""
        milestone = self.get_object()
        milestone.completed = not milestone.completed
        milestone.save()
        serializer = self.get_serializer(milestone)
        return Response(serializer.data) 