from rest_framework import serializers
from .models import ArtistProfile, SocialLink

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'label', 'url', 'order']
        read_only_fields = ['id']
    
    def validate_url(self, value):
        """Validate and format URL if needed."""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            value = f"https://{value}"
        return value

class ArtistProfileSerializer(serializers.ModelSerializer):
    social_links = SocialLinkSerializer(many=True, read_only=True)
    
    class Meta:
        model = ArtistProfile
        fields = ['id', 'artist_name', 'bio', 'genres', 'phone_number', 'social_links']
        read_only_fields = ['id']
        
    def create(self, validated_data):
        user = self.context['request'].user
        profile, created = ArtistProfile.objects.get_or_create(user=user)
        
        for field, value in validated_data.items():
            setattr(profile, field, value)
        
        profile.save()
        return profile 