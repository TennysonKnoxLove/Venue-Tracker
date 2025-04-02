# Follow-Up Reminder System Implementation

## Overview
This document outlines the implementation of a follow-up reminder system that allows users to set reminders for venues they've contacted, providing notifications when it's time to follow up and tracking outreach history.

## Feature Requirements
- "Remind me to follow up" button on venue pages and email generator
- Notification system for tracking follow-up dates
- "View Outreach" tab to see all communications and pending reminders
- Windows 98 aesthetic for the interface

## Database Changes

### Contact Reminder Model
```python
class ContactReminder(models.Model):
    """Tracks reminders for venue follow-ups"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    venue = models.ForeignKey('venues.Venue', on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    venue_name = models.CharField(max_length=100)  # In case it's not in the venue database
    reminder_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['reminder_date', '-created_at']
    
    def __str__(self):
        return f"Follow up with {self.venue_name} on {self.reminder_date}"
```

## API Endpoints

### Reminder System Endpoints
- `GET /api/reminders/` - List all reminders for the user
- `POST /api/reminders/` - Create a new reminder
- `GET /api/reminders/<id>/` - Get a specific reminder
- `PUT /api/reminders/<id>/` - Update a reminder (e.g., mark as completed)
- `DELETE /api/reminders/<id>/` - Delete a reminder
- `GET /api/outreach/` - Get combined view of emails sent and reminders

## Backend Implementation

### Create Reminders App
```bash
# Create a new app for reminders
python manage.py startapp reminders

# Update settings.py to include the new app
# Add 'api.reminders' to INSTALLED_APPS
```

### Models
```python
# api/reminders/models.py
from django.db import models
from django.conf import settings

class ContactReminder(models.Model):
    """Tracks reminders for venue follow-ups"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    venue = models.ForeignKey('venues.Venue', on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    venue_name = models.CharField(max_length=100)
    reminder_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['reminder_date', '-created_at']
        
    def is_overdue(self):
        from datetime import date
        return self.reminder_date < date.today() and not self.completed
```

### Serializers
```python
# api/reminders/serializers.py
from rest_framework import serializers
from .models import ContactReminder

class ContactReminderSerializer(serializers.ModelSerializer):
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ContactReminder
        fields = ['id', 'venue', 'venue_name', 'reminder_date', 'notes', 
                  'created_at', 'completed', 'is_overdue']
        read_only_fields = ['id', 'created_at', 'is_overdue']
```

### Views
```python
# api/reminders/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import ContactReminder
from .serializers import ContactReminderSerializer
from api.email_generator.models import VenueOutreach
from api.email_generator.serializers import VenueOutreachSerializer

class ContactReminderViewSet(viewsets.ModelViewSet):
    """API endpoint for managing contact reminders"""
    serializer_class = ContactReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ContactReminder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def due_today(self, request):
        """Get reminders due today"""
        from datetime import date
        today = date.today()
        reminders = self.get_queryset().filter(reminder_date=today, completed=False)
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue reminders"""
        from datetime import date
        today = date.today()
        reminders = self.get_queryset().filter(reminder_date__lt=today, completed=False)
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)

class OutreachHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Combined view of emails and reminders"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        # Get both emails and reminders
        reminders = ContactReminder.objects.filter(user=request.user)
        reminder_serializer = ContactReminderSerializer(reminders, many=True)
        
        emails = VenueOutreach.objects.filter(user=request.user)
        email_serializer = VenueOutreachSerializer(emails, many=True)
        
        # Combine the data
        return Response({
            'reminders': reminder_serializer.data,
            'emails': email_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_venue(self, request):
        """Get outreach history grouped by venue"""
        venue_id = request.query_params.get('venue_id')
        venue_name = request.query_params.get('venue_name')
        
        # Filter by venue ID if provided
        if venue_id:
            reminders = ContactReminder.objects.filter(
                user=request.user, venue_id=venue_id
            )
            emails = VenueOutreach.objects.filter(
                user=request.user, venue_id=venue_id
            )
        # Otherwise filter by venue name
        elif venue_name:
            reminders = ContactReminder.objects.filter(
                user=request.user, venue_name=venue_name
            )
            emails = VenueOutreach.objects.filter(
                user=request.user, venue_name=venue_name
            )
        else:
            return Response(
                {"error": "Either venue_id or venue_name must be provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reminder_serializer = ContactReminderSerializer(reminders, many=True)
        email_serializer = VenueOutreachSerializer(emails, many=True)
        
        return Response({
            'reminders': reminder_serializer.data,
            'emails': email_serializer.data
        })
```

### URLs
```python
# api/reminders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactReminderViewSet, OutreachHistoryViewSet

router = DefaultRouter()
router.register(r'reminders', ContactReminderViewSet, basename='reminder')
router.register(r'outreach', OutreachHistoryViewSet, basename='outreach')

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
  
  // Get reminders due today
  getDueToday: async () => {
    try {
      const response = await apiClient.get('/reminders/due_today/');
      return response.data;
    } catch (error) {
      console.error('Error fetching due reminders:', error);
      throw error;
    }
  },
  
  // Get overdue reminders
  getOverdue: async () => {
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
  
  // Update a reminder
  updateReminder: async (id, reminderData) => {
    try {
      const response = await apiClient.put(`/reminders/${id}/`, reminderData);
      return response.data;
    } catch (error) {
      console.error('Error updating reminder:', error);
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
  },
  
  // Get combined outreach history
  getOutreachHistory: async () => {
    try {
      const response = await apiClient.get('/outreach/');
      return response.data;
    } catch (error) {
      console.error('Error fetching outreach history:', error);
      throw error;
    }
  },
  
  // Get outreach history for a specific venue
  getVenueOutreachHistory: async (venueId, venueName) => {
    try {
      let url = '/outreach/by_venue/?';
      if (venueId) {
        url += `venue_id=${venueId}`;
      } else if (venueName) {
        url += `venue_name=${encodeURIComponent(venueName)}`;
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching venue outreach history:', error);
      throw error;
    }
  }
};

export default reminderService;
```

### Components

#### ReminderButton.js
```jsx
import React, { useState } from 'react';
import Button from '../components/layout/Button';
import Window from '../components/layout/Window';
import Input from '../components/layout/Input';
import reminderService from '../api/reminderService';

const ReminderButton = ({ venueId, venueName }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    venue: venueId,
    venue_name: venueName,
    reminder_date: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await reminderService.createReminder(formData);
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to create reminder. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setShowForm(true)}
        className="bg-yellow-500 hover:bg-yellow-600"
      >
        Remind me to follow up
      </Button>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Window 
            title="Set Follow-up Reminder" 
            className="w-full max-w-md"
            onClose={() => setShowForm(false)}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Venue"
                value={formData.venue_name}
                readOnly
                disabled
              />
              
              <Input
                label="Follow-up Date"
                id="reminder_date"
                name="reminder_date"
                type="date"
                value={formData.reminder_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              
              <div>
                <label className="block mb-2 font-bold" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="What to follow up about"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={3}
                />
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Reminder set successfully!
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="bg-gray-400 hover:bg-gray-500"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isSubmitting ? 'Setting reminder...' : 'Set Reminder'}
                </Button>
              </div>
            </form>
          </Window>
        </div>
      )}
    </>
  );
};

export default ReminderButton;
```

#### OutreachPage.js
```jsx
import React, { useState, useEffect } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import reminderService from '../api/reminderService';
import { format } from 'date-fns';

const OutreachPage = () => {
  const [outreachData, setOutreachData] = useState({ emails: [], reminders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState(null);
  
  useEffect(() => {
    loadOutreachData();
  }, []);
  
  const loadOutreachData = async () => {
    setLoading(true);
    try {
      const data = await reminderService.getOutreachHistory();
      setOutreachData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load outreach history. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadVenueOutreach = async (venueId, venueName) => {
    setLoading(true);
    try {
      const data = await reminderService.getVenueOutreachHistory(venueId, venueName);
      setOutreachData(data);
      setSelectedVenue({ id: venueId, name: venueName });
      setError(null);
    } catch (err) {
      setError('Failed to load venue outreach history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      loadOutreachData();
      setSelectedVenue(null);
    }
  };
  
  const handleCompleteReminder = async (id) => {
    try {
      await reminderService.updateReminder(id, { completed: true });
      
      // Update the local state to reflect the change
      setOutreachData(prev => ({
        ...prev,
        reminders: prev.reminders.map(reminder => 
          reminder.id === id ? { ...reminder, completed: true } : reminder
        )
      }));
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    }
  };
  
  const renderReminders = () => {
    const reminders = outreachData.reminders || [];
    
    // Filter based on active tab
    let filteredReminders = reminders;
    if (activeTab === 'upcoming') {
      filteredReminders = reminders.filter(r => !r.completed && !r.is_overdue);
    } else if (activeTab === 'overdue') {
      filteredReminders = reminders.filter(r => !r.completed && r.is_overdue);
    } else if (activeTab === 'completed') {
      filteredReminders = reminders.filter(r => r.completed);
    }
    
    if (filteredReminders.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No reminders found
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredReminders.map(reminder => (
          <div 
            key={reminder.id} 
            className={`p-4 border ${reminder.is_overdue && !reminder.completed ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          >
            <div className="flex justify-between">
              <h3 className="font-bold">{reminder.venue_name}</h3>
              <span className={`text-sm ${reminder.is_overdue && !reminder.completed ? 'text-red-600 font-bold' : ''}`}>
                {format(new Date(reminder.reminder_date), 'MMM d, yyyy')}
                {reminder.is_overdue && !reminder.completed && ' (OVERDUE)'}
              </span>
            </div>
            
            {reminder.notes && (
              <p className="mt-2 text-gray-700">{reminder.notes}</p>
            )}
            
            <div className="mt-4 flex justify-end">
              {!reminder.completed && (
                <Button 
                  onClick={() => handleCompleteReminder(reminder.id)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderEmails = () => {
    const emails = outreachData.emails || [];
    
    if (emails.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No emails found
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {emails.map(email => (
          <div key={email.id} className="p-4 border border-gray-300">
            <div className="flex justify-between">
              <h3 className="font-bold">{email.venue_name}</h3>
              <span className="text-sm">
                {format(new Date(email.sent_date), 'MMM d, yyyy')}
              </span>
            </div>
            
            {email.event_date && (
              <p className="mt-1 text-sm">
                <span className="font-medium">Booking for:</span> {format(new Date(email.event_date), 'MMM d, yyyy')}
              </p>
            )}
            
            <div className="mt-3 border-t pt-2">
              <div className="bg-gray-50 p-2 mt-2 text-sm font-mono whitespace-pre-wrap">
                {email.email_content.length > 200 
                  ? `${email.email_content.substring(0, 200)}...` 
                  : email.email_content}
              </div>
              
              {email.email_content.length > 200 && (
                <button 
                  className="text-blue-600 hover:underline text-sm mt-1"
                  onClick={() => alert(email.email_content)} // Simple way to view full content
                >
                  View full email
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {selectedVenue ? `Outreach for ${selectedVenue.name}` : 'Outreach History'}
      </h2>
      
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}`}
          onClick={() => handleTabChange('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}`}
          onClick={() => handleTabChange('upcoming')}
        >
          Upcoming Reminders
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'overdue' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}`}
          onClick={() => handleTabChange('overdue')}
        >
          Overdue
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'completed' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}`}
          onClick={() => handleTabChange('completed')}
        >
          Completed
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'emails' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}`}
          onClick={() => handleTabChange('emails')}
        >
          Emails Sent
        </button>
      </div>
      
      {selectedVenue && (
        <div className="mb-4">
          <Button 
            onClick={() => {
              setSelectedVenue(null);
              loadOutreachData();
            }}
            className="text-sm"
          >
            ← Back to all venues
          </Button>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading outreach history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <Window title={activeTab === 'emails' ? 'Sent Emails' : 'Reminders'} className="mb-4">
          {activeTab === 'emails' ? renderEmails() : renderReminders()}
        </Window>
      )}
    </div>
  );
};

export default OutreachPage;
```

### Dashboard Notification Implementation
```jsx
// src/components/layout/Header.js
// Add this to the header component to show notifications for reminders

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reminderService from '../../api/reminderService';

const ReminderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    loadReminders();
    // Refresh notifications every hour
    const interval = setInterval(loadReminders, 3600000);
    return () => clearInterval(interval);
  }, []);
  
  const loadReminders = async () => {
    try {
      // Get both due today and overdue reminders
      const dueTodayPromise = reminderService.getDueToday();
      const overduePromise = reminderService.getOverdue();
      
      const [dueToday, overdue] = await Promise.all([dueTodayPromise, overduePromise]);
      
      // Combine and sort by date
      const allNotifications = [
        ...dueToday.map(r => ({ ...r, type: 'due_today' })),
        ...overdue.map(r => ({ ...r, type: 'overdue' }))
      ];
      
      setNotifications(allNotifications);
    } catch (err) {
      console.error('Failed to load reminder notifications:', err);
    }
  };
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="relative">
      <button
        className="relative p-2 bg-yellow-500 rounded-full"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="sr-only">Notifications</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        
        <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
          {notifications.length}
        </span>
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="p-2 border-b">
            <h3 className="font-bold">Reminders</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.map(notification => (
              <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notification.venue_name}</p>
                    <p className="text-sm text-gray-500">
                      {notification.type === 'due_today' ? 'Due today' : 'OVERDUE'}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {new Date(notification.reminder_date).toLocaleDateString()}
                  </span>
                </div>
                
                {notification.notes && (
                  <p className="mt-1 text-sm text-gray-600">{notification.notes}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-2 bg-gray-50 text-center">
            <Link 
              to="/outreach" 
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setShowDropdown(false)}
            >
              View all reminders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this component to your Header component
```

## Windows 98 Styling

Create a set of Windows 98-style components for the reminders feature:

1. Reminder Dialog:
```css
.win98-reminder-dialog {
  background-color: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5);
}

.win98-reminder-header {
  background: linear-gradient(to right, #000080, #1084d0);
  color: white;
  font-weight: bold;
  padding: 3px 5px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.win98-reminder-close {
  width: 20px;
  height: 20px;
  background-color: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.win98-reminder-body {
  padding: 10px;
}
```

2. Notification Icon:
```css
.win98-notification {
  position: relative;
  width: 24px;
  height: 24px;
  background-color: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  display: flex;
  align-items: center;
  justify-content: center;
}

.win98-notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #aa0000;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
}
```

## Integration Steps

### 1. Add to Venue and Email Generator Pages

Add the `ReminderButton` component to both the Venue detail page and the Email Generator page:

```jsx
// In VenueDetailPage.js - Add in the action buttons section
<ReminderButton venueId={venue.id} venueName={venue.name} />

// In EmailGeneratorPage.js - Add next to the save button
<ReminderButton venueName={formData.venue_name} venueId={formData.venue_id} />
```

### 2. Add Routing

Update the routing configuration to include the Outreach page:

```jsx
// Update routes in App.js or routing configuration
<Route path="/outreach" element={<OutreachPage />} />
```

### 3. Add to Navigation

Add the Outreach page link to the navigation menu:

```jsx
// In your navigation component
<NavLink to="/outreach">View Outreach</NavLink>
```

### 4. Database Migrations

Run migrations to create the necessary database tables:

```bash
python manage.py makemigrations reminders
python manage.py migrate reminders
```

## Testing Plan

1. Test creating reminders from various places in the app
2. Verify reminder notifications appear correctly
3. Test marking reminders as completed
4. Verify the filtering in the Outreach view works correctly
5. Test the integration with the email generator
6. Verify Windows 98 styling is consistent
7. Test with different dates (due today, future, overdue) 