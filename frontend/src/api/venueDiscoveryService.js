import apiClient from './client';

const venueDiscoveryService = {
  // Search for venues using AI
  discoverVenues: async (state, city, radius) => {
    try {
      const response = await apiClient.post('/ai/discover/', {
        state,
        city,
        radius
      });
      return response.data;
    } catch (error) {
      console.error('Error discovering venues:', error);
      throw error;
    }
  },
  
  // Search for networking opportunities using AI
  discoverNetworkingOpportunities: async (state, searchTerms) => {
    try {
      const response = await apiClient.post('/ai/discover-opportunities/', {
        state,
        search_terms: searchTerms
      });
      return response.data;
    } catch (error) {
      console.error('Error discovering networking opportunities:', error);
      throw error;
    }
  },
  
  // Get search history
  getSearchHistory: async () => {
    try {
      const response = await apiClient.get('/ai/searches/');
      return response.data;
    } catch (error) {
      console.error('Error fetching search history:', error);
      throw error;
    }
  },
  
  // Get specific search results
  getSearchResults: async (searchId) => {
    try {
      const response = await apiClient.get(`/ai/searches/${searchId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching search results:', error);
      throw error;
    }
  },
  
  // Import venues from search results
  importVenues: async (searchId, venueIndices) => {
    try {
      const response = await apiClient.post(`/ai/searches/${searchId}/import/`, {
        venue_indices: venueIndices
      });
      return response.data;
    } catch (error) {
      console.error('Error importing venues:', error);
      throw error;
    }
  },
  
  // Import networking opportunities from search results
  importOpportunities: async (searchId, opportunityIndices) => {
    try {
      const response = await apiClient.post(`/ai/searches/${searchId}/import-opportunities/`, {
        opportunity_indices: opportunityIndices
      });
      return response.data;
    } catch (error) {
      console.error('Error importing opportunities:', error);
      throw error;
    }
  }
};

export default venueDiscoveryService; 