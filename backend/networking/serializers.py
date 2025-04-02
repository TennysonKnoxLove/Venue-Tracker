from rest_framework import serializers
from .models import NetworkingSearchQuery, EventType, Event, EventAttendee, Opportunity, Milestone
from network.serializers import NetworkContactSerializer

class NetworkingSearchQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkingSearchQuery
        fields = ['id', 'state', 'city', 'radius', 'results', 'created_at']
        read_only_fields = ['id', 'created_at']

class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'name', 'description']

class EventAttendeeSerializer(serializers.ModelSerializer):
    contact_details = NetworkContactSerializer(source='contact', read_only=True)
    
    class Meta:
        model = EventAttendee
        fields = ['id', 'contact', 'contact_details', 'notes']
        read_only_fields = ['id']

class EventSerializer(serializers.ModelSerializer):
    event_type_name = serializers.CharField(source='event_type.name', read_only=True)
    attendees_count = serializers.SerializerMethodField()
    attendees = EventAttendeeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'description', 'location', 
            'event_type', 'event_type_name', 
            'date', 'time', 'cost',
            'attendees_count', 'attendees',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_attendees_count(self, obj):
        return obj.attendees.count()

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['id', 'opportunity', 'title', 'description', 'date', 'completed', 'created_at']
        read_only_fields = ['id', 'created_at']

class OpportunitySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_opportunity_type_display', read_only=True)
    contact_details = NetworkContactSerializer(source='contact', read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    milestones_count = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    is_closed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'organization', 'description',
            'opportunity_type', 'type_display',
            'location', 'remote', 'compensation',
            'application_url', 'deadline',
            'contact', 'contact_details',
            'notes', 'status', 'status_display',
            'is_active', 'is_closed',
            'milestones', 'milestones_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_milestones_count(self, obj):
        return obj.milestones.count() 