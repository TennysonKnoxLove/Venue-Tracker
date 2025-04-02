from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Interaction
from django.utils import timezone

@receiver(post_save, sender=Interaction)
def update_connection_last_contact(sender, instance, created, **kwargs):
    """Update the last_contact field on the connection when a new interaction is created"""
    if created and instance.date.date() >= instance.connection.last_contact:
        connection = instance.connection
        connection.last_contact = instance.date.date()
        connection.save(update_fields=['last_contact']) 