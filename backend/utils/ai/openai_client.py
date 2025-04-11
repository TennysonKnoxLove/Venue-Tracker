import json
import logging
from django.conf import settings
from openai import OpenAI
from .templates import VENUE_DISCOVERY_PROMPT, NETWORKING_OPPORTUNITIES_PROMPT

logger = logging.getLogger(__name__)

def get_openai_client():
    """
    Safely initialize and return an OpenAI client, filtering out any unexpected parameters.
    This helps avoid issues with proxy settings or other environment variables affecting initialization.
    """
    try:
        # Only pass the API key to avoid any issues with proxies or other parameters
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        logger.error(f"Error initializing OpenAI client: {str(e)}")
        # As a fallback, try with an empty init and set api_key afterward
        try:
            client = OpenAI()
            client.api_key = settings.OPENAI_API_KEY
            return client
        except Exception as e2:
            logger.error(f"Fallback OpenAI client initialization also failed: {str(e2)}")
            raise

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

def discover_networking(state, city, radius):
    """
    Use OpenAI to discover networking opportunities near a location.
    
    Args:
        state (str): State name
        city (str): City name
        radius (int): Search radius in miles
        
    Returns:
        list: List of networking opportunity dictionaries
    """
    try:
        # Format the prompt with location data
        formatted_prompt = NETWORKING_OPPORTUNITIES_PROMPT.format(
            state=state,
            city=city,
            radius=radius
        )
        
        # Call OpenAI API - only pass API key
        client = get_openai_client()
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a networking opportunity discovery assistant."},
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
            opportunities = json.loads(json_str)
            return opportunities
        else:
            # Fallback if no JSON found
            logger.error(f"No JSON array found in response: {content}")
            return []
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        return [] 