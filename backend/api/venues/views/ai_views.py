from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from utils.ai.openai_client import discover_venues
from ..models import AISearchQuery, State
from ..serializers import AISearchQuerySerializer, VenueSerializer

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
                    state_obj, _created = State.objects.get_or_create(
                        name=state_name,
                        user=request.user,
                        defaults={'abbreviation': state_name[:2].upper()}
                    )
                    
                    venue_dict = {
                        'name': venue_data.get('name') or '',
                        'description': venue_data.get('description') or '',
                        'address': venue_data.get('address') or '',
                        'city': venue_data.get('city') or search_query.city,
                        'state': state_obj.id,
                        'zipcode': venue_data.get('zipcode') or '',
                        'phone': venue_data.get('phone') or '',
                        'email': venue_data.get('email') or '',
                        'website': venue_data.get('website') or '',
                        'capacity': venue_data.get('capacity'),
                        'open_time': venue_data.get('open_time') or None,
                        'close_time': venue_data.get('close_time') or None,
                        'notes': venue_data.get('genres') or '',
                    }
                    
                    # Try to create the venue
                    venue_serializer = VenueSerializer(
                        data=venue_dict,
                        context={'request': request}
                    )
                    
                    if venue_serializer.is_valid():
                        venue_serializer.save()
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