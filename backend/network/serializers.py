from rest_framework import serializers
from .models import NetworkContact, ContactSocialLink

class ContactSocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSocialLink
        fields = ['id', 'platform', 'url', 'username', 'created_at']
        read_only_fields = ['id', 'created_at']

class NetworkContactSerializer(serializers.ModelSerializer):
    social_links = ContactSocialLinkSerializer(many=True, read_only=True)
    
    class Meta:
        model = NetworkContact
        fields = [
            'id', 'name', 'email', 'phone', 'skills', 
            'meeting_context', 'notes', 'last_contact_date', 
            'relationship_status', 'social_links', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 