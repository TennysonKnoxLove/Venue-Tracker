from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """Extended user model for authentication and user-specific settings"""
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    preferences = models.JSONField(default=dict, blank=True)
    reset_code = models.CharField(max_length=10, null=True, blank=True)
    reset_code_expiry = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.username 