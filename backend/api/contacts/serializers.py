from rest_framework import serializers
from .models import ContactHistory
from api.venues.serializers import VenueSerializer

class ContactHistorySerializer(serializers.ModelSerializer):
    """Serializer for ContactHistory model"""
    is_follow_up_due = serializers.BooleanField(read_only=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    venue_id = serializers.PrimaryKeyRelatedField(source='venue', read_only=True)
    
    class Meta:
        model = ContactHistory
        fields = [
            'id', 'venue_id', 'venue_name', 'contact_date', 'contact_type',
            'contact_person', 'notes', 'follow_up_date', 'follow_up_completed',
            'is_follow_up_due', 'created_at', 'updated_at', 'user_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_id']
    
    def create(self, validated_data):
        """Create a new contact history with user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ContactHistoryDetailSerializer(ContactHistorySerializer):
    """Detailed serializer for ContactHistory including venue details"""
    venue = VenueSerializer(read_only=True)
    
    class Meta(ContactHistorySerializer.Meta):
        fields = ContactHistorySerializer.Meta.fields + ['venue']
        fields.remove('venue_id')
        fields.remove('venue_name') 