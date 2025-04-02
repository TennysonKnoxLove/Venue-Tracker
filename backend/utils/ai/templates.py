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

NETWORKING_OPPORTUNITIES_PROMPT = """
You are a knowledgeable assistant that helps find networking opportunities for musicians and music industry professionals.
Based on the following location parameters, provide information about potential networking events and opportunities:

- State: {state}
- City: {city}
- Radius: {radius} miles

Please provide information in the following structured format for each opportunity:
```json
[
  {{
    "name": "Event/Opportunity Name",
    "description": "Brief description of the opportunity",
    "type": "Event Type (e.g. Conference, Open Mic, Meetup, Workshop)",
    "address": "Full street address if available",
    "city": "City name",
    "state": "State abbreviation",
    "date": "Date of event if applicable (YYYY-MM-DD format, or 'Recurring' with details)",
    "time": "Time of event if applicable",
    "cost": "Cost information if applicable",
    "website": "Website URL if available",
    "contact": "Contact information if available"
  }},
  // Additional opportunities...
]
```

Focus on industry-specific networking opportunities such as:
- Music industry conferences and meetups
- Producer/artist networking events
- Open mic nights with industry attendance
- Music workshops and masterclasses
- Industry showcases
- Artist collectives or group meetings

Provide up to 10 opportunities that match these criteria, ensuring the JSON format is valid.
""" 