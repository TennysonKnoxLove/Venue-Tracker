# Artist Profile Implementation

## Overview
This document outlines the implementation of an artist profile page that allows users to add their artist name, bio, social media links, and musical genres, all within a Windows 98 visual aesthetic.

## Feature Requirements
- Artist name and bio input fields
- Dynamic social media link system (label + URL pairs)
- Genre selection with predefined options and custom input
- Windows 98 visual aesthetic
- Database storage for profile information

## Database Changes

### Profile Model
```python
class ArtistProfile(models.Model):
    """Extended profile information for artists"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='artist_profile')
    artist_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    genres = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.artist_name or self.user.username}'s Profile"
```

### Social Link Model
```python
class SocialLink(models.Model):
    """Represents a social media or web link for an artist profile"""
    profile = models.ForeignKey(ArtistProfile, on_delete=models.CASCADE, related_name='social_links')
    label = models.CharField(max_length=50)
    url = models.URLField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        
    def __str__(self):
        return f"{self.label} - {self.profile.artist_name}"
```

## API Endpoints

### Profile Endpoints
- `GET /api/profile/` - Get current user's profile
- `POST /api/profile/` - Create or update profile
- `PATCH /api/profile/` - Partially update profile

### Social Links Endpoints
- `GET /api/profile/social-links/` - Get all social links for current user
- `POST /api/profile/social-links/` - Add a new social link
- `PUT /api/profile/social-links/:id/` - Update a social link
- `DELETE /api/profile/social-links/:id/` - Delete a social link
- `POST /api/profile/social-links/reorder/` - Reorder social links

## Backend Implementation

### Create Profile App
```bash
# Create a new app for user profiles
python manage.py startapp profiles

# Update settings.py to include the new app
# Add 'api.profiles' to INSTALLED_APPS
```

### Serializers
```python
# api/profiles/serializers.py
from rest_framework import serializers
from .models import ArtistProfile, SocialLink

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'label', 'url', 'order']
        read_only_fields = ['id']

class ArtistProfileSerializer(serializers.ModelSerializer):
    social_links = SocialLinkSerializer(many=True, read_only=True)
    
    class Meta:
        model = ArtistProfile
        fields = ['id', 'artist_name', 'bio', 'genres', 'social_links']
        read_only_fields = ['id']
        
    def create(self, validated_data):
        user = self.context['request'].user
        profile, created = ArtistProfile.objects.get_or_create(user=user)
        
        for field, value in validated_data.items():
            setattr(profile, field, value)
        
        profile.save()
        return profile
```

### Views
```python
# api/profiles/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ArtistProfile, SocialLink
from .serializers import ArtistProfileSerializer, SocialLinkSerializer

class ArtistProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ArtistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ArtistProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Get or create profile for current user
        profile, created = ArtistProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    # Override list to return only the user's profile
    def list(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

class SocialLinkViewSet(viewsets.ModelViewSet):
    serializer_class = SocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SocialLink.objects.filter(profile__user=self.request.user)
    
    def perform_create(self, serializer):
        profile, created = ArtistProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        links_order = request.data.get('links_order', [])
        if not links_order:
            return Response(
                {"error": "No links order provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        for idx, link_id in enumerate(links_order):
            try:
                link = SocialLink.objects.get(
                    id=link_id, 
                    profile__user=request.user
                )
                link.order = idx
                link.save()
            except SocialLink.DoesNotExist:
                pass
        
        return Response(
            {"success": "Links reordered successfully"},
            status=status.HTTP_200_OK
        )
```

### URLs
```python
# api/profiles/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistProfileViewSet, SocialLinkViewSet

router = DefaultRouter()
router.register(r'profile', ArtistProfileViewSet, basename='profile')
router.register(r'profile/social-links', SocialLinkViewSet, basename='social-links')

urlpatterns = [
    path('', include(router.urls)),
]

# Include in main urls.py:
# path('api/', include('api.profiles.urls')),
```

## Frontend Implementation

### Components

#### ProfilePage.js
```jsx
import React, { useState, useEffect } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import { profileService } from '../api/profileService';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    artist_name: '',
    bio: '',
    genres: []
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [genres, setGenres] = useState([]);
  const [customGenre, setCustomGenre] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Predefined genre options
  const genreOptions = [
    'Hip-Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 
    'Classical', 'Country', 'Folk', 'Metal', 'Punk', 
    'Indie', 'Soul', 'Blues', 'Reggae', 'Disco', 'House'
  ];
  
  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile();
        setProfile({
          artist_name: profileData.artist_name || '',
          bio: profileData.bio || '',
          genres: profileData.genres || []
        });
        
        const linksData = await profileService.getSocialLinks();
        setSocialLinks(linksData);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle genre selection
  const handleGenreToggle = (genre) => {
    if (profile.genres.includes(genre)) {
      setProfile(prev => ({
        ...prev,
        genres: prev.genres.filter(g => g !== genre)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
    }
  };
  
  // Add custom genre
  const handleAddCustomGenre = () => {
    if (customGenre && !profile.genres.includes(customGenre)) {
      setProfile(prev => ({
        ...prev,
        genres: [...prev.genres, customGenre]
      }));
      setCustomGenre('');
    }
  };
  
  // Handle social link form changes
  const handleNewLinkChange = (e) => {
    const { name, value } = e.target;
    setNewLink(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new social link
  const handleAddLink = async () => {
    if (newLink.label && newLink.url) {
      try {
        const addedLink = await profileService.addSocialLink(newLink);
        setSocialLinks([...socialLinks, addedLink]);
        setNewLink({ label: '', url: '' });
      } catch (err) {
        setError('Failed to add social link');
        console.error(err);
      }
    }
  };
  
  // Delete social link
  const handleDeleteLink = async (id) => {
    try {
      await profileService.deleteSocialLink(id);
      setSocialLinks(socialLinks.filter(link => link.id !== id));
    } catch (err) {
      setError('Failed to delete social link');
      console.error(err);
    }
  };
  
  // Save profile
  const handleSaveProfile = async () => {
    try {
      await profileService.updateProfile(profile);
      alert('Profile saved successfully!');
    } catch (err) {
      setError('Failed to save profile');
      console.error(err);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Artist Profile</h2>
      
      <Window title="Basic Information" className="mb-4">
        <div className="space-y-4">
          <Input
            label="Artist Name"
            id="artist_name"
            name="artist_name"
            value={profile.artist_name}
            onChange={handleProfileChange}
            placeholder="Your stage name or band name"
          />
          
          <div>
            <label className="block mb-2 font-bold" htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself and your music..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
            />
          </div>
        </div>
      </Window>
      
      <Window title="Genres" className="mb-4">
        <div className="mb-4">
          <p className="mb-2">Select your musical genres:</p>
          <div className="flex flex-wrap gap-2">
            {genreOptions.map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                className={`px-3 py-1 border rounded text-sm ${
                  profile.genres.includes(genre)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-end gap-2">
          <Input
            label="Add Custom Genre"
            id="custom-genre"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="e.g. Synthwave"
          />
          <Button onClick={handleAddCustomGenre} className="mb-2">Add</Button>
        </div>
        
        {profile.genres.length > 0 && (
          <div className="mt-4">
            <p className="font-bold">Your Genres:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.genres.map(genre => (
                <div
                  key={genre}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center"
                >
                  {genre}
                  <button
                    onClick={() => handleGenreToggle(genre)}
                    className="ml-2 text-xs bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center hover:bg-blue-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Window>
      
      <Window title="Social Links" className="mb-4">
        <div className="space-y-4">
          {socialLinks.length > 0 && (
            <div className="space-y-2">
              {socialLinks.map(link => (
                <div key={link.id} className="flex items-center gap-2 p-2 border-b">
                  <div className="flex-1 font-bold">{link.label}:</div>
                  <div className="flex-1 text-blue-600 truncate">{link.url}</div>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="bg-red-100 text-red-800 px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Platform/Label"
              id="link-label"
              name="label"
              value={newLink.label}
              onChange={handleNewLinkChange}
              placeholder="e.g. Instagram, Twitter, Website"
            />
            
            <Input
              label="URL"
              id="link-url"
              name="url"
              value={newLink.url}
              onChange={handleNewLinkChange}
              placeholder="https://..."
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAddLink}>Add Link</Button>
          </div>
        </div>
      </Window>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} className="px-6">Save Profile</Button>
      </div>
    </div>
  );
};

export default ProfilePage;
```

### API Service
```javascript
// src/api/profileService.js
import apiClient from './client';

const profileService = {
  // Get the user's profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Update the user's profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.patch('/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Get all social links
  getSocialLinks: async () => {
    try {
      const response = await apiClient.get('/profile/social-links/');
      return response.data;
    } catch (error) {
      console.error('Error fetching social links:', error);
      throw error;
    }
  },
  
  // Add a new social link
  addSocialLink: async (linkData) => {
    try {
      const response = await apiClient.post('/profile/social-links/', linkData);
      return response.data;
    } catch (error) {
      console.error('Error adding social link:', error);
      throw error;
    }
  },
  
  // Update a social link
  updateSocialLink: async (id, linkData) => {
    try {
      const response = await apiClient.put(`/profile/social-links/${id}/`, linkData);
      return response.data;
    } catch (error) {
      console.error('Error updating social link:', error);
      throw error;
    }
  },
  
  // Delete a social link
  deleteSocialLink: async (id) => {
    try {
      await apiClient.delete(`/profile/social-links/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting social link:', error);
      throw error;
    }
  },
  
  // Reorder social links
  reorderSocialLinks: async (linkIds) => {
    try {
      const response = await apiClient.post('/profile/social-links/reorder/', {
        links_order: linkIds
      });
      return response.data;
    } catch (error) {
      console.error('Error reordering social links:', error);
      throw error;
    }
  }
};

export default profileService;
```

## Windows 98 Styling Guidelines

To maintain the Windows 98 aesthetic:

1. Use a color palette reminiscent of Windows 98:
   - Light gray background (#C0C0C0)
   - Dark blue title bars (#000080)
   - White/black text
   - 3D button effects with light/dark borders

2. Interface elements should include:
   - Chunky buttons with 3D appearance
   - Beveled edges on windows and panels
   - Title bars with right-aligned minimize/maximize/close buttons
   - Classic form controls with visible borders

3. Typography:
   - Use system fonts like Arial, MS Sans Serif
   - Avoid modern font treatments
   - Maintain consistent sizing

## Migration Steps

1. Run migrations to create the new database tables:
```bash
python manage.py makemigrations profiles
python manage.py migrate profiles
```

2. Add the profile page to the frontend routing:
```jsx
// Update routes in App.js or routing configuration
<Route path="/profile" element={<ProfilePage />} />
```

3. Add the profile link to the navigation menu:
```jsx
// In your navigation component
<NavLink to="/profile">Profile</NavLink>
```

## Testing Plan

1. Test database models and relationships
2. Verify API endpoints for CRUD operations
3. Test frontend form submissions and validations
4. Verify Windows 98 styling across different screen sizes
5. Test social links addition, deletion, and reordering
6. Verify genre selection and custom genre functionality 