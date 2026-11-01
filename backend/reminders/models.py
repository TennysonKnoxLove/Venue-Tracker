from django.db import models
from django.conf import settings

class ReminderCategory(models.Model):
    """Categories for organizing reminders"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminder_categories')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20, default='blue')
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Reminder categories'
        
    def __str__(self):
        return self.name

class Reminder(models.Model):
    """General purpose reminder system"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.ForeignKey(ReminderCategory, on_delete=models.SET_NULL, related_name='reminders', null=True, blank=True)
    due_date = models.DateTimeField()
    completed = models.BooleanField(default=False)
    completed_date = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_date', 'created_at']
    
    def __str__(self):
        return f"{self.title} - Due: {self.due_date}"
class ReminderNotification(models.Model):
    """Notification for reminders"""
    reminder = models.ForeignKey(Reminder, on_delete=models.CASCADE, related_name='notifications')
    sent_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-sent_at']
        
    def __str__(self):
        return f"Notification for {self.reminder.title}"
