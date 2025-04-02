from django.db import models
from django.conf import settings
from network.models import NetworkContact

# Create your models here.

class NetworkingSearchQuery(models.Model):
    """Stores networking opportunity search queries and results from AI"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='networking_searches')
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    radius = models.IntegerField()
    results = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Networking search near {self.city}, {self.state} ({self.radius} miles)"

class EventType(models.Model):
    """Types of networking events"""
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Event(models.Model):
    """Networking events for professional connections"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='networking_events')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    event_type = models.ForeignKey(EventType, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', 'time']
        
    def __str__(self):
        return self.name

class EventAttendee(models.Model):
    """Connections attending networking events"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    contact = models.ForeignKey(NetworkContact, on_delete=models.CASCADE, related_name='events')
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('event', 'contact')
        
    def __str__(self):
        return f"{self.contact} at {self.event}"

class Opportunity(models.Model):
    """Professional networking opportunities"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('interviewing', 'Interviewing'),
        ('offer_received', 'Offer Received'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('closed', 'Closed')
    ]
    TYPE_CHOICES = [
        ('job', 'Job'),
        ('internship', 'Internship'),
        ('contract', 'Contract'),
        ('collaboration', 'Collaboration'),
        ('other', 'Other')
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='networking_opportunities')
    title = models.CharField(max_length=100)
    organization = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    opportunity_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='job')
    location = models.CharField(max_length=255)
    remote = models.BooleanField(default=False)
    compensation = models.CharField(max_length=100, blank=True)
    application_url = models.URLField(blank=True)
    deadline = models.DateField(null=True, blank=True)
    contact = models.ForeignKey(NetworkContact, on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name_plural = 'Opportunities'
        
    def __str__(self):
        return f"{self.title} at {self.organization}"
        
    @property
    def is_active(self):
        return self.status in ['active', 'interviewing', 'offer_received']
        
    @property
    def is_closed(self):
        return self.status in ['accepted', 'declined', 'closed']

class Milestone(models.Model):
    """Milestones for tracking progress on opportunities"""
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date', 'created_at']
        
    def __str__(self):
        return f"{self.title} for {self.opportunity.title}"
