from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.venues.models import Venue

User = get_user_model()

class ContactHistory(models.Model):
    """Model for tracking communication with venues"""
    CONTACT_TYPES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('in_person', 'In Person'),
        ('other', 'Other')
    ]
    
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='contacts')
    contact_date = models.DateTimeField()
    contact_type = models.CharField(max_length=50, choices=CONTACT_TYPES)
    contact_person = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    follow_up_completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-contact_date']
        
    def __str__(self):
        return f"{self.get_contact_type_display()} contact with {self.venue.name} on {self.contact_date.strftime('%Y-%m-%d')}"
    
    def is_follow_up_due(self):
        """Check if follow-up is due but not completed"""
        if not self.follow_up_date or self.follow_up_completed:
            return False
        return self.follow_up_date <= timezone.now().date() 