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
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    prompt = f"""
    I need detailed information about music venues that are good for live hip-hop and R&B performances in or near {city}, {state} within {radius} miles.
    
    For each venue, please provide the following information in a structured JSON format:
    
    1. name: The venue's name
    2. description: A brief description of the venue, its atmosphere, and why it's good for hip-hop/R&B
    3. address: The street address
    4. city: The city name
    5. state: The state name
    6. zipcode: The postal code
    7. phone: Phone number (if available)
    8. email: Contact email (if available)
    9. website: Official website URL (if available)
    10. capacity: Approximate audience capacity (if known)
    11. genres: Music genres typically featured (focus on hip-hop/R&B relevance)
    
    Return the information as a JSON array with each venue as an object. Only include venues that are actually good for hip-hop and R&B performances.
    
    Example format:
    [
      {{
        "name": "Venue Name",
        "description": "Description of the venue...",
        "address": "123 Main St",
        "city": "City Name",
        "state": "State",
        "zipcode": "12345",
        "phone": "555-123-4567",
        "email": "contact@venue.com",
        "website": "https://www.venue.com",
        "capacity": 500,
        "genres": "Hip-hop, R&B, Soul"
      }},
      // More venues...
    ]
    
    Please list at least 5-8 relevant venues if possible.
    """
    
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS
        )
        
        # Extract the response content
        content = response.choices[0].message.content
        
        # Find the JSON part of the response
        try:
            # Try to find JSON array in the response
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                venues_data = json.loads(json_str)
                return venues_data
            else:
                # If no array brackets found, try to parse the whole content
                venues_data = json.loads(content)
                return venues_data
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON from OpenAI response: {e}")
            logger.error(f"Response content: {content}")
            return []
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {e}")
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