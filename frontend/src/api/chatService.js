import apiClient from './client';

const chatService = {
  // Get the current user's chat rooms
  getRooms: async () => {
    try {
      const response = await apiClient.get('/chat/rooms/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // Get every chat room, including ones the user has not joined
  getAllRooms: async () => {
    try {
      const response = await apiClient.get('/chat/rooms/all_rooms/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all chat rooms:', error);
      throw error;
    }
  },
  
  // Create a new chat room
  createRoom: async (name) => {
    try {
      const response = await apiClient.post('/chat/rooms/', { name });
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  },
  
  // Join a chat room
  joinRoom: async (roomId) => {
    try {
      const response = await apiClient.post(`/chat/rooms/${roomId}/join/`);
      return response.data;
    } catch (error) {
      console.error('Error joining chat room:', error);
      throw error;
    }
  }
};

export default chatService; 