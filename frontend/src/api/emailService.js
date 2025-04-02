import apiClient from './client';

const emailService = {
  // Generate an email using AI
  generateEmail: async (data) => {
    try {
      const response = await apiClient.post('/email-generator/generate/', data);
      return response.data;
    } catch (error) {
      console.error('Error generating email:', error);
      throw error;
    }
  },
  
  // Get outreach history
  getOutreachHistory: async () => {
    try {
      const response = await apiClient.get('/email-generator/outreach/');
      return response.data;
    } catch (error) {
      console.error('Error fetching outreach history:', error);
      throw error;
    }
  },
  
  // Get a specific outreach record
  getOutreach: async (id) => {
    try {
      const response = await apiClient.get(`/email-generator/outreach/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching outreach ${id}:`, error);
      throw error;
    }
  },
  
  // Delete an outreach record
  deleteOutreach: async (id) => {
    try {
      await apiClient.delete(`/email-generator/outreach/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting outreach ${id}:`, error);
      throw error;
    }
  }
};

export default emailService; 