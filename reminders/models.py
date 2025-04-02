from django.db import models
from django.conf import settings
from django.utils import timezone

class ReminderCategory(models.Model):
    """Model representing categories for reminders"""
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#3498db")  # Hex color
    icon = models.CharField(max_length=50, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminder_categories')
    
    class Meta:
        verbose_name_plural = "Reminder Categories"
        ordering = ['name']
        unique_together = ['name', 'user']
    
    def __str__(self):
        return self.name

class Reminder(models.Model):
    """Model representing a user reminder"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    completed = models.BooleanField(default=False)
    completed_date = models.DateTimeField(null=True, blank=True)
    category = models.ForeignKey(ReminderCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='reminders')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['completed', 'due_date', '-priority']
    
    def __str__(self):
        return self.title
    
    def mark_completed(self):
        """Mark the reminder as completed"""
        self.completed = True
        self.completed_date = timezone.now()
        self.save()

class ReminderNotification(models.Model):
    """Model for storing reminder notifications"""
    reminder = models.ForeignKey(Reminder, on_delete=models.CASCADE, related_name='notifications')
    sent_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"Notification for: {self.reminder.title}"
    
    def mark_read(self):
        """Mark notification as read"""
        self.read = True
        self.read_at = timezone.now()
        self.save() 