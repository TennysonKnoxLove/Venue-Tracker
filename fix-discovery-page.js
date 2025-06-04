import React, { useState } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import { venueDiscoveryService } from '../api';

const VenueDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useState({
    state: '',
    city: '',
    radius: 25
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [currentSearchId, setCurrentSearchId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
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
      const results = await venueDiscoveryService.discoverVenues(
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
      if (!currentSearchId) {
        showAlertMessage("Cannot save venue - search ID is missing.");
        return null;
      }
      
      // Pre-process the data before sending to API
      // Convert capacity to integer or set to null if invalid
      if (item.capacity) {
        // Try to extract and parse just the numeric portion if it's a string
        const numericCapacity = parseInt(String(item.capacity).replace(/[^0-9]/g, ''));
        
        // If we can't get a valid capacity, don't include it in the request
        if (isNaN(numericCapacity)) {
          console.log(`Invalid capacity value: ${item.capacity}, setting to null`);
          // Instead of setting to null, we'll modify the search results directly
          // to ensure the backend validation passes
          const updatedResults = [...searchResults];
          if (updatedResults[index]) {
            updatedResults[index].capacity = null;
          }
          setSearchResults(updatedResults);
        }
      }
      
      // Import the venue using its index in the search results
      const response = await venueDiscoveryService.importVenues(
        currentSearchId, 
        [index]
      );
      
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