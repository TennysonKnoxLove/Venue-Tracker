# Networking Opportunities Search

## Overview
This document outlines the implementation of an AI-powered networking opportunities search feature that helps users discover music industry events, meetups, and connection opportunities in their area.

## Feature Requirements
- AI-powered search for networking opportunities
- Location-based results
- Integration with venue search interface
- Windows 98 visual aesthetic

## API Integration

### OpenAI Prompt Template
```python
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
```

## Backend Implementation

### Update AI Utility
```python
# utils/ai/openai_client.py
import json
import openai
from django.conf import settings
from .templates import VENUE_DISCOVERY_PROMPT, NETWORKING_OPPORTUNITIES_PROMPT

# ... existing discover_venues function ...

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
```

### Create NetworkOpportunity Model
```python
# api/ai/models.py

# ... existing AISearchQuery model ...

class NetworkingSearchQuery(models.Model):
    """Stores networking opportunity search queries and results from AI"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='networking_searches')
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    radius = models.IntegerField()
    results = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Networking search near {self.city}, {self.state} ({self.radius} miles)"
```

### Views
```python
# api/ai/views.py

# ... existing VenueDiscoveryView ...

class NetworkingDiscoveryView(APIView):
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
            
        # Call OpenAI API for networking suggestions
        opportunities = discover_networking(state, city, radius)
        
        # Save the search query and results
        search_query = NetworkingSearchQuery.objects.create(
            user=request.user,
            state=state,
            city=city,
            radius=radius,
            results=opportunities
        )
        
        serializer = NetworkingSearchQuerySerializer(search_query)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def get(self, request):
        """Get user's previous networking searches"""
        searches = NetworkingSearchQuery.objects.filter(user=request.user)
        serializer = NetworkingSearchQuerySerializer(searches, many=True)
        return Response(serializer.data)
```

### Serializers
```python
# api/ai/serializers.py

# ... existing AISearchQuerySerializer ...

class NetworkingSearchQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkingSearchQuery
        fields = ['id', 'state', 'city', 'radius', 'results', 'created_at']
        read_only_fields = ['id', 'created_at']
```

### URLs
```python
# api/ai/urls.py
from django.urls import path
from .views import VenueDiscoveryView, NetworkingDiscoveryView

urlpatterns = [
    path('search/venues/', VenueDiscoveryView.as_view(), name='ai-venue-search'),
    path('search/networking/', NetworkingDiscoveryView.as_view(), name='ai-networking-search'),
]
```

## Frontend Implementation

### API Service
```javascript
// src/api/aiService.js
import apiClient from './client';

const aiService = {
  // ... existing venue search methods ...
  
  // Search for networking opportunities
  searchNetworkingOpportunities: async (searchData) => {
    try {
      const response = await apiClient.post('/ai/search/networking/', searchData);
      return response.data;
    } catch (error) {
      console.error('Error searching for networking opportunities:', error);
      throw error;
    }
  },
  
  // Get networking search history
  getNetworkingSearches: async () => {
    try {
      const response = await apiClient.get('/ai/search/networking/');
      return response.data;
    } catch (error) {
      console.error('Error fetching networking searches:', error);
      throw error;
    }
  }
};

export default aiService;
```

### Components

#### NetworkingSearch.js
```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import Select from '../components/layout/Select';
import { aiService } from '../api/aiService';
import states from '../data/states';

const NetworkingSearch = () => {
  const [searchParams, setSearchParams] = useState({
    state: '',
    city: '',
    radius: 25
  });
  
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchParams.state || !searchParams.city) {
      setError('Please select a state and enter a city');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const result = await aiService.searchNetworkingOpportunities(searchParams);
      setSearchResult(result);
    } catch (err) {
      setError('Failed to search for networking opportunities');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Find Networking Opportunities</h3>
      
      <Window title="Search Parameters" className="mb-4">
        <form onSubmit={handleSearch} className="p-4 space-y-4">
          <Select
            label="State"
            id="state"
            name="state"
            value={searchParams.state}
            onChange={handleChange}
            required
          >
            <option value="">Select a state...</option>
            {states.map(state => (
              <option key={state.abbreviation} value={state.name}>
                {state.name}
              </option>
            ))}
          </Select>
          
          <Input
            label="City"
            id="city"
            name="city"
            value={searchParams.city}
            onChange={handleChange}
            placeholder="Enter city name"
            required
          />
          
          <div>
            <label className="block mb-2 font-bold" htmlFor="radius">Search Radius (miles)</label>
            <input
              type="range"
              id="radius"
              name="radius"
              min="5"
              max="100"
              step="5"
              value={searchParams.radius}
              onChange={handleChange}
              className="w-full"
            />
            <div className="text-center">{searchParams.radius} miles</div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSearching}
              className="px-6"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>
      </Window>
      
      {searchResult && searchResult.results && searchResult.results.length > 0 ? (
        <Window title="Networking Opportunities" className="mb-4">
          <div className="p-4">
            <p className="mb-4 italic text-gray-600">
              Found {searchResult.results.length} networking opportunities near {searchParams.city}, {searchParams.state}
            </p>
            
            <div className="space-y-4">
              {searchResult.results.map((opportunity, index) => (
                <div key={index} className="border rounded p-4 bg-white">
                  <h4 className="font-bold text-lg mb-1">{opportunity.name}</h4>
                  <div className="text-sm bg-gray-100 inline-block px-2 py-1 rounded mb-2">
                    {opportunity.type}
                  </div>
                  <p className="mb-2">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                    {opportunity.date && (
                      <div>
                        <span className="font-semibold">Date:</span> {opportunity.date}
                      </div>
                    )}
                    {opportunity.time && (
                      <div>
                        <span className="font-semibold">Time:</span> {opportunity.time}
                      </div>
                    )}
                    {opportunity.cost && (
                      <div>
                        <span className="font-semibold">Cost:</span> {opportunity.cost}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Location:</span> {opportunity.city}, {opportunity.state}
                    </div>
                    {opportunity.address && (
                      <div>
                        <span className="font-semibold">Address:</span> {opportunity.address}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    {opportunity.website && (
                      <a
                        href={opportunity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Website
                      </a>
                    )}
                    {opportunity.contact && (
                      <div className="text-sm">
                        <span className="font-semibold">Contact:</span> {opportunity.contact}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Window>
      ) : searchResult && searchResult.results ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          No networking opportunities found in this area. Try expanding your search radius or checking another city.
        </div>
      ) : null}
    </div>
  );
};

export default NetworkingSearch;
```

## Integration with Venue Search

The networking opportunities search will be integrated with the existing venue search page:

```jsx
// VenueSearchPage.js
import React, { useState } from 'react';
import Tabs from '../components/layout/Tabs';
import VenueSearch from '../components/venues/VenueSearch';
import NetworkingSearch from '../components/network/NetworkingSearch';

const VenueSearchPage = () => {
  const [activeTab, setActiveTab] = useState('venues');
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">AI-Powered Search</h2>
      
      <Tabs 
        tabs={[
          { id: 'venues', label: 'Venue Search' },
          { id: 'networking', label: 'Networking Opportunities' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      <div className="mt-4">
        {activeTab === 'venues' ? (
          <VenueSearch />
        ) : (
          <NetworkingSearch />
        )}
      </div>
    </div>
  );
};

export default VenueSearchPage;
```

## Windows 98 Styling Additions

To maintain the Windows 98 aesthetic for the networking search:

```css
.search-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  background: #fff;
  border: inset 2px #dfdfdf;
}

.search-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  cursor: pointer;
}
```

## Integration Steps

1. Run migrations to create the new database table:
```bash
python manage.py makemigrations ai
python manage.py migrate ai
```

2. Update the venue search page to include the networking tab:
```jsx
// Update routes in App.js or routing configuration to ensure venue search is accessible
<Route path="/search" element={<VenueSearchPage />} />
```

3. Add necessary imports and component files:
```bash
# Create the new component file
touch src/components/network/NetworkingSearch.js
```

## Testing Plan

1. Test AI prompt effectiveness for generating relevant networking opportunities
2. Verify search parameters work correctly
3. Test frontend display of search results
4. Verify Windows 98 styling across different screen sizes
5. Test integration with the venue search page 