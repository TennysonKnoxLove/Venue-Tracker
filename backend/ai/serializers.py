from rest_framework import serializers
from .models import VenueSearch, VenueResult

class VenueResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueResult
        fields = ['id', 'search', 'index', 'data', 'imported', 'imported_at', 'result_type']
        read_only_fields = ['id', 'search', 'imported_at']

class VenueSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueSearch
        fields = ['id', 'user', 'state', 'city', 'radius', 'created_at', 'search_type', 'search_terms']
        read_only_fields = ['id', 'user', 'created_at'] 