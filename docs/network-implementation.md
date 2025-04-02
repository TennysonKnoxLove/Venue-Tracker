# Network Implementation

## Overview
This document outlines the implementation of a Network management system that allows users to track industry connections, collaborators, and other contacts relevant to their music career. The interface will follow the Windows 98 aesthetic consistent with the rest of the application.

## Feature Requirements
- Contact management with comprehensive details (name, skills, etc.)
- Social media and contact information tracking
- Meeting context and relationship notes
- Windows 98 visual aesthetic
- Search and filtering capabilities

## Database Changes

### NetworkContact Model
```python
class NetworkContact(models.Model):
    """Stores information about industry contacts and connections"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='network_contacts')
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    skills = models.JSONField(default=list, blank=True)
    meeting_context = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    last_contact_date = models.DateField(null=True, blank=True)
    relationship_status = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.user.username}'s contact"
```

### ContactSocialLink Model
```python
class ContactSocialLink(models.Model):
    """Represents social media or web links for a network contact"""
    contact = models.ForeignKey('NetworkContact', on_delete=models.CASCADE, related_name='social_links')
    platform = models.CharField(max_length=50)  # e.g. Instagram, Twitter, Portfolio
    url = models.URLField()
    username = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.platform} - {self.contact.name}"
```

## API Endpoints

### Network Endpoints
- `GET /api/network/contacts/` - List all network contacts
- `POST /api/network/contacts/` - Create a new contact
- `GET /api/network/contacts/:id/` - Get contact details
- `PUT /api/network/contacts/:id/` - Update a contact
- `DELETE /api/network/contacts/:id/` - Delete a contact
- `GET /api/network/contacts/search/` - Search contacts

### Social Links Endpoints
- `GET /api/network/contacts/:id/social-links/` - Get social links for a contact
- `POST /api/network/contacts/:id/social-links/` - Add a social link
- `PUT /api/network/contacts/:id/social-links/:link_id/` - Update a social link
- `DELETE /api/network/contacts/:id/social-links/:link_id/` - Delete a social link

## Backend Implementation

### Create Network App
```bash
# Create a new app for network management
python manage.py startapp network

# Update settings.py to include the new app
# Add 'api.network' to INSTALLED_APPS
```

### Models
```python
# api/network/models.py
from django.db import models
from django.conf import settings

class NetworkContact(models.Model):
    """Stores information about industry contacts and connections"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='network_contacts')
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    skills = models.JSONField(default=list, blank=True)
    meeting_context = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    last_contact_date = models.DateField(null=True, blank=True)
    relationship_status = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.user.username}'s contact"

class ContactSocialLink(models.Model):
    """Represents social media or web links for a network contact"""
    contact = models.ForeignKey(NetworkContact, on_delete=models.CASCADE, related_name='social_links')
    platform = models.CharField(max_length=50)  # e.g. Instagram, Twitter, Portfolio
    url = models.URLField()
    username = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.platform} - {self.contact.name}"
```

### Serializers
```python
# api/network/serializers.py
from rest_framework import serializers
from .models import NetworkContact, ContactSocialLink

class ContactSocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSocialLink
        fields = ['id', 'platform', 'url', 'username', 'created_at']
        read_only_fields = ['id', 'created_at']

class NetworkContactSerializer(serializers.ModelSerializer):
    social_links = ContactSocialLinkSerializer(many=True, read_only=True)
    
    class Meta:
        model = NetworkContact
        fields = [
            'id', 'name', 'email', 'phone', 'skills', 
            'meeting_context', 'notes', 'last_contact_date', 
            'relationship_status', 'social_links', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### Views
```python
# api/network/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import NetworkContact, ContactSocialLink
from .serializers import NetworkContactSerializer, ContactSocialLinkSerializer

class NetworkContactViewSet(viewsets.ModelViewSet):
    """API endpoint for managing network contacts"""
    serializer_class = NetworkContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'skills', 'meeting_context', 'notes']
    ordering_fields = ['name', 'last_contact_date', 'created_at', 'updated_at']
    
    def get_queryset(self):
        return NetworkContact.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def social_links(self, request, pk=None):
        contact = self.get_object()
        links = contact.social_links.all()
        serializer = ContactSocialLinkSerializer(links, many=True)
        return Response(serializer.data)

class ContactSocialLinkViewSet(viewsets.ModelViewSet):
    """API endpoint for managing contact social links"""
    serializer_class = ContactSocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ContactSocialLink.objects.filter(contact__user=self.request.user)
    
    def perform_create(self, serializer):
        contact_id = self.kwargs.get('contact_pk')
        contact = get_object_or_404(NetworkContact, id=contact_id, user=self.request.user)
        serializer.save(contact=contact)
```

### URLs
```python
# api/network/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import NetworkContactViewSet, ContactSocialLinkViewSet

router = DefaultRouter()
router.register(r'contacts', NetworkContactViewSet, basename='network-contact')

contact_router = routers.NestedSimpleRouter(router, r'contacts', lookup='contact')
contact_router.register(r'social-links', ContactSocialLinkViewSet, basename='contact-social-link')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(contact_router.urls)),
]

# Include in main urls.py:
# path('api/network/', include('api.network.urls')),
```

## Frontend Implementation

### API Service
```javascript
// src/api/networkService.js
import apiClient from './client';

const networkService = {
  // Get all contacts
  getContacts: async () => {
    try {
      const response = await apiClient.get('/network/contacts/');
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  // Get a contact by ID
  getContact: async (id) => {
    try {
      const response = await apiClient.get(`/network/contacts/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },
  
  // Create a new contact
  createContact: async (contactData) => {
    try {
      const response = await apiClient.post('/network/contacts/', contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },
  
  // Update a contact
  updateContact: async (id, contactData) => {
    try {
      const response = await apiClient.put(`/network/contacts/${id}/`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },
  
  // Delete a contact
  deleteContact: async (id) => {
    try {
      await apiClient.delete(`/network/contacts/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },
  
  // Get social links for a contact
  getSocialLinks: async (contactId) => {
    try {
      const response = await apiClient.get(`/network/contacts/${contactId}/social-links/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social links:', error);
      throw error;
    }
  },
  
  // Add a social link to a contact
  addSocialLink: async (contactId, linkData) => {
    try {
      const response = await apiClient.post(`/network/contacts/${contactId}/social-links/`, linkData);
      return response.data;
    } catch (error) {
      console.error('Error adding social link:', error);
      throw error;
    }
  },
  
  // Delete a social link
  deleteSocialLink: async (contactId, linkId) => {
    try {
      await apiClient.delete(`/network/contacts/${contactId}/social-links/${linkId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting social link:', error);
      throw error;
    }
  },
  
  // Search contacts
  searchContacts: async (query) => {
    try {
      const response = await apiClient.get(`/network/contacts/`, {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }
};

export default networkService;
```

### Components

#### NetworkPage.js
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import { networkService } from '../api/networkService';

const NetworkPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Load contacts on component mount
    loadContacts();
  }, []);
  
  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await networkService.getContacts();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const data = await networkService.searchContacts(searchQuery);
      setContacts(data);
      setError(null);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await networkService.deleteContact(id);
        setContacts(contacts.filter(contact => contact.id !== id));
      } catch (err) {
        setError('Failed to delete contact');
        console.error(err);
      }
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Network</h2>
      
      <Window title="Network Contacts" className="mb-4">
        <div className="p-4">
          <div className="flex mb-4">
            <form onSubmit={handleSearch} className="flex w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="flex-1 mr-2"
              />
              <Button type="submit">Search</Button>
            </form>
            <Button as={Link} to="/network/new" className="ml-2">Add Contact</Button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-4">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 bg-gray-100 rounded border">
              <p className="text-lg text-gray-600 mb-4">No contacts found</p>
              <Button as={Link} to="/network/new">Add Your First Contact</Button>
            </div>
          ) : (
            <div className="bg-white border rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Skills</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Last Contact</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map(contact => (
                    <tr key={contact.id}>
                      <td className="px-4 py-2">
                        <Link to={`/network/${contact.id}`} className="text-blue-600 hover:underline">
                          {contact.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {contact.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="bg-gray-200 text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                          {contact.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{contact.skills.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {contact.last_contact_date || 'Never'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          <Button
                            as={Link}
                            to={`/network/${contact.id}/edit`}
                            className="text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(contact.id)}
                            className="text-xs bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
};

export default NetworkPage;
```

#### ContactForm.js
```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import { networkService } from '../api/networkService';

const ContactForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    meeting_context: '',
    notes: '',
    last_contact_date: '',
    relationship_status: ''
  });
  
  const [socialLinks, setSocialLinks] = useState([]);
  const [newLink, setNewLink] = useState({ platform: '', url: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  
  useEffect(() => {
    // Load contact data in edit mode
    if (isEditMode) {
      loadContactData();
    }
  }, [isEditMode, id]);
  
  const loadContactData = async () => {
    try {
      setLoading(true);
      const contact = await networkService.getContact(id);
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        skills: contact.skills || [],
        meeting_context: contact.meeting_context || '',
        notes: contact.notes || '',
        last_contact_date: contact.last_contact_date || '',
        relationship_status: contact.relationship_status || ''
      });
      
      // Load social links
      const links = await networkService.getSocialLinks(id);
      setSocialLinks(links);
      
      setError(null);
    } catch (err) {
      setError('Failed to load contact data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNewLinkChange = (e) => {
    const { name, value } = e.target;
    setNewLink(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };
  
  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
  
  const addSocialLink = async () => {
    if (!newLink.platform || !newLink.url) return;
    
    try {
      if (isEditMode) {
        const addedLink = await networkService.addSocialLink(id, newLink);
        setSocialLinks([...socialLinks, addedLink]);
      } else {
        // For new contacts, just add to state
        setSocialLinks([...socialLinks, { ...newLink, id: Date.now() }]);
      }
      
      setNewLink({ platform: '', url: '', username: '' });
    } catch (err) {
      setError('Failed to add social link');
      console.error(err);
    }
  };
  
  const removeSocialLink = async (linkId) => {
    try {
      if (isEditMode) {
        await networkService.deleteSocialLink(id, linkId);
      }
      setSocialLinks(socialLinks.filter(link => link.id !== linkId));
    } catch (err) {
      setError('Failed to remove social link');
      console.error(err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        // Update existing contact
        await networkService.updateContact(id, formData);
      } else {
        // Create new contact
        const newContact = await networkService.createContact(formData);
        
        // Add social links for new contact
        for (const link of socialLinks) {
          await networkService.addSocialLink(newContact.id, {
            platform: link.platform,
            url: link.url,
            username: link.username
          });
        }
      }
      
      navigate('/network');
    } catch (err) {
      setError('Failed to save contact');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) {
    return <div className="text-center py-8">Loading contact data...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Edit Contact' : 'Add New Contact'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <Window title="Contact Information" className="mb-4">
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <Input
              label="Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              
              <Input
                label="Phone"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block mb-2 font-bold">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <Input
                  id="skill-input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill..."
                  className="flex-1 mr-2"
                />
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-bold" htmlFor="meeting_context">How You Met</label>
              <textarea
                id="meeting_context"
                name="meeting_context"
                value={formData.meeting_context}
                onChange={handleChange}
                placeholder="Describe how and where you met this person..."
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block mb-2 font-bold" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about this contact..."
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Last Contact Date"
                id="last_contact_date"
                name="last_contact_date"
                type="date"
                value={formData.last_contact_date}
                onChange={handleChange}
              />
              
              <div>
                <label className="block mb-2 font-bold" htmlFor="relationship_status">Relationship Status</label>
                <select
                  id="relationship_status"
                  name="relationship_status"
                  value={formData.relationship_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select status...</option>
                  <option value="New Contact">New Contact</option>
                  <option value="Active Collaboration">Active Collaboration</option>
                  <option value="Past Collaboration">Past Collaboration</option>
                  <option value="Potential Collaboration">Potential Collaboration</option>
                  <option value="Industry Connection">Industry Connection</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>
            </div>
          </div>
        </Window>
        
        <Window title="Social Media & Links" className="mb-4">
          <div className="p-4 space-y-4">
            <div className="space-y-4">
              {socialLinks.length > 0 && (
                <div className="space-y-2">
                  {socialLinks.map(link => (
                    <div key={link.id} className="flex items-center gap-2 p-2 border-b">
                      <div className="font-bold w-1/4">{link.platform}:</div>
                      <div className="flex-1 text-blue-600 truncate">{link.url}</div>
                      {link.username && (
                        <div className="text-gray-500 w-1/4">@{link.username}</div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        className="bg-red-100 text-red-800 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Platform"
                  id="platform"
                  name="platform"
                  value={newLink.platform}
                  onChange={handleNewLinkChange}
                  placeholder="e.g. Instagram, Twitter, Website"
                />
                
                <Input
                  label="URL"
                  id="url"
                  name="url"
                  value={newLink.url}
                  onChange={handleNewLinkChange}
                  placeholder="https://..."
                />
                
                <Input
                  label="Username (optional)"
                  id="username"
                  name="username"
                  value={newLink.username}
                  onChange={handleNewLinkChange}
                  placeholder="@username"
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="button" onClick={addSocialLink}>
                  Add Link
                </Button>
              </div>
            </div>
          </div>
        </Window>
        
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={() => navigate('/network')}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
```

## Windows 98 Styling Additions

To maintain the Windows 98 aesthetic for the network management feature:

1. Contact list should use a file explorer-style view:
```css
.contact-list {
  background-color: white;
  border: inset 2px #dfdfdf;
  font-family: 'MS Sans Serif', Arial, sans-serif;
}

.contact-list-header {
  background-color: #c0c0c0;
  border-bottom: 1px solid #999999;
}

.contact-list-row:nth-child(even) {
  background-color: #f0f0f0;
}
```

2. Form elements should use Windows 98 styling:
```css
.win98-select {
  appearance: none;
  background-color: white;
  background-image: url('path-to-dropdown-arrow.png');
  background-position: right 8px center;
  background-repeat: no-repeat;
  border: inset 2px #dfdfdf;
  padding: 4px 24px 4px 8px;
  font-family: 'MS Sans Serif', Arial, sans-serif;
}

.win98-tag {
  background-color: #c0c0c0;
  border-top: 1px solid #dfdfdf;
  border-left: 1px solid #dfdfdf;
  border-right: 1px solid #404040;
  border-bottom: 1px solid #404040;
  font-family: 'MS Sans Serif', Arial, sans-serif;
  font-size: 11px;
  padding: 2px 6px;
}
```

## Integration Steps

1. Run migrations to create the new database tables:
```bash
python manage.py makemigrations network
python manage.py migrate network
```

2. Add the network routes to the frontend routing:
```jsx
// Update routes in App.js or routing configuration
<Route path="/network" element={<NetworkPage />} />
<Route path="/network/new" element={<ContactForm />} />
<Route path="/network/:id" element={<ContactDetail />} />
<Route path="/network/:id/edit" element={<ContactForm />} />
```

3. Add the network link to the navigation menu:
```jsx
// In your navigation component
<NavLink to="/network">My Network</NavLink>
```

## Testing Plan

1. Test database models and relationships
2. Verify API endpoints for CRUD operations
3. Test frontend form submissions and validations
4. Verify Windows 98 styling across different screen sizes
5. Test social link functionality
6. Verify search and filtering capabilities 