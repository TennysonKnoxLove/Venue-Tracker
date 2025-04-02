from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import VenueOutreach
from .serializers import VenueOutreachSerializer, EmailGenerationSerializer
import openai
from django.conf import settings
from django.utils import timezone
from profiles.models import ArtistProfile, SocialLink
import json
import logging

logger = logging.getLogger(__name__)

# Initialize OpenAI with legacy method for compatibility
openai.api_key = settings.OPENAI_API_KEY

def generate_completion(prompt, max_tokens=500):
    """Generate a completion using OpenAI API with compatibility for different versions"""
    try:
        # First try the newer version approach
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except (TypeError, AttributeError):
        # Fall back to legacy approach
        response = openai.ChatCompletion.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

class VenueOutreachViewSet(viewsets.ModelViewSet):
    """ViewSet for venue outreach history"""
    serializer_class = VenueOutreachSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return outreach history for the authenticated user"""
        return VenueOutreach.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_email(request):
    """Generate an email to a venue using AI"""
    serializer = EmailGenerationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Extract data from request
    venue_name = serializer.validated_data['venue_name']
    event_date = serializer.validated_data.get('event_date')
    notes = serializer.validated_data.get('notes', '')
    
    # Get user profile for artist information
    try:
        artist_profile = request.user.artist_profile
        artist_name = artist_profile.artist_name or request.user.username
        bio = artist_profile.bio or "I'm an artist looking to perform at your venue."
        genres = ", ".join(artist_profile.genres) if artist_profile.genres else "various genres"
        phone_number = artist_profile.phone_number or ""
        
        # Get social media links
        social_links = SocialLink.objects.filter(profile=artist_profile)
        social_links_text = ""
        if social_links.exists():
            social_links_text = "\nSocial Media Links:\n"
            for link in social_links:
                social_links_text += f"- {link.label}: {link.url}\n"
    except:
        # Default values if profile doesn't exist
        artist_name = request.user.username
        bio = "I'm an artist looking to perform at your venue."
        genres = "various genres"
        phone_number = ""
        social_links_text = ""
    
    # Create prompt for OpenAI
    prompt = f"""
    Write a professional cold email to {venue_name} from {artist_name}, inquiring about 
    potential performance opportunities. You MUST use ALL of the following information in the email:
    
    Artist Name: {artist_name}
    Music Genres: {genres}
    Bio: {bio}
    """

    if phone_number:
        prompt += f"Phone Number: {phone_number}\n"
    
    if social_links_text:
        prompt += f"\n{social_links_text}"
    
    if event_date:
        prompt += f"\nPreferred Event Date: {event_date.strftime('%B %d, %Y')}"
    
    if notes:
        prompt += f"\nAdditional Notes: {notes}"
    
    prompt += """
    
    The email MUST include ALL of the following elements:
    - A strong introduction of the artist using their bio information
    - Clear expression of interest in performing at the venue
    - Detailed mention of musical style/genres and any achievements from the bio
    - Request for information about booking process
    - Professional closing with contact information (email and phone if provided)
    - All provided social media links formatted clearly in the email signature
    
    Format as plain text email and make sure to incorporate EVERY piece of information provided above.
    """
    
    try:
        # Generate email with OpenAI API
        email_content = generate_completion(prompt)
        
        # Save outreach record
        outreach = VenueOutreach.objects.create(
            user=request.user,
            venue_name=venue_name,
            email_content=email_content,
            event_date=event_date,
            notes=notes
        )
        
        return Response({
            "email": email_content,
            "outreach_id": outreach.id
        })
        
    except Exception as e:
        return Response(
            {"error": f"Failed to generate email: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
