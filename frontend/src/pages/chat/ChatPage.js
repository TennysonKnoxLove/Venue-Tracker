import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomActions, useRooms } from './Rooms';

const ChatPage = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const navigate = useNavigate();

  useRooms({ showAllRooms, setRooms, setLoading, setError });

  const { handleCreateRoom, handleJoinRoom, toggleRoomView } = getRoomActions({
    rooms,
    newRoomName,
    showAllRooms,
    setRooms,
    setNewRoomName,
    setShowAllRooms,
    setError,
    navigate,
  });

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