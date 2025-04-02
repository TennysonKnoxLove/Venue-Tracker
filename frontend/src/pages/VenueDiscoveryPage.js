import React, { useState } from 'react';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import Input from '../components/layout/Input';
import { venueDiscoveryService } from '../api';

const VenueDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useState({
    state: '',
    city: '',
    radius: 10,
    searchTerms: 'music events, artist opportunities, music industry networking'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearchId, setCurrentSearchId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [savedItems, setSavedItems] = useState([]);
  const [discoveryMode, setDiscoveryMode] = useState('venues'); // 'venues' or 'opportunities'
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleDiscoveryMode = () => {
    setDiscoveryMode(prev => prev === 'venues' ? 'opportunities' : 'venues');
    // Clear previous search results when switching modes
    setSearchResults([]);
    setHasSearched(false);
    setSavedItems([]);
    setCurrentSearchId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setSavedItems([]);
    
    try {
      if (discoveryMode === 'venues') {
        // Use the actual API for venue discovery
        const result = await venueDiscoveryService.discoverVenues(
          searchParams.state,
          searchParams.city,
          searchParams.radius
        );
        setSearchResults(result.results || []);
        setCurrentSearchId(result.id);
        console.log("Venue search results with ID:", result.id);
      } else {
        // Use the API for networking opportunity discovery
        const result = await venueDiscoveryService.discoverNetworkingOpportunities(
          searchParams.state,
          searchParams.searchTerms
        );
        setSearchResults(result.results || []);
        setCurrentSearchId(result.id);
        console.log("Opportunity search results with ID:", result.id);
      }
    } catch (err) {
      console.error(`Error during ${discoveryMode} discovery:`, err);
      setError("Network is busy; please try again later.");
      setSearchResults([]);
      setCurrentSearchId(null);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSaveItem = async (item, index) => {
    if (!currentSearchId) {
      showAlertMessage("No active search session. Please try searching again.");
      return;
    }
    
    try {
      let response;
      
      if (discoveryMode === 'venues') {
        // Save venue
        response = await venueDiscoveryService.importVenues(currentSearchId, [index]);
        console.log("Import venue response:", response);
      } else {
        // Save opportunity
        response = await venueDiscoveryService.importOpportunities(currentSearchId, [index]);
        console.log("Import opportunity response:", response);
      }
      
      if (response.total_imported > 0) {
        showAlertMessage(`${discoveryMode === 'venues' ? 'Venue' : 'Opportunity'} "${item.name || item.title}" saved to your collection.`);
        setSavedItems([...savedItems, index]);
      } else if (response.errors && response.errors.length > 0) {
        showAlertMessage(`Error saving ${discoveryMode === 'venues' ? 'venue' : 'opportunity'}: ${response.errors[0]}`);
      } else {
        showAlertMessage(`${discoveryMode === 'venues' ? 'Venue' : 'Opportunity'} saved successfully!`);
        setSavedItems([...savedItems, index]);
      }
    } catch (err) {
      console.error(`Error saving ${discoveryMode === 'venues' ? 'venue' : 'opportunity'}:`, err);
      showAlertMessage(`Failed to save ${discoveryMode === 'venues' ? 'venue' : 'opportunity'}. Please try again.`);
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
    <div key={index} className="border p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold">{venue.name}</h3>
        {savedItems.includes(index) ? (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">
            ✓
          </div>
        ) : (
          <Button onClick={() => handleSaveItem(venue, index)}>Save</Button>
        )}
      </div>
      <p className="text-sm my-2">{venue.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <p><strong>Address:</strong> {venue.address}, {venue.city}, {venue.state} {venue.zipcode}</p>
        <p><strong>Phone:</strong> {venue.phone}</p>
        <p><strong>Email:</strong> {venue.email}</p>
        <p><strong>Website:</strong> <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{venue.website}</a></p>
        <p><strong>Capacity:</strong> {venue.capacity}</p>
        <p><strong>Genres:</strong> {venue.genres}</p>
      </div>
    </div>
  );
  
  const renderOpportunity = (opportunity, index) => (
    <div key={index} className="border p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold">{opportunity.title}</h3>
        {savedItems.includes(index) ? (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">
            ✓
          </div>
        ) : (
          <Button onClick={() => handleSaveItem(opportunity, index)}>Save</Button>
        )}
      </div>
      <p className="text-sm my-2">{opportunity.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <p><strong>Organization:</strong> {opportunity.organization}</p>
        <p><strong>Location:</strong> {opportunity.location}</p>
        <p><strong>Deadline:</strong> {opportunity.deadline}</p>
        <p><strong>Type:</strong> {opportunity.opportunity_type}</p>
        {opportunity.website && (
          <p><strong>Website:</strong> <a href={opportunity.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{opportunity.website}</a></p>
        )}
        {opportunity.compensation && (
          <p><strong>Compensation:</strong> {opportunity.compensation}</p>
        )}
      </div>
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
      
      {/* Discovery Mode Toggle */}
      <Window title="Discovery Mode" className="mb-4">
        <div className="flex justify-center mb-4">
          <div className="inline-flex border-0 space-x-2">
            <button
              onClick={() => discoveryMode === 'opportunities' && toggleDiscoveryMode()}
              className={`px-4 py-2 text-sm border-2 ${
                discoveryMode === 'venues' 
                  ? 'bg-[#c0c0c0] border-[#808080] border-r-[#ffffff] border-b-[#ffffff] font-bold' 
                  : 'bg-[#c0c0c0] border-[#ffffff] border-r-[#808080] border-b-[#808080]'
              }`}
            >
              Venues
            </button>
            <button
              onClick={() => discoveryMode === 'venues' && toggleDiscoveryMode()}
              className={`px-4 py-2 text-sm border-2 ${
                discoveryMode === 'opportunities' 
                  ? 'bg-[#c0c0c0] border-[#808080] border-r-[#ffffff] border-b-[#ffffff] font-bold' 
                  : 'bg-[#c0c0c0] border-[#ffffff] border-r-[#808080] border-b-[#808080]'
              }`}
            >
              Networking Opportunities
            </button>
          </div>
        </div>
      </Window>
      
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
            
            {discoveryMode === 'venues' ? (
              <>
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
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block mb-1">Search Terms</label>
                <textarea
                  id="searchTerms"
                  name="searchTerms"
                  value={searchParams.searchTerms}
                  onChange={handleChange}
                  placeholder="e.g. music events, artist opportunities, music industry networking"
                  className="w-full border-2 border-gray-400 bg-white p-1"
                  rows="3"
                  required
                />
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : `Discover ${discoveryMode === 'venues' ? 'Venues' : 'Opportunities'}`}
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
            <p>Searching for {discoveryMode === 'venues' ? 'venues' : 'opportunities'}... Please wait.</p>
          </div>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <div>
              <div className="mb-4">
                <p>Found {searchResults.length} {discoveryMode === 'venues' ? 'venues' : 'opportunities'} matching your criteria.</p>
                {currentSearchId && (
                  <p className="text-sm text-gray-500">Search ID: {currentSearchId}</p>
                )}
              </div>
              
              <div className="space-y-4">
                {discoveryMode === 'venues' 
                  ? searchResults.map((venue, index) => renderVenue(venue, index))
                  : searchResults.map((opportunity, index) => renderOpportunity(opportunity, index))
                }
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No {discoveryMode === 'venues' ? 'venues' : 'opportunities'} found matching your criteria. Try different search parameters.</p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p>Enter search parameters and click "Discover {discoveryMode === 'venues' ? 'Venues' : 'Opportunities'}" to start searching.</p>
          </div>
        )}
      </Window>
    </div>
  );
};

export default VenueDiscoveryPage;