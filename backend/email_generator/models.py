from django.db import models
from django.conf import settings

# Create your models here.

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
    
    def __str__(self):
        return f"Outreach to {self.venue_name} on {self.sent_date.strftime('%Y-%m-%d')}"