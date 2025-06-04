from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, filters
from rest_framework.decorators import action
from .models import NetworkingSearchQuery, Event, EventType, EventAttendee, Opportunity, Milestone
from .serializers import (
    NetworkingSearchQuerySerializer, 
    EventSerializer,
    EventTypeSerializer,
    EventAttendeeSerializer,
    OpportunitySerializer,
    MilestoneSerializer
)
from network.models import NetworkContact
from utils.ai.openai_client import discover_networking
from django.db.models import Q, Value
from django.db import models
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class NetworkingDiscoveryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        state = request.data.get('state')
        city = request.data.get('city')
        radius = request.data.get('radius')
        
        if not all([state, city, radius]):
            return Response(
                {"error": "State, city, and radius are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Call OpenAI API for networking suggestions
        opportunities = discover_networking(state, city, radius)
        
        # Save the search query and results
        search_query = NetworkingSearchQuery.objects.create(
            user=request.user,
            state=state,
            city=city,
            radius=radius,
            results=opportunities
        )
        
        serializer = NetworkingSearchQuerySerializer(search_query)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def get(self, request):
        """Get user's previous networking searches"""
        searches = NetworkingSearchQuery.objects.filter(user=request.user)
        serializer = NetworkingSearchQuerySerializer(searches, many=True)
        return Response(serializer.data)

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
        """Override to add debugging for date and time data"""
        logger.info(f"Creating event with data: {serializer.validated_data}")
        # Log specific date/time fields for debugging
        if 'date' in serializer.validated_data:
            logger.info(f"Date field: {serializer.validated_data['date']}")
        if 'time' in serializer.validated_data:
            logger.info(f"Time field: {serializer.validated_data['time']}")
        if 'start_date' in serializer.validated_data:
            logger.info(f"Start date field: {serializer.validated_data['start_date']}")
        if 'end_date' in serializer.validated_data:
            logger.info(f"End date field: {serializer.validated_data['end_date']}")
            
        serializer.save(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Override to add debugging for date and time data"""
        logger.info(f"Updating event with data: {request.data}")
        # Log specific date/time fields for debugging
        if 'date' in request.data:
            logger.info(f"Date field: {request.data['date']}")
        if 'time' in request.data:
            logger.info(f"Time field: {request.data['time']}")
        if 'start_date' in request.data:
            logger.info(f"Start date field: {request.data['start_date']}")
        if 'end_date' in request.data:
            logger.info(f"End date field: {request.data['end_date']}")
            
        return super().update(request, *args, **kwargs)
    
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
        
    @action(detail=True, methods=['post'])
    def add_attendee(self, request, pk=None):
        """Add a contact as an attendee to this event"""
        event = self.get_object()
        contact_id = request.data.get('contact')
        notes = request.data.get('notes', '')
        
        if not contact_id:
            return Response(
                {"error": "Contact ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Verify the contact belongs to the current user
        contact = get_object_or_404(NetworkContact, id=contact_id, user=request.user)
        
        # Create or update the attendee
        attendee, created = EventAttendee.objects.update_or_create(
            event=event,
            contact=contact,
            defaults={'notes': notes}
        )
        
        serializer = EventAttendeeSerializer(attendee)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def remove_attendee(self, request, pk=None):
        """Remove a contact as an attendee from this event"""
        event = self.get_object()
        contact_id = request.data.get('contact')
        
        if not contact_id:
            return Response(
                {"error": "Contact ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Delete the attendee
        EventAttendee.objects.filter(event=event, contact_id=contact_id).delete()
        
        return Response({"status": "attendee removed"}, status=status.HTTP_200_OK)

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
        
    @action(detail=True, methods=['post'])
    def add_milestone(self, request, pk=None):
        """Add a milestone to this opportunity"""
        opportunity = self.get_object()
        milestone_data = {
            'opportunity': opportunity.id,
            'title': request.data.get('title'),
            'description': request.data.get('description', ''),
            'date': request.data.get('date'),
            'completed': request.data.get('completed', False)
        }
        
        if not milestone_data['title']:
            return Response(
                {"error": "Title is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = MilestoneSerializer(data=milestone_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MilestoneViewSet(viewsets.ModelViewSet):
    """API endpoint for managing opportunity milestones"""
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        """Return milestones for the current user's opportunities"""
        opportunity_id = self.request.query_params.get('opportunity')
        queryset = Milestone.objects.filter(opportunity__user=self.request.user)
        
        if opportunity_id:
            queryset = queryset.filter(opportunity_id=opportunity_id)
            
        return queryset
        
    @action(detail=True, methods=['post'])
    def toggle_completed(self, request, pk=None):
        """Toggle the completed status of a milestone"""
        milestone = self.get_object()
        milestone.completed = not milestone.completed
        milestone.save()
        
        serializer = self.get_serializer(milestone)
        return Response(serializer.data)
