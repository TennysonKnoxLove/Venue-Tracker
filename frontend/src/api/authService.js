import apiClient from './client';

const authService = {
  // Login user
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login/', {
        username,
        password
      });
      
      // Save token to localStorage
      if (response.data.access) {
        localStorage.setItem('authToken', response.data.access);
        
        // If there's a refresh token, save it too
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    // You can also call an API endpoint to invalidate the token on the server side
    // but we'll keep it simple for now
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/user/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/password-reset/request/', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  // Verify and reset password
  verifyPasswordReset: async (email, verification_code, new_password) => {
    try {
      const response = await apiClient.post('/auth/password-reset/verify/', { 
        email, 
        verification_code, 
        new_password 
      });
      return response.data;
    } catch (error) {
      console.error('Password reset verification error:', error);
      throw error;
    }
  }
};

export default authService; 