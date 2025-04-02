import apiClient from './client';

const chatService = {
  // Get all available chat rooms
  getRooms: async () => {
    try {
      const response = await apiClient.get('/chat/rooms/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
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
  
  // Get messages for a specific room
  getMessages: async (roomId) => {
    try {
      const response = await apiClient.get(`/chat/rooms/${roomId}/messages/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },
  
  // Send a message (REST fallback if WebSocket is unavailable)
  sendMessage: async (roomId, content) => {
    try {
      const response = await apiClient.post(`/chat/rooms/${roomId}/messages/`, { content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
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
  },
  
  // Leave a chat room
  leaveRoom: async (roomId) => {
    try {
      const response = await apiClient.post(`/chat/rooms/${roomId}/leave/`);
      return response.data;
    } catch (error) {
      console.error('Error leaving chat room:', error);
      throw error;
    }
  }
};

export default chatService; 