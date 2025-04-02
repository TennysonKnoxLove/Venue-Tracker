from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Reminder, ReminderNotification

@receiver(pre_save, sender=Reminder)
def check_reminder_completion(sender, instance, **kwargs):
    """Check if a reminder is being completed and set the completed_date"""
    if instance.id:
        try:
            old_instance = Reminder.objects.get(id=instance.id)
            if not old_instance.completed and instance.completed:
                instance.completed_date = timezone.now()
        except Reminder.DoesNotExist:
            pass

@receiver(post_save, sender=Reminder)
def create_reminder_notification(sender, instance, created, **kwargs):
    """Create a notification for a newly created reminder or when it's due soon"""
    if created:
        # Create an initial notification for the new reminder
        ReminderNotification.objects.create(reminder=instance)
    elif instance.due_date and not instance.completed:
        # Check if the reminder is due within 24 hours and doesn't have a recent notification
        now = timezone.now()
        time_until_due = instance.due_date - now
        
        # If due within 24 hours and no notification in last 12 hours
        if 0 < time_until_due.total_seconds() <= 86400:  # 24 hours in seconds
            # Check if there's already a recent notification
            recent_notification = ReminderNotification.objects.filter(
                reminder=instance,
                sent_at__gte=now - timezone.timedelta(hours=12)
            ).exists()
            
            if not recent_notification:
                ReminderNotification.objects.create(reminder=instance) 