from django.utils import timezone


def mark_completed(reminder):
    """Mark the reminder as completed."""
    reminder.completed = True
    reminder.completed_date = timezone.now()
    reminder.save()
    return reminder

