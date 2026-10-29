import { useState } from 'react';
import { venueDiscoveryService } from '../../api';

const initialSearchParams = {
  state: '',
  city: '',
  radius: 10,
  searchTerms: 'music events, artist opportunities, music industry networking'
};

export function useVenueDiscovery() {
  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearchId, setCurrentSearchId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [savedItems, setSavedItems] = useState([]);
  const [discoveryMode, setDiscoveryMode] = useState('venues');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleDiscoveryMode = () => {
    setDiscoveryMode(prev => prev === 'venues' ? 'opportunities' : 'venues');
    setSearchResults([]);
    setHasSearched(false);
    setSavedItems([]);
    setCurrentSearchId(null);
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setSavedItems([]);

    try {
      if (discoveryMode === 'venues') {
        const result = await venueDiscoveryService.discoverVenues(
          searchParams.state,
          searchParams.city,
          searchParams.radius
        );
        setSearchResults(result.results || []);
        setCurrentSearchId(result.id);
        console.log('Venue search results with ID:', result.id);
      } else {
        const result = await venueDiscoveryService.discoverNetworkingOpportunities(
          searchParams.state,
          searchParams.searchTerms
        );
        setSearchResults(result.results || []);
        setCurrentSearchId(result.id);
        console.log('Opportunity search results with ID:', result.id);
      }
    } catch (err) {
      console.error(`Error during ${discoveryMode} discovery:`, err);
      setError('Network is busy; please try again later.');
      setSearchResults([]);
      setCurrentSearchId(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveItem = async (item, index) => {
    if (!currentSearchId) {
      showAlertMessage('No active search session. Please try searching again.');
      return;
    }

    const itemLabel = discoveryMode === 'venues' ? 'Venue' : 'Opportunity';
    const itemName = item.name || item.title;

    try {
      const response = discoveryMode === 'venues'
        ? await venueDiscoveryService.importVenues(currentSearchId, [index])
        : await venueDiscoveryService.importOpportunities(currentSearchId, [index]);

      console.log(`Import ${discoveryMode === 'venues' ? 'venue' : 'opportunity'} response:`, response);

      if (response.total_imported > 0) {
        showAlertMessage(`${itemLabel} "${itemName}" saved to your collection.`);
        setSavedItems([...savedItems, index]);
      } else if (response.errors && response.errors.length > 0) {
        showAlertMessage(`Error saving ${itemLabel.toLowerCase()}: ${response.errors[0]}`);
      } else {
        showAlertMessage(`${itemLabel} saved successfully!`);
        setSavedItems([...savedItems, index]);
      }
    } catch (err) {
      console.error(`Error saving ${itemLabel.toLowerCase()}:`, err);
      showAlertMessage(`Failed to save ${itemLabel.toLowerCase()}. Please try again.`);
    }
  };

  return {
    searchParams,
    isSearching,
    searchResults,
    hasSearched,
    error,
    currentSearchId,
    showAlert,
    alertMessage,
    savedItems,
    discoveryMode,
    handleChange,
    toggleDiscoveryMode,
    handleSubmit,
    handleSaveItem,
    closeAlert,
  };
}
