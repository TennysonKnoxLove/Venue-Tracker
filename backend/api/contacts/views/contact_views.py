from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from ..models import ContactHistory
from ..serializers import ContactHistorySerializer, ContactHistoryDetailSerializer
from api.venues.models import Venue

class ContactHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing contact history entries"""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['venue__name', 'contact_person', 'notes']
    ordering_fields = ['contact_date', 'follow_up_date', 'created_at']
    
    def get_queryset(self):
        """Return contacts belonging to the authenticated user"""
        queryset = ContactHistory.objects.filter(user=self.request.user)
        
        # Filter by venue if specified
        venue_id = self.request.query_params.get('venue_id')
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
            
        # Filter by contact type if specified
        contact_type = self.request.query_params.get('contact_type')
        if contact_type:
            queryset = queryset.filter(contact_type=contact_type)
            
        # Filter by date range if specified
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(contact_date__range=[start_date, end_date])
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'retrieve':
            return ContactHistoryDetailSerializer
        return ContactHistorySerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new contact history entry"""
        # Check that the venue exists and belongs to the user
        venue_id = request.data.get('venue')
        try:
            venue = Venue.objects.get(id=venue_id, user=request.user)
        except Venue.DoesNotExist:
            return Response(
                {"error": "Venue not found or doesn't belong to you"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set a default contact date if not provided
        if 'contact_date' not in request.data:
            request.data['contact_date'] = timezone.now().isoformat()
            
        # Set a default follow-up date if not provided (7 days from contact date)
        if 'follow_up_date' not in request.data and request.data.get('contact_type') != 'other':
            follow_up_date = timezone.now() + timezone.timedelta(days=7)
            request.data['follow_up_date'] = follow_up_date.date().isoformat()
            
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def pending_followups(self, request):
        """Get contacts with pending follow-ups"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            follow_up_date__lte=today,
            follow_up_completed=False
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_followup(self, request, pk=None):
        """Mark follow-up as completed"""
        contact = self.get_object()
        contact.follow_up_completed = True
        contact.save()
        
        serializer = self.get_serializer(contact)
        return Response(serializer.data) 