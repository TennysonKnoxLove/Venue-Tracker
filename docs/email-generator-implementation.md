# Email Generator Implementation

## Overview
This document outlines the implementation of an email generator feature that crafts personalized outreach emails to venues based on the artist's profile data and specific booking details.

## Feature Requirements
- Form to input venue-specific details (name, desired booking date, etc.)
- Integration with artist profile data (bio, links, genres)
- OpenAI API integration for email generation
- Windows 98 visual aesthetic for the interface
- Ability to copy generated email text

## Database Changes

### Venue Outreach Model
```python
class VenueOutreach(models.Model):
    """Tracks email outreach to venues"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='outreach')
    venue = models.ForeignKey('venues.Venue', on_delete=models.CASCADE, related_name='outreach_history', null=True, blank=True)
    venue_name = models.CharField(max_length=100)  # In case it's not in the venue database
    email_content = models.TextField()
    sent_date = models.DateTimeField(auto_now_add=True)
    event_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-sent_date']
    
    def __str__(self):
        return f"Outreach to {self.venue_name} on {self.sent_date.strftime('%Y-%m-%d')}"
```

## API Endpoints

### Email Generator Endpoints
- `POST /api/email/generate/` - Generate an email based on profile and venue info
- `POST /api/email/save/` - Save an outreach email record
- `GET /api/email/history/` - Get outreach email history

## Backend Implementation

### Create Email Generator App
```bash
# Create a new app for email generation
python manage.py startapp email_generator

# Update settings.py to include the new app
# Add 'api.email_generator' to INSTALLED_APPS
```

### Email Generator Service
```python
# api/email_generator/services.py
import logging
from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

def generate_outreach_email(user, venue_data, profile_data):
    """
    Generate an email for venue outreach using OpenAI
    
    Args:
        user: The User object
        venue_data: Dictionary with venue info (name, date, etc.)
        profile_data: Dictionary with artist profile info
        
    Returns:
        str: Generated email text
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    # Build prompt with all available information
    prompt = f"""
    Create a professional email to book a performance at a music venue. 
    
    ARTIST INFORMATION:
    - Artist Name: {profile_data.get('artist_name', user.username)}
    - Bio: {profile_data.get('bio', 'N/A')}
    - Genres: {', '.join(profile_data.get('genres', []))}
    
    ARTIST LINKS:
    {format_links(profile_data.get('social_links', []))}
    
    VENUE INFORMATION:
    - Venue Name: {venue_data.get('venue_name', 'the venue')}
    - Desired Performance Date: {venue_data.get('event_date', 'a date to be determined')}
    
    ADDITIONAL NOTES:
    {venue_data.get('notes', '')}
    
    Write a professional, concise, and personable email to introduce myself and request a booking. 
    Don't be too wordy but include all relevant information.
    Make sure to briefly mention my music style, relevant experience, and why I'd be a good fit for this venue.
    Include a call to action at the end.
    Format it as plain text ready to copy into an email client.
    """
    
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating email with OpenAI: {e}")
        return "Failed to generate email. Please try again later."

def format_links(links):
    """Format social links for the prompt"""
    if not links:
        return "No social links provided"
    
    formatted = []
    for link in links:
        formatted.append(f"- {link.get('label', 'Link')}: {link.get('url', '')}")
    
    return "\n".join(formatted)
```

### Models
```python
# api/email_generator/models.py
from django.db import models
from django.conf import settings

class VenueOutreach(models.Model):
    """Tracks email outreach to venues"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='outreach')
    venue = models.ForeignKey('venues.Venue', on_delete=models.CASCADE, related_name='outreach_history', null=True, blank=True)
    venue_name = models.CharField(max_length=100)
    email_content = models.TextField()
    sent_date = models.DateTimeField(auto_now_add=True)
    event_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-sent_date']
```

### Serializers
```python
# api/email_generator/serializers.py
from rest_framework import serializers
from .models import VenueOutreach

class VenueOutreachSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueOutreach
        fields = ['id', 'venue', 'venue_name', 'email_content', 'sent_date', 'event_date', 'notes']
        read_only_fields = ['id', 'sent_date']

class EmailGenerationSerializer(serializers.Serializer):
    venue_name = serializers.CharField(required=True)
    event_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
```

### Views
```python
# api/email_generator/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import VenueOutreach
from .serializers import VenueOutreachSerializer, EmailGenerationSerializer
from .services import generate_outreach_email
from api.profiles.models import ArtistProfile
from api.venues.models import Venue

class EmailGeneratorViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate an email based on profile and venue info"""
        serializer = EmailGenerationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user profile data
        profile, created = ArtistProfile.objects.get_or_create(user=request.user)
        profile_data = {
            'artist_name': profile.artist_name,
            'bio': profile.bio,
            'genres': profile.genres,
            'social_links': list(profile.social_links.all().values('label', 'url'))
        }
        
        # Get venue data
        venue_data = serializer.validated_data
        
        # Generate email
        email_content = generate_outreach_email(request.user, venue_data, profile_data)
        
        return Response({
            'email_content': email_content,
            'venue_data': venue_data
        })
    
    @action(detail=False, methods=['post'])
    def save(self, request):
        """Save an outreach email record"""
        serializer = VenueOutreachSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the outreach record
        outreach = serializer.save(user=request.user)
        
        # If venue ID is provided, link to the venue
        venue_id = request.data.get('venue_id')
        if venue_id:
            try:
                venue = Venue.objects.get(id=venue_id, user=request.user)
                outreach.venue = venue
                outreach.save()
            except Venue.DoesNotExist:
                pass
        
        return Response(VenueOutreachSerializer(outreach).data, status=status.HTTP_201_CREATED)

class OutreachHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """View outreach email history"""
    serializer_class = VenueOutreachSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VenueOutreach.objects.filter(user=self.request.user)
```

### URLs
```python
# api/email_generator/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmailGeneratorViewSet, OutreachHistoryViewSet

router = DefaultRouter()
router.register(r'email', EmailGeneratorViewSet, basename='email')
router.register(r'email/history', OutreachHistoryViewSet, basename='email-history')

urlpatterns = [
    path('', include(router.urls)),
]

# Include in main urls.py:
# path('api/', include('api.email_generator.urls')),
```

## Frontend Implementation

### API Service
```javascript
// src/api/emailService.js
import apiClient from './client';

const emailService = {
  // Generate an email
  generateEmail: async (venueData) => {
    try {
      const response = await apiClient.post('/email/generate/', venueData);
      return response.data;
    } catch (error) {
      console.error('Error generating email:', error);
      throw error;
    }
  },
  
  // Save an outreach record
  saveOutreach: async (outreachData) => {
    try {
      const response = await apiClient.post('/email/save/', outreachData);
      return response.data;
    } catch (error) {
      console.error('Error saving outreach:', error);
      throw error;
    }
  },
  
  // Get outreach history
  getOutreachHistory: async () => {
    try {
      const response = await apiClient.get('/email/history/');
      return response.data;
    } catch (error) {
      console.error('Error fetching outreach history:', error);
      throw error;
    }
  }
};

export default emailService;
```

### Components

#### EmailGeneratorPage.js
```jsx
import React, { useState, useEffect } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import { emailService } from '../api/emailService';
import { venueService } from '../api/venueService';

const EmailGeneratorPage = () => {
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    venue_id: '',
    venue_name: '',
    event_date: '',
    notes: ''
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  // Load user's venues
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const venuesData = await venueService.getVenues();
        setVenues(venuesData);
      } catch (err) {
        console.error('Failed to load venues:', err);
      }
    };
    
    loadVenues();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'venue_id' && value) {
      // When venue is selected from dropdown, populate the venue name
      const selectedVenue = venues.find(venue => venue.id === parseInt(value));
      if (selectedVenue) {
        setFormData(prev => ({
          ...prev,
          venue_id: value,
          venue_name: selectedVenue.name
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Generate email with AI
  const handleGenerateEmail = async (e) => {
    e.preventDefault();
    
    if (!formData.venue_name) {
      setError('Please enter a venue name');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await emailService.generateEmail(formData);
      setGeneratedEmail(result.email_content);
    } catch (err) {
      setError('Failed to generate email. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save the outreach record
  const handleSaveOutreach = async () => {
    if (!generatedEmail || !formData.venue_name) return;
    
    setIsSaving(true);
    
    try {
      await emailService.saveOutreach({
        ...formData,
        email_content: generatedEmail
      });
      
      // Show a success message or notification
      alert('Email saved to outreach history!');
    } catch (err) {
      setError('Failed to save outreach record');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Copy email to clipboard
  const handleCopyEmail = () => {
    if (!generatedEmail) return;
    
    navigator.clipboard.writeText(generatedEmail)
      .then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Email Generator</h2>
      
      <Window title="Venue Information" className="mb-4">
        <form onSubmit={handleGenerateEmail}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-bold" htmlFor="venue_id">Select Venue (Optional)</label>
              <select
                id="venue_id"
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded"
              >
                <option value="">-- Select a venue --</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} ({venue.city}, {venue.state.abbreviation})
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              label="Venue Name"
              id="venue_name"
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              placeholder="Enter venue name"
              required
            />
            
            <Input
              label="Desired Performance Date (Optional)"
              id="event_date"
              name="event_date"
              type="date"
              value={formData.event_date}
              onChange={handleChange}
            />
            
            <div>
              <label className="block mb-2 font-bold" htmlFor="notes">Additional Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any other information to include in the email"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Email'}
              </Button>
            </div>
          </div>
        </form>
      </Window>
      
      {generatedEmail && (
        <Window title="Generated Email" className="mb-4">
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 whitespace-pre-wrap font-mono text-sm border">
              {generatedEmail}
            </div>
            
            <div className="flex justify-between">
              <div className="relative">
                <Button onClick={handleCopyEmail}>
                  Copy to Clipboard
                </Button>
                
                {showCopiedMessage && (
                  <div className="absolute top-full left-0 mt-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                    Copied!
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleSaveOutreach}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSaving ? 'Saving...' : 'Save to Outreach History'}
              </Button>
            </div>
          </div>
        </Window>
      )}
    </div>
  );
};

export default EmailGeneratorPage;
```

## Windows 98 Styling Additions

To maintain the Windows 98 aesthetic for the email generator:

1. Style the email output area to resemble a Windows 98 Notepad window:
```css
.email-notepad {
  background-color: white;
  border: inset 2px #dfdfdf;
  font-family: 'Courier New', monospace;
  padding: 8px;
}
```

2. Add a Windows 98 style "Copy" button with proper beveled edges:
```css
.win98-button {
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  background-color: #c0c0c0;
  padding: 4px 8px;
  font-family: 'MS Sans Serif', Arial, sans-serif;
  font-size: 11px;
  color: black;
}

.win98-button:active {
  border-top: 2px solid #404040;
  border-left: 2px solid #404040;
  border-right: 2px solid #dfdfdf;
  border-bottom: 2px solid #dfdfdf;
}
```

## Integration with Profile Data

The email generator automatically pulls data from the user's artist profile:

1. Artist name and bio are used to introduce the artist
2. Social media links are included as proof of the artist's online presence
3. Musical genres help to position the artist within the venue's programming

## Migration Steps

1. Run migrations to create the new database tables:
```bash
python manage.py makemigrations email_generator
python manage.py migrate email_generator
```

2. Add the email generator page to the frontend routing:
```jsx
// Update routes in App.js or routing configuration
<Route path="/email-generator" element={<EmailGeneratorPage />} />
```

3. Add the email generator link to the navigation menu:
```jsx
// In your navigation component
<NavLink to="/email-generator">Email Generator</NavLink>
```

## Testing Plan

1. Test email generation with various inputs
2. Verify integration with the OpenAI API
3. Test saving outreach records
4. Verify the copy to clipboard functionality
5. Test with and without venue selection
6. Verify Windows 98 styling consistency
7. Test with both complete and partial profile data 