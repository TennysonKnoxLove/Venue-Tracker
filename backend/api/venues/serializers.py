from rest_framework import serializers
from .models import State, Venue, AISearchQuery

class StateSerializer(serializers.ModelSerializer):
    """Serializer for State model"""
    
    class Meta:
        model = State
        fields = ['id', 'name', 'abbreviation', 'created_at', 'updated_at', 'user_id']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_id']
    
    def create(self, validated_data):
        # Ensure the state is associated with the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class VenueSerializer(serializers.ModelSerializer):
    """Serializer for Venue model"""
    state_name = serializers.CharField(source='state.name', read_only=True)
    state_abbreviation = serializers.CharField(source='state.abbreviation', read_only=True)
    
    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'description', 'address', 'city', 'state', 'state_id', 
            'state_name', 'state_abbreviation', 'zipcode', 'phone', 'email', 
            'website', 'capacity', 'open_time', 'close_time', 'notes', 
            'created_at', 'updated_at', 'user_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_id', 'state_name', 'state_abbreviation']
    
    def create(self, validated_data):
        # Ensure the venue is associated with the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AIVenueResultSerializer(serializers.Serializer):
    """Serializer for AI venue search results"""
    name = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    zipcode = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    capacity = serializers.IntegerField(required=False, allow_null=True)
    genres = serializers.CharField(required=False, allow_blank=True)

class AISearchQuerySerializer(serializers.ModelSerializer):
    """Serializer for AI search queries"""
    results = AIVenueResultSerializer(many=True, required=False)
    
    class Meta:
        model = AISearchQuery
        fields = ['id', 'state', 'city', 'radius', 'results', 'created_at', 'user_id']
        read_only_fields = ['id', 'created_at', 'user_id']
    
    def create(self, validated_data):
        # Ensure the search query is associated with the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 