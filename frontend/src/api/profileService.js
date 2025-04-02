import apiClient from './client';

const profileService = {
  // Get the user's profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profiles/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Update the user's profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.patch('/profiles/profile/update/', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Get all social links
  getSocialLinks: async () => {
    try {
      const response = await apiClient.get('/profiles/social-links/');
      return response.data;
    } catch (error) {
      console.error('Error fetching social links:', error);
      throw error;
    }
  },
  
  // Add a new social link
  addSocialLink: async (linkData) => {
    try {
      const response = await apiClient.post('/profiles/social-links/', linkData);
      return response.data;
    } catch (error) {
      console.error('Error adding social link:', error);
      throw error;
    }
  },
  
  // Update a social link
  updateSocialLink: async (id, linkData) => {
    try {
      const response = await apiClient.put(`/profiles/social-links/${id}/`, linkData);
      return response.data;
    } catch (error) {
      console.error('Error updating social link:', error);
      throw error;
    }
  },
  
  // Delete a social link
  deleteSocialLink: async (id) => {
    try {
      await apiClient.delete(`/profiles/social-links/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting social link:', error);
      throw error;
    }
  },
  
  // Reorder social links
  reorderSocialLinks: async (linkIds) => {
    try {
      const response = await apiClient.post('/profiles/social-links/reorder/', {
        links_order: linkIds
      });
      return response.data;
    } catch (error) {
      console.error('Error reordering social links:', error);
      throw error;
    }
  }
};

export default profileService; 