from rest_framework import serializers
from .models import EventType, Event, Opportunity
from network.serializers import NetworkContactSerializer

class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'name', 'description']

class EventSerializer(serializers.ModelSerializer):
    event_type_name = serializers.CharField(source='event_type.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'description', 'location', 
            'event_type', 'event_type_name', 
            'date', 'time', 'cost',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class OpportunitySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_opportunity_type_display', read_only=True)
    contact_details = NetworkContactSerializer(source='contact', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_closed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'organization', 'description',
            'opportunity_type', 'type_display',
            'location', 'remote', 'compensation',
            'application_url', 'deadline',
            'contact_person', 'contact', 'contact_details',
            'notes', 'status', 'status_display',
            'is_active', 'is_closed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
