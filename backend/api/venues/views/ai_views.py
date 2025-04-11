from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveAPIView
import json
import logging
from django.conf import settings
from openai import OpenAI

from ..models import AISearchQuery, State, Venue
from ..serializers import AISearchQuerySerializer, VenueSerializer

logger = logging.getLogger(__name__)

def discover_venues(state, city, radius):
    """
    Use OpenAI API to discover venues in the specified location
    
    Args:
        state (str): The state name
        city (str): The city name
        radius (int): The radius in miles to search
        
    Returns:
        list: List of venue dictionaries
    """
    try:
        # Only pass the API key to the OpenAI client, ignoring any other parameters
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""
        You are a knowledgeable assistant that helps find music venues for live hip-hop and R&B performances.
        Based on the following location parameters, provide information about potential venues:

        - State: {state}
        - City: {city}
        - Radius: {radius} miles

        Please provide information in the following structured format for each venue:
        [
          {{
            "name": "Venue Name",
            "description": "Brief description of the venue",
            "address": "Full street address",
            "city": "City name",
            "state": "State abbreviation",
            "zipcode": "Zip code",
            "phone": "Phone number if available",
            "email": "Email if available",
            "website": "Website URL if available",
            "capacity": "Estimated capacity if known (number only)",
            "genres": "Music genres typically featured"
          }}
        ]

        Focus on venues that regularly host live music, have a stage or performance area, and would be suitable for hip-hop and R&B artists.
        Include both well-known venues and lesser-known spots that might be open to new performers.
        Provide up to 10 venues that match these criteria, ensuring the JSON format is valid.
        """
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a venue discovery assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=settings.OPENAI_TEMPERATURE
        )
        
        content = response.choices[0].message.content
        
        # Find JSON array in the response
        json_start = content.find('[')
        json_end = content.rfind(']') + 1
        
        if json_start >= 0 and json_end > 0:
            json_str = content[json_start:json_end]
            try:
                venues = json.loads(json_str)
                return venues
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON in OpenAI response: {json_str}")
                return []
        else:
            logger.error(f"No JSON array found in response: {content}")
            return []
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        return []

class VenueDiscoveryView(APIView):
    """
    API view for discovering venues using OpenAI
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        state = request.data.get('state')
        city = request.data.get('city')
        radius = request.data.get('radius')
        
        if not all([state, city, radius]):
            return Response(
                {"error": "Missing required parameters: state, city, and radius"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            radius = int(radius)
        except ValueError:
            return Response(
                {"error": "Radius must be a number"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        venues_data = discover_venues(state, city, radius)
        
        if not venues_data:
            return Response(
                {"error": "Failed to get venue recommendations or no venues found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Save the search query and results to the database
        search_data = {
            'state': state,
            'city': city,
            'radius': radius,
            'results': venues_data
        }
        
        serializer = AISearchQuerySerializer(
            data=search_data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SearchHistoryListView(ListAPIView):
    """
    API view for listing the user's search history
    """
    serializer_class = AISearchQuerySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only searches belonging to the authenticated user"""
        return AISearchQuery.objects.filter(user=self.request.user)

class SearchResultsDetailView(RetrieveAPIView):
    """
    API view for retrieving search results
    """
    serializer_class = AISearchQuerySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only searches belonging to the authenticated user"""
        return AISearchQuery.objects.filter(user=self.request.user)

class ImportSearchResultsView(APIView):
    """
    API view for importing selected AI search results into the venue database
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            # Get the search query that belongs to the user
            search_query = AISearchQuery.objects.get(id=pk, user=request.user)
        except AISearchQuery.DoesNotExist:
            return Response(
                {"error": "Search not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Get indices of venues to import
        venue_indices = request.data.get('venue_indices', [])
        
        if not venue_indices:
            return Response(
                {"error": "No venues selected for import"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        results = search_query.results
        
        if not results:
            return Response(
                {"error": "No results found in the search"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        imported_venues = []
        errors = []
        
        for idx in venue_indices:
            try:
                idx = int(idx)
                if idx < 0 or idx >= len(results):
                    errors.append(f"Index {idx} out of range")
                    continue
                    
                venue_data = results[idx]
                
                # Get or create state
                try:
                    state_name = venue_data.get('state', search_query.state)
                    state_obj, created = State.objects.get_or_create(
                        name=state_name,
                        user=request.user,
                        defaults={'abbreviation': state_name[:2].upper()}
                    )
                    
                    # Create venue data
                    venue_dict = {
                        'name': venue_data.get('name', ''),
                        'description': venue_data.get('description', ''),
                        'address': venue_data.get('address', ''),
                        'city': venue_data.get('city', search_query.city),
                        'state': state_obj.id,  # Use state ID instead of state object
                        'zipcode': venue_data.get('zipcode', ''),
                        'phone': venue_data.get('phone', ''),
                        'email': venue_data.get('email', ''),
                        'website': venue_data.get('website', ''),
                        'capacity': venue_data.get('capacity'),
                        'notes': venue_data.get('genres', ''),
                        'user': request.user.id  # Add user ID explicitly
                    }
                    
                    # Try to create the venue
                    venue_serializer = VenueSerializer(
                        data=venue_dict,
                        context={'request': request}
                    )
                    
                    if venue_serializer.is_valid():
                        venue = venue_serializer.save()
                        imported_venues.append(venue_serializer.data)
                    else:
                        errors.append(f"Failed to create venue '{venue_data.get('name')}': {venue_serializer.errors}")
                        
                except Exception as e:
                    errors.append(f"Error importing venue: {str(e)}")
                    
            except Exception as e:
                errors.append(f"Error processing index {idx}: {str(e)}")
                
        return Response({
            'imported_venues': imported_venues,
            'errors': errors,
            'total_imported': len(imported_venues),
            'total_errors': len(errors)
        }) 