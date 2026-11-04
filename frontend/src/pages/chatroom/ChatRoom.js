import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatRoom.css';
import { useAuth } from '../../auth/AuthContext';

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]);
  messagesRef.current = messages;
  const [newMessage, setNewMessage] = useState('');
  const [roomName, setRoomName] = useState('');
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
        const currentMessages = messagesRef.current;
        // Only update if we have new messages
        if (data.length !== currentMessages.length || 
            (data.length > 0 && currentMessages.length > 0 && data[data.length-1].id !== currentMessages[currentMessages.length-1].id)) {
          setMessages(data);
          setLastFetchTime(new Date());
        }
        // Clear any errors if fetch is successful
        setError((current) => (current ? null : current));
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
  }, [apiBaseUrl, roomId]);

  const fetchRoom = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${apiBaseUrl}/chat/rooms/${roomId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomName(data.name || '');
      }
    } catch (err) {
      console.error('Error fetching chat room:', err);
    }
  }, [apiBaseUrl, roomId]);

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
        setError('Failed to send message. Please try again.');
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
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
    fetchMessages();
    fetchRoom();
    
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
  }, [fetchMessages, fetchRoom]);

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
        <h2>{roomName || 'Chat'}</h2>
        {lastFetchTime && (
          <div className="last-update">
            Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
          </div>
        )}
        <button type="button" onClick={() => navigate('/chat')}>
          Back to Rooms
        </button>
      </div>
      
      <div className="message-container">
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.sender?.username === user?.username ? 'own-message' : 'other-message'} ${msg.isPending ? 'pending' : ''}`}
            >
              <div className="message-header">
                <span className="username">{msg.sender?.username}</span>
                <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.content}</div>
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
        />
        <button type="submit" disabled={!newMessage.trim()}>Send</button>
      </form>
    </div>
  );
};

export default ChatRoom; 