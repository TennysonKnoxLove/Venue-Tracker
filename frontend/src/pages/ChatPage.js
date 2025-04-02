import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available chat rooms
    const fetchRooms = async () => {
      try {
        setLoading(true);
        // Get user's rooms by default
        const endpoint = showAllRooms ? '/chat/rooms/all_rooms/' : '/chat/rooms/';
        const response = await apiClient.get(endpoint);
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('Failed to load chat rooms');
        setLoading(false);
      }
    };

    fetchRooms();
  }, [showAllRooms]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    try {
      const response = await apiClient.post('/chat/rooms/', { name: newRoomName });
      
      // Refresh the rooms list
      setShowAllRooms(false); // Switch to "My Rooms" view
      const updatedRoomsResponse = await apiClient.get('/chat/rooms/');
      setRooms(updatedRoomsResponse.data);
      setNewRoomName('');
      
      // Navigate to the newly created room
      navigate(`/chat/${response.data.id}`);
    } catch (err) {
      console.error('Error creating chat room:', err);
      setError('Failed to create chat room');
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      // If not already a member, join the room
      const room = rooms.find(r => r.id === roomId);
      if (room && !room.is_member) {
        const joinResponse = await apiClient.post(`/chat/rooms/${roomId}/join/`);
        console.log('Room join response:', joinResponse.data);
        
        // Refresh the rooms list to update membership status
        const endpoint = showAllRooms ? '/chat/rooms/all_rooms/' : '/chat/rooms/';
        const updatedRoomsResponse = await apiClient.get(endpoint);
        setRooms(updatedRoomsResponse.data);
      }
      
      // Navigate to the room
      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error('Error joining room:', err);
      const errorMessage = err.response?.data?.error || 'Failed to join the room';
      setError(errorMessage);
    }
  };

  const toggleRoomView = () => {
    setShowAllRooms(!showAllRooms);
  };

  if (loading) {
    return <div className="text-center py-8">Loading chat rooms...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Chat Rooms</h2>

      <div>
        <div className="window-win98 mb-4">
          <div className="window-title-win98">
            <div className="text-black font-bold px-2">Create New Room</div>
          </div>
          <div className="p-4 bg-gray-200">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-bold" htmlFor="room-name">
                  Room Name
                </label>
                <input
                  id="room-name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="w-full border-2 border-gray-400 p-2"
                />
              </div>
              <button 
                onClick={handleCreateRoom}
                className="btn-win98"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <button
            onClick={toggleRoomView}
            className="btn-win98"
          >
            {showAllRooms ? 'Show My Rooms' : 'Show All Available Rooms'}
          </button>
        </div>

        <div className="window-win98">
          <div className="window-title-win98">
            <div className="text-black font-bold px-2">
              {showAllRooms ? 'All Available Rooms' : 'My Rooms'}
            </div>
          </div>
          <div className="p-4 bg-gray-200">
            {rooms.length === 0 ? (
              <p>No chat rooms available. Create one to get started!</p>
            ) : (
              <div className="space-y-2">
                {rooms.map(room => (
                  <div key={room.id} className="flex items-center justify-between p-2 border-b border-gray-400">
                    <div className="font-bold">{room.name}</div>
                    <div className="flex items-center space-x-2">
                      {showAllRooms && room.is_member && (
                        <span className="text-green-600 text-sm">Member</span>
                      )}
                      <button 
                        onClick={() => handleJoinRoom(room.id)}
                        className="btn-win98"
                      >
                        {room.is_member ? 'Enter Room' : 'Join Room'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatPage; 