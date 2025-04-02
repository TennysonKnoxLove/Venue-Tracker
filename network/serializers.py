from rest_framework import serializers
from .models import Industry, Connection, Interaction

class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = '__all__'

class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        fields = '__all__'
        
class InteractionDetailSerializer(serializers.ModelSerializer):
    connection_name = serializers.CharField(source='connection.name', read_only=True)
    
    class Meta:
        model = Interaction
        fields = '__all__'

class ConnectionSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source='industry.name', read_only=True)
    
    class Meta:
        model = Connection
        fields = [
            'id', 'user', 'name', 'company', 'position', 'email', 'phone',
            'industry', 'industry_name', 'relationship', 'notes', 'website',
            'social_media', 'location', 'date_met', 'last_contact',
            'created_at', 'updated_at'
        ]
        
class ConnectionDetailSerializer(serializers.ModelSerializer):
    industry_name = serializers.CharField(source='industry.name', read_only=True)
    interactions = InteractionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Connection
        fields = [
            'id', 'user', 'name', 'company', 'position', 'email', 'phone',
            'industry', 'industry_name', 'relationship', 'notes', 'website',
            'social_media', 'location', 'date_met', 'last_contact',
            'created_at', 'updated_at', 'interactions'
        ] 