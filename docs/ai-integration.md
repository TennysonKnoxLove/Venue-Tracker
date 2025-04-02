# AI Integration

## OpenAI API Integration

The Venue Tracker application integrates with OpenAI's API to provide venue discovery functionality. This document outlines how the integration works and the prompt templates used for venue discovery.

### Configuration

The OpenAI integration is configured in the backend Django settings:

```python
# OpenAI configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = "gpt-4" # or "gpt-3.5-turbo" for lower cost
OPENAI_MAX_TOKENS = 1000
OPENAI_TEMPERATURE = 0.7
```

### Venue Discovery Prompt Template

The system uses a structured prompt to generate venue recommendations based on location:

```python
VENUE_DISCOVERY_PROMPT = """
You are a knowledgeable assistant that helps find music venues for live hip-hop and R&B performances.
Based on the following location parameters, provide information about potential venues:

- State: {state}
- City: {city}
- Radius: {radius} miles

Please provide information in the following structured format for each venue:
```json
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
  }},
  // Additional venues...
]
```

Focus on venues that regularly host live music, have a stage or performance area, and would be suitable for hip-hop and R&B artists. Include both well-known venues and lesser-known spots that might be open to new performers.

Provide up to 10 venues that match these criteria, ensuring the JSON format is valid.
"""
```

### Implementation

The AI venue discovery feature is implemented as follows:

1. **Python Utility**: A utility function in `utils/ai/openai_client.py` handles the API calls:

```python
import json
import openai
from django.conf import settings
from .templates import VENUE_DISCOVERY_PROMPT

def discover_venues(state, city, radius):
    """
    Use OpenAI to discover venues near a location.
    
    Args:
        state (str): State name
        city (str): City name
        radius (int): Search radius in miles
        
    Returns:
        list: List of venue dictionaries
    """
    try:
        # Format the prompt with location data
        formatted_prompt = VENUE_DISCOVERY_PROMPT.format(
            state=state,
            city=city,
            radius=radius
        )
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a venue discovery assistant."},
                {"role": "user", "content": formatted_prompt}
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=settings.OPENAI_TEMPERATURE
        )
        
        # Extract JSON data from response
        content = response.choices[0].message.content
        # Find JSON array in the response
        json_start = content.find('[')
        json_end = content.rfind(']') + 1
        
        if json_start >= 0 and json_end > 0:
            json_str = content[json_start:json_end]
            venues = json.loads(json_str)
            return venues
        else:
            # Fallback if no JSON found
            return []
            
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return []
```

2. **Django View**: The API endpoint that uses this utility:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import AISearchQuery
from .serializers import AISearchQuerySerializer
from utils.ai.openai_client import discover_venues

class VenueDiscoveryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        state = request.data.get('state')
        city = request.data.get('city')
        radius = request.data.get('radius')
        
        if not all([state, city, radius]):
            return Response(
                {"error": "State, city, and radius are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Call OpenAI API for venue suggestions
        venues = discover_venues(state, city, radius)
        
        # Save the search query and results
        search_query = AISearchQuery.objects.create(
            user=request.user,
            state=state,
            city=city,
            radius=radius,
            results=venues
        )
        
        serializer = AISearchQuerySerializer(search_query)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### Rate Limiting and Cost Management

To manage API costs, the application implements rate limiting:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '10/day',  # Limit AI searches to 10 per day per user
    }
}
```

### Error Handling

The application includes graceful error handling for API errors:

1. Connection issues with OpenAI API
2. Token limit exceeded
3. Invalid API key
4. Malformed response data 