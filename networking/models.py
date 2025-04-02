from django.db import models
from django.conf import settings
from network.models import Connection, Industry

class NetworkingEvent(models.Model):
    """Model representing an industry networking event"""
    EVENT_TYPES = [
        ('conference', 'Conference'),
        ('workshop', 'Workshop'),
        ('meetup', 'Meetup'),
        ('showcase', 'Showcase'),
        ('competition', 'Competition'),
        ('festival', 'Festival'),
        ('seminar', 'Seminar'),
        ('party', 'Industry Party'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='networking_events')
    name = models.CharField(max_length=255)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    virtual = models.BooleanField(default=False)
    url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    industries = models.ManyToManyField(Industry, related_name='events', blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    registration_required = models.BooleanField(default=False)
    registration_deadline = models.DateField(null=True, blank=True)
    registration_url = models.URLField(blank=True)
    registered = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_date']
    
    def __str__(self):
        return self.name

class NetworkingOpportunity(models.Model):
    """Model representing networking opportunities like job postings, collaborations, etc."""
    OPPORTUNITY_TYPES = [
        ('job', 'Job Posting'),
        ('gig', 'Gig'),
        ('collaboration', 'Collaboration'),
        ('mentorship', 'Mentorship'),
        ('funding', 'Funding Opportunity'),
        ('contest', 'Contest'),
        ('residency', 'Residency'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('applied', 'Applied'),
        ('interviewing', 'Interviewing'),
        ('offered', 'Offer Received'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('closed', 'Closed'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='networking_opportunities')
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    opportunity_type = models.CharField(max_length=20, choices=OPPORTUNITY_TYPES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    contact = models.ForeignKey(Connection, on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    contact_info = models.TextField(blank=True)
    date_posted = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    remote = models.BooleanField(default=False)
    url = models.URLField(blank=True)
    compensation = models.CharField(max_length=255, blank=True)
    requirements = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Networking Opportunities"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} at {self.organization}"

class EventAttendee(models.Model):
    """Model representing connections who are attending a networking event"""
    event = models.ForeignKey(NetworkingEvent, on_delete=models.CASCADE, related_name='attendees')
    connection = models.ForeignKey(Connection, on_delete=models.CASCADE, related_name='events_attending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['event', 'connection']
    
    def __str__(self):
        return f"{self.connection.name} attending {self.event.name}"

class ApplicationMilestone(models.Model):
    """Model for tracking milestones in the opportunity application process"""
    opportunity = models.ForeignKey(NetworkingOpportunity, on_delete=models.CASCADE, related_name='milestones')
    date = models.DateField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['date']
    
    def __str__(self):
        return f"{self.title} - {self.opportunity.title}" 