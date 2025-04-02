import apiClient from './client';

const venueService = {
  // Get all states
  getStates: async () => {
    try {
      const response = await apiClient.get('/states/');
      return response.data;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  },
  
  // Create new state
  createState: async (stateData) => {
    try {
      const response = await apiClient.post('/states/', stateData);
      return response.data;
    } catch (error) {
      console.error('Error creating state:', error);
      throw error;
    }
  },
  
  // Update state
  updateState: async (stateId, stateData) => {
    try {
      const response = await apiClient.put(`/states/${stateId}/`, stateData);
      return response.data;
    } catch (error) {
      console.error('Error updating state:', error);
      throw error;
    }
  },
  
  // Delete state
  deleteState: async (stateId) => {
    try {
      await apiClient.delete(`/states/${stateId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting state:', error);
      throw error;
    }
  },
  
  // Get venues
  getVenues: async (stateId = null) => {
    try {
      // Use the correct path format based on the venue_urls.py configuration
      const url = stateId ? `/venues/states/${stateId}/venues/` : '/venues/';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  },
  
  // Get venue details
  getVenueDetails: async (venueId) => {
    try {
      const response = await apiClient.get(`/venues/${venueId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching venue details:', error);
      throw error;
    }
  },
  
  // Create new venue
  createVenue: async (venueData) => {
    try {
      const response = await apiClient.post('/venues/', venueData);
      return response.data;
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    }
  },
  
  // Update venue
  updateVenue: async (venueId, venueData) => {
    try {
      const response = await apiClient.put(`/venues/${venueId}/`, venueData);
      return response.data;
    } catch (error) {
      console.error('Error updating venue:', error);
      throw error;
    }
  },
  
  // Delete venue
  deleteVenue: async (venueId) => {
    try {
      const response = await apiClient.delete(`/venues/${venueId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting venue:', error);
      throw error;
    }
  }
};

export default venueService; 