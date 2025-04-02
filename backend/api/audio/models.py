from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
import os
import uuid

User = get_user_model()

def audio_file_path(instance, filename):
    """Generate file path for new audio file"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('audio', filename)

class AudioFile(models.Model):
    """Model representing an audio file"""
    title = models.CharField(max_length=255)
    file = models.FileField(
        upload_to=audio_file_path,
        validators=[FileExtensionValidator(allowed_extensions=['mp3', 'wav', 'ogg', 'm4a'])]
    )
    file_type = models.CharField(max_length=10)
    duration = models.FloatField(null=True, blank=True)
    waveform_data = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audio_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class AudioEdit(models.Model):
    """Model representing an edit applied to an audio file"""
    EDIT_TYPE_CHOICES = [
        ('trim', 'Trim'),
        ('speed', 'Speed'),
        ('reverb', 'Reverb'),
        ('volume', 'Volume'),
    ]
    
    audio_file = models.ForeignKey(AudioFile, on_delete=models.CASCADE, related_name='edits')
    edit_type = models.CharField(max_length=20, choices=EDIT_TYPE_CHOICES)
    parameters = models.JSONField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audio_edits')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.edit_type} edit on {self.audio_file.title}" 