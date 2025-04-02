# Enhanced Notification System

## Overview
This document outlines the implementation of an enhanced notification system that expands beyond venue follow-ups to allow for general purpose reminders with customizable frequency.

## Feature Requirements
- General purpose reminder creation
- Customizable notification frequency
- Support for various reminder types
- Windows 98 visual aesthetic

## Database Changes

### Reminder Model
```python
class Reminder(models.Model):
    """General purpose reminder system"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    completed = models.BooleanField(default=False)
    recurrence = models.CharField(max_length=20, choices=[
        ('none', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom')
    ], default='none')
    custom_days = models.IntegerField(null=True, blank=True)  # For custom recurrence
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_date', 'created_at']
    
    def __str__(self):
        return f"{self.title} - Due: {self.due_date}"
    
    def is_overdue(self):
        """Check if reminder is overdue"""
        return not self.completed and self.due_date < datetime.date.today()
    
    def create_next_reminder(self):
        """Create the next reminder based on recurrence pattern"""
        if self.recurrence == 'none' or not self.completed:
            return None
            
        next_due_date = None
        if self.recurrence == 'daily':
            next_due_date = self.due_date + datetime.timedelta(days=1)
        elif self.recurrence == 'weekly':
            next_due_date = self.due_date + datetime.timedelta(days=7)
        elif self.recurrence == 'monthly':
            # Add a month to the date
            month = self.due_date.month + 1
            year = self.due_date.year
            if month > 12:
                month = 1
                year += 1
            next_due_date = datetime.date(year, month, min(self.due_date.day, calendar.monthrange(year, month)[1]))
        elif self.recurrence == 'custom' and self.custom_days:
            next_due_date = self.due_date + datetime.timedelta(days=self.custom_days)
            
        if next_due_date:
            return Reminder.objects.create(
                user=self.user,
                title=self.title,
                description=self.description,
                due_date=next_due_date,
                recurrence=self.recurrence,
                custom_days=self.custom_days
            )
        return None
```

## API Endpoints

### Reminder Endpoints
- `GET /api/reminders/` - List all reminders
- `POST /api/reminders/` - Create a new reminder
- `GET /api/reminders/:id/` - Get reminder details
- `PUT /api/reminders/:id/` - Update a reminder
- `DELETE /api/reminders/:id/` - Delete a reminder
- `POST /api/reminders/:id/complete/` - Mark reminder as complete
- `GET /api/reminders/overdue/` - Get overdue reminders

## Backend Implementation

### Create Notifications App
```bash
# Create a new app for reminders
python manage.py startapp reminders

# Update settings.py to include the new app
# Add 'api.reminders' to INSTALLED_APPS
```

### Serializers
```python
# api/reminders/serializers.py
from rest_framework import serializers
from .models import Reminder

class ReminderSerializer(serializers.ModelSerializer):
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Reminder
        fields = [
            'id', 'title', 'description', 'due_date', 'completed',
            'recurrence', 'custom_days', 'is_overdue', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### Views
```python
# api/reminders/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Reminder
from .serializers import ReminderSerializer

class ReminderViewSet(viewsets.ModelViewSet):
    """API endpoint for managing reminders"""
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'updated_at']
    
    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        reminder = self.get_object()
        reminder.completed = True
        reminder.save()
        
        # Create next reminder if it's recurring
        next_reminder = reminder.create_next_reminder()
        
        serializer = self.get_serializer(reminder)
        return Response({
            'reminder': serializer.data,
            'next_reminder': self.get_serializer(next_reminder).data if next_reminder else None
        })
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        today = timezone.now().date()
        overdue = self.get_queryset().filter(
            completed=False,
            due_date__lt=today
        )
        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)
```

### URLs
```python
# api/reminders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderViewSet

router = DefaultRouter()
router.register(r'reminders', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('', include(router.urls)),
]

# Include in main urls.py:
# path('api/', include('api.reminders.urls')),
```

## Frontend Implementation

### API Service
```javascript
// src/api/reminderService.js
import apiClient from './client';

const reminderService = {
  // Get all reminders
  getReminders: async () => {
    try {
      const response = await apiClient.get('/reminders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },
  
  // Get overdue reminders
  getOverdueReminders: async () => {
    try {
      const response = await apiClient.get('/reminders/overdue/');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue reminders:', error);
      throw error;
    }
  },
  
  // Create a new reminder
  createReminder: async (reminderData) => {
    try {
      const response = await apiClient.post('/reminders/', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },
  
  // Complete a reminder
  completeReminder: async (id) => {
    try {
      const response = await apiClient.post(`/reminders/${id}/complete/`);
      return response.data;
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  },
  
  // Delete a reminder
  deleteReminder: async (id) => {
    try {
      await apiClient.delete(`/reminders/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
};

export default reminderService;
```

## Integration Steps

1. Run migrations to create the new database tables:
```bash
python manage.py makemigrations reminders
python manage.py migrate reminders
```

2. Add the reminders routes to the frontend routing:
```jsx
// Update routes in App.js or routing configuration
<Route path="/reminders" element={<RemindersPage />} />
```

3. Add the reminders link to the navigation menu:
```jsx
// In your navigation component
<NavLink to="/reminders">Reminders</NavLink>
```

## Migration from Existing Follow-up System

To migrate the existing venue follow-up system to the new general-purpose reminder system:

1. Create a data migration script:
```python
from django.db import migrations
from django.utils import timezone

def migrate_followups_to_reminders(apps, schema_editor):
    ContactHistory = apps.get_model('contacts', 'ContactHistory')
    Reminder = apps.get_model('reminders', 'Reminder')
    
    # Get all contact histories with pending follow-ups
    pending_followups = ContactHistory.objects.filter(
        follow_up_date__isnull=False,
        follow_up_completed=False
    )
    
    # Create a reminder for each pending follow-up
    for followup in pending_followups:
        venue = followup.venue
        Reminder.objects.create(
            user=followup.user,
            title=f"Follow up with {venue.name}",
            description=f"Follow up after {followup.contact_type} contact on {followup.contact_date.strftime('%Y-%m-%d')}. Notes: {followup.notes}",
            due_date=followup.follow_up_date,
            completed=False,
            recurrence='none'
        )

class Migration(migrations.Migration):
    dependencies = [
        ('reminders', '0001_initial'),
        ('contacts', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(migrate_followups_to_reminders),
    ]
``` 