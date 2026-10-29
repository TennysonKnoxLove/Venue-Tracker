import { useEffect } from 'react';
import { chatService } from '../../api';

export function useRooms({ showAllRooms, setRooms, setLoading, setError }) {
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const rooms = showAllRooms
          ? await chatService.getAllRooms()
          : await chatService.getRooms();
        setRooms(rooms);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('Failed to load chat rooms');
        setLoading(false);
      }
    };

    fetchRooms();
  }, [showAllRooms, setRooms, setLoading, setError]);
}

export function getRoomActions({
  rooms,
  newRoomName,
  showAllRooms,
  setRooms,
  setNewRoomName,
  setShowAllRooms,
  setError,
  navigate,
}) {
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    try {
      const room = await chatService.createRoom(newRoomName);

      setShowAllRooms(false);
      const updatedRooms = await chatService.getRooms();
      setRooms(updatedRooms);
      setNewRoomName('');

      navigate(`/chat/${room.id}`);
    } catch (err) {
      console.error('Error creating chat room:', err);
      setError('Failed to create chat room');
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      const room = rooms.find((entry) => entry.id === roomId);
      if (room && !room.is_member) {
        const joinResponse = await chatService.joinRoom(roomId);
        console.log('Room join response:', joinResponse);
      }

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

  return {
    handleCreateRoom,
    handleJoinRoom,
    toggleRoomView,
  };
}
