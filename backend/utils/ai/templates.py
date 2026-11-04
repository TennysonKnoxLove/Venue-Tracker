VENUE_DISCOVERY_PROMPT = """
List up to 5 music venues near {city}, {state}, within {radius} miles, that host live hip-hop or R&B.
Use null for email, website, capacity, open_time, or close_time when you do not know the real value.
open_time and close_time must be 24-hour HH:MM.
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