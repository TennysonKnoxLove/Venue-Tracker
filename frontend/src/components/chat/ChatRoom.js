import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './ChatRoom.css';
import { useAuth } from '../../context/AuthContext.js';

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const messageInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Fetch messages from the REST API
  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${apiBaseUrl}/chat/rooms/${roomId}/messages/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Only update if we have new messages
        if (data.length !== messages.length || 
            (data.length > 0 && messages.length > 0 && data[data.length-1].id !== messages[messages.length-1].id)) {
          setMessages(data);
          setLastFetchTime(new Date());
        }
        // Clear any errors if fetch is successful
        if (error) setError(null);
      } else {
        console.error('Failed to fetch messages:', response.status);
        if (response.status === 401) {
          setError('Authentication error. Please log in again.');
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Network error when fetching messages.');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, messages.length, error]);

  // Fetch room details
  const fetchRoomDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${apiBaseUrl}/chat/rooms/${roomId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomDetails(data);
      } else {
        console.error('Error fetching room details:', response.statusText);
        setError('Failed to load chat room details');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Network error when loading chat room details');
    }
  }, [roomId]);

  // Send message via REST API
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const messageToSend = newMessage;
    // Clear input immediately for better UX
    setNewMessage('');
    
    // Optimistically add message to UI
    const tempMessage = {
      id: 'temp-' + Date.now(),
      content: messageToSend,
      username: user?.username,
      sender: { username: user?.username },
      timestamp: new Date().toISOString(),
      isPending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${apiBaseUrl}/chat/rooms/${roomId}/messages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: messageToSend })
      });
      
      if (!response.ok) {
        // Try alternative endpoint if first fails
        console.error("First endpoint failed, trying alternative...");
        const altResponse = await fetch(`${apiBaseUrl}/chat/rooms/${roomId}/post-new-message/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: messageToSend })
        });
        
        if (!altResponse.ok) {
          setError('Failed to send message. Please try again.');
          // Remove optimistic message if failed
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        }
      }
      
      // Trigger an immediate fetch to get the updated messages
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Network error when sending message.');
      // Remove optimistic message if failed
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  // Set up polling on component mount
  useEffect(() => {
    // Initial fetch
    fetchMessages();
    
    // Set up polling interval (every 1.5 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 1500);
    
    // Focus the input field
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
    
    // Clean up on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="chat-room-container loading">Loading chat room...</div>;
  }

  if (error) {
    return (
      <div className="chat-room-container error">
        <p>Error: {error}</p>
        <button onClick={() => navigate('/chat')}>Back to Chat Rooms</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{roomDetails?.name || `Chat Room ${roomId}`}</h2>
        {lastFetchTime && (
          <div className="last-update">
            Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="message-container">
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.sender?.username === user?.username ? 'own-message' : 'other-message'} ${msg.isPending ? 'pending' : ''}`}
            >
              <div className="message-header">
                <span className="username">{msg.sender?.username || msg.username}</span>
                <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.content || msg.message}</div>
              {msg.isPending && <div className="pending-indicator">Sending...</div>}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          ref={messageInputRef}
          disabled={isLoading}
        />
        <button type="submit" disabled={!newMessage.trim() || isLoading}>Send</button>
      </form>
    </div>
  );
};

export default ChatRoom; 