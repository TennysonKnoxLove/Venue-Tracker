from rest_framework import serializers
from .models import VenueOutreach

class VenueOutreachSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueOutreach
        fields = ['id', 'venue', 'venue_name', 'email_content', 'sent_date', 'event_date', 'notes']
        read_only_fields = ['id', 'sent_date']

class EmailGenerationSerializer(serializers.Serializer):
    venue_name = serializers.CharField(required=True)
    event_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True) 