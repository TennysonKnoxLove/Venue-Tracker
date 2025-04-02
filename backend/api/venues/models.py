from django.db import models
from django.conf import settings

class State(models.Model):
    """Represents a geographic state containing venues"""
    name = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=2)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='states')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'name')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.abbreviation})"

class Venue(models.Model):
    """Represents a music performance venue"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='venues')
    zipcode = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='venues')
    
    class Meta:
        unique_together = ('user', 'name', 'state')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.city}, {self.state.abbreviation})"

class AISearchQuery(models.Model):
    """Stores venue search queries and results from AI"""
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    radius = models.IntegerField()
    results = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_searches')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Search for {self.city}, {self.state} within {self.radius} miles" 