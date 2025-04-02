from django.db import models
from django.conf import settings
from django.utils import timezone

class VenueSearch(models.Model):
    """Model to store venue search results"""
    SEARCH_TYPES = [
        ('venue', 'Venue'),
        ('opportunity', 'Networking Opportunity'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=100, blank=True)
    radius = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    raw_response = models.TextField()
    search_type = models.CharField(max_length=20, choices=SEARCH_TYPES, default='venue')
    search_terms = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Venue searches'
    
    def __str__(self):
        if self.search_type == 'venue':
            return f"Venue search for {self.city}, {self.state} ({self.created_at})"
        else:
            return f"Opportunity search for {self.state} ({self.created_at})"

class VenueResult(models.Model):
    """Model to store individual venue results"""
    RESULT_TYPES = [
        ('venue', 'Venue'),
        ('opportunity', 'Networking Opportunity'),
    ]
    
    search = models.ForeignKey(VenueSearch, on_delete=models.CASCADE, related_name='results')
    index = models.IntegerField()
    data = models.JSONField()
    imported = models.BooleanField(default=False)
    imported_at = models.DateTimeField(null=True, blank=True)
    result_type = models.CharField(max_length=20, choices=RESULT_TYPES, default='venue')
    
    class Meta:
        ordering = ['index']
        verbose_name_plural = 'Venue results'
        unique_together = ('search', 'index')
    
    def __str__(self):
        if self.result_type == 'venue':
            return f"Venue result {self.index} for search {self.search.id}"
        else:
            return f"Opportunity result {self.index} for search {self.search.id}" 