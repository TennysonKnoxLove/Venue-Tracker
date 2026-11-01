from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import VenueOutreach
from .serializers import VenueOutreachSerializer, EmailGenerationSerializer
from utils.ai.openai_client import generate_completion
from utils.ai.templates import VENUE_OUTREACH_EMAIL_PROMPT
from profiles.models import SocialLink

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
    
    extra_details = []
    if phone_number:
        extra_details.append(f"Phone Number: {phone_number}")
    if social_links_text:
        extra_details.append(social_links_text.strip())
    if event_date:
        extra_details.append(
            f"Preferred Event Date: {event_date.strftime('%B %d, %Y')}"
        )
    if notes:
        extra_details.append(f"Additional Notes: {notes}")

    def _plain(value):
        return str(value).replace("{", "{{").replace("}", "}}")

    prompt = VENUE_OUTREACH_EMAIL_PROMPT.format(
        venue_name=_plain(venue_name),
        artist_name=_plain(artist_name),
        genres=_plain(genres),
        bio=_plain(bio),
        extra_details=_plain("\n".join(extra_details)),
    )
    
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
