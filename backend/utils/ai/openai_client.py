import logging
from django.conf import settings
from openai import OpenAI
from pydantic import BaseModel, Field
from .templates import VENUE_DISCOVERY_PROMPT

_CLOCK_TIME = r'^([01][0-9]|2[0-3]):[0-5][0-9]$'

class DiscoveredVenue(BaseModel):
    name: str
    description: str
    address: str
    city: str
    state: str
    zipcode: str
    phone: str
    email: str | None = Field(description="A valid email address, or null if unknown.")
    website: str | None = Field(description="An absolute http or https URL, or null if unknown.")
    capacity: int | None = Field(description="Estimated room capacity, or null if unknown.")
    genres: str
    open_time: str | None = Field(
        description="Opening time as 24-hour HH:MM, or null if unknown.",
        pattern=_CLOCK_TIME,
    )
    close_time: str | None = Field(
        description="Closing time as 24-hour HH:MM, or null if unknown.",
        pattern=_CLOCK_TIME,
    )

class VenueDiscoveryResult(BaseModel):
    venues: list[DiscoveredVenue]

class OutreachEmail(BaseModel):
    email: str = Field(description="The complete plain-text email, including the subject line and signature.")

logger = logging.getLogger(__name__)

def get_openai_client():
    """Return an OpenAI client using the API key from settings."""
    return OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_completion(prompt, max_completion_tokens=500):
    """Generate a chat completion for a single user prompt."""
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_completion_tokens=max_completion_tokens,
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
        response = client.chat.completions.parse(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a venue discovery assistant."},
                {"role": "user", "content": formatted_prompt}
            ],
            max_completion_tokens=settings.OPENAI_MAX_COMPLETION_TOKENS,
            response_format=VenueDiscoveryResult,
        )

        message = response.choices[0].message
        if message.refusal:
            logger.error("Venue discovery refused: %s", message.refusal)
            return []
        if message.parsed is None:
            logger.error(
                "Venue discovery returned no parsed result (finish_reason=%s)",
                response.choices[0].finish_reason,
            )
            return []
        return [venue.model_dump() for venue in message.parsed.venues]
            
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        return []

def generate_outreach_email(prompt):
    """Write a venue outreach email using the same structured completion as venue discovery."""
    client = get_openai_client()
    response = client.chat.completions.parse(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You write professional venue booking emails."},
            {"role": "user", "content": prompt},
        ],
        max_completion_tokens=settings.OPENAI_MAX_COMPLETION_TOKENS,
        response_format=OutreachEmail,
    )

    message = response.choices[0].message
    if message.refusal:
        raise RuntimeError(message.refusal)
    if message.parsed is None or not message.parsed.email.strip():
        raise RuntimeError(
            f"Email generation returned no text (finish_reason={response.choices[0].finish_reason})"
        )
    return message.parsed.email.strip()
