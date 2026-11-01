import json
import logging
from django.conf import settings
from openai import OpenAI
from .templates import VENUE_DISCOVERY_PROMPT

logger = logging.getLogger(__name__)

def get_openai_client():
    """Return an OpenAI client using the API key from settings."""
    return OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_completion(prompt, max_tokens=500):
    """Generate a chat completion for a single user prompt."""
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error("Error generating OpenAI completion: %s", e)
        return "Error generating response. Please try again later."

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
        
        # Call OpenAI API - only pass API key
        client = get_openai_client()
        response = client.chat.completions.create(
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
            logger.error(f"No JSON array found in response: {content}")
            return []
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        return []
