import json
import openai
from django.conf import settings
from .templates import VENUE_DISCOVERY_PROMPT, NETWORKING_OPPORTUNITIES_PROMPT

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
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
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
            return []
            
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return [] 