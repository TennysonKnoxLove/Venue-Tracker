#!/bin/bash

echo "Directly editing VenueDiscoveryPage.js inside the Docker container..."

# Create a temporary patch script
cat > /tmp/patch_discovery.sh << 'EOF'
#!/bin/sh
# This script will run inside the container to patch the file

cat > /app/src/pages/VenueDiscoveryPage.js << 'EOFJS'
import React, { useState, useEffect } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import { venueDiscoveryService } from '../api';

const VenueDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useState({
    state: '',
    city: '',
    radius: 25,
    searchTerms: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [currentSearchId, setCurrentSearchId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  // No discovery mode toggle - venues only
  const discoveryMode = 'venues';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    setSearchResults([]);
    
    try {
      // Only search for venues
      const results = await venueDiscoveryService.searchVenues(
        searchParams.state,
        searchParams.city,
        searchParams.radius
      );
      
      setSearchResults(results.results || []);
      setCurrentSearchId(results.id);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching:', error);
      setError('An error occurred during the search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveItem = async (item, index) => {
    try {
      const response = await venueDiscoveryService.saveVenue({
        name: item.name,
        address: item.address,
        city: item.city,
        state: item.state,
        postal_code: item.postal_code,
        country: item.country || 'USA',
        phone: item.phone,
        website: item.website,
        capacity: item.capacity,
        description: item.description
      });
      
      showAlertMessage(`${item.name} has been saved to your venues`);
      
      // Remove the item from the list
      setSearchResults(prev => 
        prev.filter((_, i) => i !== index)
      );
      
      return response;
    } catch (error) {
      console.error('Error saving item:', error);
      showAlertMessage(`Failed to save ${item.name}. Please try again.`);
      return null;
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  
  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
  };
  
  const renderVenue = (venue, index) => (
    <div key={index} className="border-2 border-gray-400 p-4 bg-white">
      <div className="flex justify-between">
        <h3 className="text-lg font-bold">{venue.name}</h3>
        <Button onClick={() => handleSaveItem(venue, index)}>Add to My Venues</Button>
      </div>
      <p className="text-sm">{venue.address}, {venue.city}, {venue.state} {venue.postal_code}</p>
      {venue.phone && <p className="text-sm">Phone: {venue.phone}</p>}
      {venue.website && (
        <p className="text-sm">
          Website: <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{venue.website}</a>
        </p>
      )}
      {venue.capacity && <p className="text-sm">Capacity: {venue.capacity}</p>}
      {venue.description && <p className="mt-2">{venue.description}</p>}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">AI Discovery</h2>
      
      {/* Windows 98 Alert Dialog */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="w-80 bg-[#c0c0c0] border-2 border-[#dfdfdf] border-t-2 border-l-2 border-r-[#404040] border-b-[#404040] shadow-md">
            <div className="bg-[#000080] text-white p-1 flex justify-between items-center">
              <div className="font-bold text-sm">Windows 98</div>
              <button 
                onClick={closeAlert}
                className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center text-xs border border-[#dfdfdf] border-r-[#404040] border-b-[#404040]"
              >
                x
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="flex mb-4">
                <div className="mr-3 text-2xl">ℹ️</div>
                <div className="text-sm">{alertMessage}</div>
              </div>
              <button 
                onClick={closeAlert}
                className="bg-[#c0c0c0] px-4 py-1 text-sm border-2 border-[#dfdfdf] border-t-2 border-l-2 border-r-[#404040] border-b-[#404040] active:border-[#404040] active:border-t-2 active:border-l-2 active:border-r-[#dfdfdf] active:border-b-[#dfdfdf]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* REMOVED: Discovery Mode Toggle Window */}
      
      <Window title="Search Parameters" className="mb-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="State"
              id="state"
              name="state"
              value={searchParams.state}
              onChange={handleChange}
              placeholder="e.g. California"
              required
            />
            
            <Input
              label="City"
              id="city"
              name="city"
              value={searchParams.city}
              onChange={handleChange}
              placeholder="e.g. Los Angeles"
              required
            />
            
            <Input
              type="number"
              label="Radius (miles)"
              id="radius"
              name="radius"
              value={searchParams.radius}
              onChange={handleChange}
              min="1"
              max="100"
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Discover Venues'}
            </Button>
          </div>
        </form>
      </Window>
      
      <Window title="Search Results">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isSearching ? (
          <div className="text-center py-8">
            <p>Searching for venues... Please wait.</p>
          </div>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <div>
              <div className="mb-4">
                <p>Found {searchResults.length} venues matching your criteria.</p>
                {currentSearchId && (
                  <p className="text-sm text-gray-500">Search ID: {currentSearchId}</p>
                )}
              </div>
              
              <div className="space-y-4">
                {searchResults.map((venue, index) => renderVenue(venue, index))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No venues found matching your criteria. Try different search parameters.</p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p>Enter search parameters and click "Discover Venues" to start searching.</p>
          </div>
        )}
      </Window>
    </div>
  );
};

export default VenueDiscoveryPage;
EOFJS

# Verify the file was written
echo "File updated. Here's the beginning of the modified file:"
head -20 /app/src/pages/VenueDiscoveryPage.js
EOF

# Copy the script to the server
scp /tmp/patch_discovery.sh root@147.182.168.13:/tmp/

# Run the script in the container
ssh root@147.182.168.13 << 'ENDSSH'
  # Make the script executable
  chmod +x /tmp/patch_discovery.sh
  
  # Run it in the container
  docker exec $(docker ps -q --filter name=root-frontend) /bin/sh /tmp/patch_discovery.sh
  
  # Restart the container to apply changes
  docker restart $(docker ps -q --filter name=root-frontend)
  
  echo "Container restarted. Changes should now be visible."
ENDSSH

echo "Done! The Networking Opportunities tab should now be completely removed." 