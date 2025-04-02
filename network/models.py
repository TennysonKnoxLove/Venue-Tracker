from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Industry(models.Model):
    """Model representing different music industry sectors"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Industries"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Connection(models.Model):
    """Model representing a professional connection in the music industry"""
    RELATIONSHIP_CHOICES = [
        ('contact', 'Contact'),
        ('colleague', 'Colleague'),
        ('collaborator', 'Collaborator'),
        ('mentor', 'Mentor'),
        ('mentee', 'Mentee'),
        ('friend', 'Friend'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='connections')
    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True)
    position = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True, blank=True, related_name='connections')
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='contact')
    notes = models.TextField(blank=True)
    website = models.URLField(blank=True)
    social_media = models.JSONField(default=dict, blank=True)
    location = models.CharField(max_length=255, blank=True)
    date_met = models.DateField(null=True, blank=True)
    last_contact = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at', 'name']
        
    def __str__(self):
        return f"{self.name} - {self.company}" if self.company else self.name
    
class Interaction(models.Model):
    """Model representing interactions with connections"""
    INTERACTION_TYPES = [
        ('meeting', 'Meeting'),
        ('call', 'Phone Call'),
        ('email', 'Email'),
        ('message', 'Message'),
        ('event', 'Event'),
        ('other', 'Other'),
    ]
    
    connection = models.ForeignKey(Connection, on_delete=models.CASCADE, related_name='interactions')
    date = models.DateTimeField()
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    follow_up_notes = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        
    def __str__(self):
        return f"{self.interaction_type} with {self.connection.name} on {self.date.strftime('%Y-%m-%d')}" 