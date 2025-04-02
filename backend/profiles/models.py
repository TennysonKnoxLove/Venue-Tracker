from django.db import models
from django.conf import settings
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

# Create your models here.

class ArtistProfile(models.Model):
    """Extended profile information for artists"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='artist_profile')
    artist_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    genres = models.JSONField(default=list, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="Contact phone number")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.artist_name or self.user.username}'s Profile"

class SocialLink(models.Model):
    """Represents a social media or web link for an artist profile"""
    profile = models.ForeignKey(ArtistProfile, on_delete=models.CASCADE, related_name='social_links')
    label = models.CharField(max_length=50)
    url = models.URLField(help_text="Must be a valid URL with http:// or https://")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        
    def __str__(self):
        return f"{self.label} - {self.profile.artist_name}"
    
    def clean(self):
        # Format URL if needed
        if self.url and not (self.url.startswith('http://') or self.url.startswith('https://')):
            self.url = f"https://{self.url}"
        
        # Validate URL
        validator = URLValidator()
        try:
            validator(self.url)
        except ValidationError:
            raise ValidationError({'url': 'Enter a valid URL.'})
