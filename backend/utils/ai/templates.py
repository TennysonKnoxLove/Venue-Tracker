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

VENUE_OUTREACH_EMAIL_PROMPT = """
Write a professional cold email to {venue_name} from {artist_name}, inquiring about
potential performance opportunities. You MUST use ALL of the following information in the email:

Artist Name: {artist_name}
Music Genres: {genres}
Bio: {bio}
{extra_details}

The email MUST include ALL of the following elements:
- A strong introduction of the artist using their bio information
- Clear expression of interest in performing at the venue
- Detailed mention of musical style/genres and any achievements from the bio
- Request for information about booking process
- Professional closing with contact information (email and phone if provided)
- All provided social media links formatted clearly in the email signature

Format as plain text email and make sure to incorporate EVERY piece of information provided above.
""" 