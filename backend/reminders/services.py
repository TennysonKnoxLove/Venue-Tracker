from django.utils import timezone


def mark_completed(reminder):
    """Mark the reminder as completed."""
    reminder.completed = True
    reminder.completed_date = timezone.now()
    reminder.save()
    return reminder

def mark_read(notification):
    """Mark the notification as read."""
    notification.read = True
    notification.read_at = timezone.now()
    notification.save()
    return notification

