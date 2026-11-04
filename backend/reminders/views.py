from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Reminder, ReminderCategory
from .serializers import ReminderSerializer, ReminderCategorySerializer
from .services import mark_completed
import datetime

# Create your views here.

class ReminderViewSet(viewsets.ModelViewSet):
    """ViewSet for reminders"""
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'priority', 'created_at']
    
    def get_queryset(self):
        """Return reminders for the authenticated user"""
        return Reminder.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Get the data from the request
        data = request.data.copy()
        
        # Format date and time
        data = self._format_date_time(data)
            
        # Create serializer with formatted data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        # Get the data from the request
        data = request.data.copy()
        
        # Format date and time
        data = self._format_date_time(data)
            
        # Get the instance being updated
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Update the serializer with the modified data
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def _format_date_time(self, data):
        """Helper method to format date and time"""
        # Handle empty category value
        if 'category' in data and (data['category'] == '' or data['category'] is None):
            data['category'] = None
        
        # Check if both date and time were provided
        if 'due_date' in data and 'due_time' in data:
            # Combine date and time into a single datetime field
            date_str = data.get('due_date')
            time_str = data.get('due_time', '00:00')
            
            # Parse the date and time
            try:
                # Create a naive datetime object
                naive_dt = datetime.datetime.strptime(f"{date_str} {time_str}", '%Y-%m-%d %H:%M')
                # Make it timezone aware
                aware_dt = timezone.make_aware(naive_dt)
                # Convert to string in ISO format for serializer
                data['due_date'] = aware_dt.isoformat()
            except ValueError:
                # If there's an error parsing, just use the original string
                due_datetime_str = f"{date_str}T{time_str}"
                data['due_date'] = due_datetime_str
        
        # Remove the time field as it's not part of the model
        if 'due_time' in data:
            data.pop('due_time')
            
        return data
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark reminder as completed"""
        reminder = self.get_object()
        mark_completed(reminder)
        serializer = self.get_serializer(reminder)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Return overdue reminders"""
        overdue_reminders = Reminder.objects.filter(
            user=request.user,
            completed=False,
            due_date__lt=timezone.now()
        ).order_by('due_date')
        serializer = self.get_serializer(overdue_reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Return upcoming reminders"""
        # Get reminders due in the next 7 days
        upcoming_reminders = Reminder.objects.filter(
            user=request.user,
            completed=False,
            due_date__gte=timezone.now(),
            due_date__lte=timezone.now() + datetime.timedelta(days=7)
        ).order_by('due_date')
        serializer = self.get_serializer(upcoming_reminders, many=True)
        return Response(serializer.data)

class ReminderCategoryViewSet(viewsets.ModelViewSet):
    """API endpoint for managing reminder categories"""
    serializer_class = ReminderCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    
    def get_queryset(self):
        return ReminderCategory.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
