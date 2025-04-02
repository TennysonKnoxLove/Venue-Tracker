from rest_framework import serializers
from .models import NetworkingEvent, NetworkingOpportunity, EventAttendee, ApplicationMilestone
from network.serializers import ConnectionSerializer
from network.models import Connection

class EventAttendeeSerializer(serializers.ModelSerializer):
    connection_name = serializers.CharField(source='connection.name', read_only=True)
    
    class Meta:
        model = EventAttendee
        fields = ['id', 'event', 'connection', 'connection_name', 'notes', 'created_at']

class ApplicationMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationMilestone
        fields = ['id', 'opportunity', 'date', 'title', 'description', 'completed']

class NetworkingEventSerializer(serializers.ModelSerializer):
    industry_names = serializers.SerializerMethodField()
    
    class Meta:
        model = NetworkingEvent
        fields = [
            'id', 'user', 'name', 'event_type', 'start_date', 'end_date',
            'location', 'address', 'virtual', 'url', 'description',
            'industries', 'industry_names', 'cost', 'registration_required',
            'registration_deadline', 'registration_url', 'registered',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
        
    def get_industry_names(self, obj):
        return [industry.name for industry in obj.industries.all()]
    
    def create(self, validated_data):
        """Set the user from the request context"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class NetworkingEventDetailSerializer(NetworkingEventSerializer):
    attendees = EventAttendeeSerializer(many=True, read_only=True)
    
    class Meta(NetworkingEventSerializer.Meta):
        fields = NetworkingEventSerializer.Meta.fields + ['attendees']

class NetworkingOpportunitySerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    
    class Meta:
        model = NetworkingOpportunity
        fields = [
            'id', 'user', 'title', 'organization', 'opportunity_type',
            'description', 'status', 'contact', 'contact_name', 'contact_info',
            'date_posted', 'deadline', 'location', 'remote', 'url',
            'compensation', 'requirements', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        """Set the user from the request context"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class NetworkingOpportunityDetailSerializer(NetworkingOpportunitySerializer):
    milestones = ApplicationMilestoneSerializer(many=True, read_only=True)
    contact_detail = serializers.SerializerMethodField()
    
    class Meta(NetworkingOpportunitySerializer.Meta):
        fields = NetworkingOpportunitySerializer.Meta.fields + ['milestones', 'contact_detail']
    
    def get_contact_detail(self, obj):
        if obj.contact:
            serializer = ConnectionSerializer(obj.contact)
            return serializer.data
        return None 