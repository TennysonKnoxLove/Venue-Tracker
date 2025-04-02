from django.db import models
from django.conf import settings

# Create your models here.

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
