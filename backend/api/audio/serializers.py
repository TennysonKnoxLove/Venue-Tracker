from rest_framework import serializers
from .models import AudioFile, AudioEdit
from django.contrib.auth import get_user_model

User = get_user_model()

class AudioEditSerializer(serializers.ModelSerializer):
    """Serializer for AudioEdit model"""
    class Meta:
        model = AudioEdit
        fields = ['id', 'audio_file_id', 'edit_type', 'parameters', 'created_at', 'user_id']
        read_only_fields = ['id', 'created_at', 'user_id']

class AudioFileSerializer(serializers.ModelSerializer):
    """Serializer for AudioFile model"""
    username = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True)
    
    class Meta:
        model = AudioFile
        fields = [
            'id', 'title', 'file', 'file_type', 'duration', 'waveform_data',
            'created_at', 'updated_at', 'user_id', 'user', 'username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_id', 'username']
    
    def get_username(self, obj):
        """Get the username of the user who uploaded the file"""
        if obj.user:
            return obj.user.username
        return "Unknown User"
    
    def create(self, validated_data):
        """Create a new audio file with user"""
        # If user isn't provided in data but is in request context, use that
        if 'user' not in validated_data and self.context.get('request'):
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AudioFileDetailSerializer(AudioFileSerializer):
    """Detailed serializer for AudioFile with edits included"""
    edits = AudioEditSerializer(many=True, read_only=True)
    
    class Meta(AudioFileSerializer.Meta):
        fields = AudioFileSerializer.Meta.fields + ['edits'] 