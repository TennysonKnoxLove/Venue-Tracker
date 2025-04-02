import apiClient from './client';

const audioService = {
  // Get all audio files
  getAudioFiles: async () => {
    try {
      const response = await apiClient.get('/audio/');
      return response.data;
    } catch (error) {
      console.error('Error fetching audio files:', error);
      throw error;
    }
  },
  
  // Upload new audio file
  uploadAudio: async (file, title) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      
      const response = await apiClient.post('/audio/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  },
  
  // Get audio file details
  getAudioDetails: async (audioId) => {
    try {
      const response = await apiClient.get(`/audio/${audioId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audio details:', error);
      throw error;
    }
  },
  
  // Apply edit to audio file
  applyEdit: async (audioId, editType, parameters) => {
    try {
      const response = await apiClient.post(`/audio/${audioId}/edit/`, {
        edit_type: editType,
        parameters
      });
      return response.data;
    } catch (error) {
      console.error('Error applying audio edit:', error);
      throw error;
    }
  },
  
  // Get edit history for audio file
  getEditHistory: async (audioId) => {
    try {
      const response = await apiClient.get(`/audio/${audioId}/edits/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching edit history:', error);
      throw error;
    }
  },
  
  // Delete audio file
  deleteAudio: async (audioId) => {
    try {
      const response = await apiClient.delete(`/audio/${audioId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting audio:', error);
      throw error;
    }
  },
  
  // Download audio file (returns blob)
  downloadAudio: async (audioId, fileName) => {
    try {
      const response = await apiClient.get(`/audio/${audioId}/download/`, {
        responseType: 'blob'
      });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw error;
    }
  },
  
  // Get download URL for processed audio (deprecated - use downloadAudio instead)
  getDownloadUrl: (audioId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No authentication token found for download.');
    }
    return `${apiClient.defaults.baseURL}/audio/${audioId}/download/`;
  }
};

export default audioService; 