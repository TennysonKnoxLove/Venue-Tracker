# Data Models

## User Model
```python
class User(AbstractUser):
    """Extended user model for authentication and user-specific settings"""
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    preferences = models.JSONField(default=dict, blank=True)
```

## State Model
```python
class State(models.Model):
    """Represents a geographic state containing venues"""
    name = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=2)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='states')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'name')
```

## Venue Model
```python
class Venue(models.Model):
    """Represents a music performance venue"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='venues')
    zipcode = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='venues')
    
    class Meta:
        unique_together = ('user', 'name', 'state')
```

## Contact History Model
```python
class ContactHistory(models.Model):
    """Tracks communication with venues"""
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='contacts')
    contact_date = models.DateTimeField()
    contact_type = models.CharField(max_length=50, choices=[
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('in_person', 'In Person'),
        ('other', 'Other')
    ])
    contact_person = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    follow_up_completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Audio File Model
```python
class AudioFile(models.Model):
    """Stores audio files for editing"""
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='audio_files/')
    file_type = models.CharField(max_length=10)
    duration = models.FloatField(null=True, blank=True)
    waveform_data = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audio_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Audio Edit Model
```python
class AudioEdit(models.Model):
    """Represents edits applied to an audio file"""
    audio_file = models.ForeignKey(AudioFile, on_delete=models.CASCADE, related_name='edits')
    edit_type = models.CharField(max_length=50, choices=[
        ('trim', 'Trim'),
        ('fade', 'Fade'),
        ('speed', 'Speed'),
        ('reverb', 'Reverb'),
        ('other', 'Other')
    ])
    parameters = models.JSONField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audio_edits')
    created_at = models.DateTimeField(auto_now_add=True)
```

## AI Search Query Model
```python
class AISearchQuery(models.Model):
    """Stores venue search queries and results from AI"""
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    radius = models.IntegerField()
    results = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_searches')
    created_at = models.DateTimeField(auto_now_add=True)
``` 