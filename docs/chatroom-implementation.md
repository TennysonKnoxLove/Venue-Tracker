# Chatroom Implementation

## Overview
This document outlines the implementation of a temporary chatroom feature that allows users to communicate with each other. Messages will be stored for up to three days before being automatically deleted. The interface will follow the Windows 98 aesthetic consistent with the rest of the application.

## Feature Requirements
- Chat interface with Windows 98 aesthetic
- Message storage for up to 3 days
- Display of sender information and timestamps
- Real-time message delivery
- Chat history loading on page load

## Database Changes

### Message Model
```python
class Message(models.Model):
    """Stores temporary chat messages"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.user.username} at {self.timestamp}"
    
    @classmethod
    def clean_old_messages(cls):
        """Delete messages older than 3 days"""
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=3)
        return cls.objects.filter(timestamp__lt=cutoff_date).delete()
```

## API Endpoints

### Chat Endpoints
- `GET /api/chat/messages/` - Get recent chat messages
- `POST /api/chat/messages/` - Send a new message
- `WS /ws/chat/` - WebSocket endpoint for real-time chat

## Backend Implementation

### Create Chat App
```bash
# Create a new app for chat functionality
python manage.py startapp chat

# Update settings.py to include the new app
# Add 'api.chat' to INSTALLED_APPS
```

### Install Dependencies
Add the required packages for WebSocket support:
```bash
pip install channels
pip install channels_redis
```

Update `requirements.txt`:
```
channels==4.0.0
channels-redis==4.1.0
```

### Update Django Settings
```python
# Update settings.py to include Channels
INSTALLED_APPS = [
    # ... existing apps
    'channels',
    'api.chat',
]

# Configure Channels
ASGI_APPLICATION = 'venue_tracker.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('redis', 6379)],
        },
    },
}
```

### Create ASGI Configuration
```python
# venue_tracker/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import api.chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'venue_tracker.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            api.chat.routing.websocket_urlpatterns
        )
    ),
})
```

### Models
```python
# api/chat/models.py
from django.db import models
from django.conf import settings

class Message(models.Model):
    """Stores temporary chat messages"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
```

### Serializers
```python
# api/chat/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    formatted_timestamp = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'user', 'content', 'timestamp', 'formatted_timestamp']
        read_only_fields = ['id', 'timestamp', 'formatted_timestamp']
    
    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')
```

### Consumers (WebSocket Handler)
```python
# api/chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'chat'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user_id = text_data_json['user_id']
        
        # Save message to database
        saved_message = await self.save_message(user_id, message)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': saved_message
            }
        )
    
    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
    
    @database_sync_to_async
    def save_message(self, user_id, content):
        # Get the user instance
        user = User.objects.get(id=user_id)
        
        # Create the message
        message = Message.objects.create(user=user, content=content)
        
        # Serialize the message for sending
        serializer = MessageSerializer(message)
        return serializer.data
```

### WebSocket Routing
```python
# api/chat/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
]
```

### Views
```python
# api/chat/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    """API endpoint for viewing and sending chat messages"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Get messages from the last 3 days
        three_days_ago = timezone.now() - timedelta(days=3)
        return Message.objects.filter(timestamp__gte=three_days_ago)
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### URLs
```python
# api/chat/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('chat/', include(router.urls)),
]

# Include in main urls.py:
# path('api/', include('api.chat.urls')),
```

### Management Command for Message Cleanup
```python
# api/chat/management/commands/clean_old_messages.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.chat.models import Message

class Command(BaseCommand):
    help = 'Delete chat messages older than 3 days'

    def handle(self, *args, **options):
        # Calculate cutoff date
        cutoff_date = timezone.now() - timedelta(days=3)
        
        # Count messages to be deleted
        count = Message.objects.filter(timestamp__lt=cutoff_date).count()
        
        # Delete old messages
        Message.objects.filter(timestamp__lt=cutoff_date).delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {count} old messages')
        )
```

### Scheduled Task Configuration
Add the following to your Docker setup to run the cleanup command daily:

```yaml
# docker-compose.yml
services:
  # ... existing services
  
  cleanup:
    image: ${DOCKER_REGISTRY}/venue-tracker-backend:latest
    depends_on:
      - db
    volumes:
      - ./backend:/app
    command: >
      sh -c "python manage.py clean_old_messages && sleep 86400"
    restart: always
```

Or add to a crontab file:
```
# Run message cleanup daily at midnight
0 0 * * * python /app/manage.py clean_old_messages
```

## Frontend Implementation

### API Service
```javascript
// src/api/chatService.js
import apiClient from './client';

const chatService = {
  // Get recent messages
  getMessages: async () => {
    try {
      const response = await apiClient.get('/chat/messages/');
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  
  // Send a new message (REST fallback)
  sendMessage: async (content) => {
    try {
      const response = await apiClient.post('/chat/messages/', { content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

export default chatService;
```

### WebSocket Service
```javascript
// src/services/websocketService.js

class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
  }

  connect(userId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_HOST || window.location.host;
    
    this.socket = new WebSocket(`${protocol}//${host}/ws/chat/`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    this.socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // Call all registered callbacks with the message data
      this.messageCallbacks.forEach(callback => callback(data.message));
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(userId), 5000);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.socket.close();
    };
    
    this.userId = userId;
  }
  
  disconnect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }
  
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        message,
        user_id: this.userId
      }));
      return true;
    } else {
      console.error('WebSocket not connected, cannot send message');
      return false;
    }
  }
  
  onMessage(callback) {
    this.messageCallbacks.push(callback);
    
    // Return a function to unsubscribe
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
```

### Components

#### ChatPage.js
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Window from '../components/layout/Window';
import Button from '../components/layout/Button';
import chatService from '../api/chatService';
import websocketService from '../services/websocketService';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Load initial messages
    loadMessages();
    
    // Connect to WebSocket
    if (user?.id) {
      websocketService.connect(user.id);
    
      // Register for incoming messages
      const unsubscribe = websocketService.onMessage(message => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
      
      // Cleanup on unmount
      return () => {
        unsubscribe();
        websocketService.disconnect();
      };
    }
  }, [user?.id]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await chatService.getMessages();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Try to send via WebSocket
    const sent = websocketService.sendMessage(newMessage.trim());
    
    // Fallback to REST API if WebSocket fails
    if (!sent) {
      try {
        const sentMessage = await chatService.sendMessage(newMessage.trim());
        setMessages(prevMessages => [...prevMessages, sentMessage]);
      } catch (err) {
        setError('Failed to send message. Please try again.');
        console.error(err);
      }
    }
    
    // Clear input field
    setNewMessage('');
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Chat Room</h2>
      
      <Window title="Chat Room" className="mb-4 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {loading && messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Loading messages...
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex items-start ${message.user.id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 p-3 rounded ${
                      message.user.id === user?.id 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">
                      {message.user.username}
                      <span className="font-normal text-xs ml-2 text-gray-600">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none"
          />
          <Button 
            type="submit"
            className="rounded-l-none"
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </form>
      </Window>
      
      <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <h3 className="font-bold">Note:</h3>
        <p>Messages in this chat room are stored for up to 3 days before being automatically deleted.</p>
      </div>
    </div>
  );
};

export default ChatPage;
```

## Windows 98 Styling

Enhance the chatroom with Windows 98-style components:

1. Chat Window:
```css
.win98-chat-window {
  background-color: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
}

.win98-chat-messages {
  background-color: white;
  border: inset 2px #dfdfdf;
  font-family: 'MS Sans Serif', Arial, sans-serif;
  overflow-y: auto;
}

.win98-chat-input {
  background-color: white;
  border: inset 2px #dfdfdf;
  font-family: 'MS Sans Serif', Arial, sans-serif;
}

.win98-chat-button {
  background-color: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  font-family: 'MS Sans Serif', Arial, sans-serif;
  font-size: 11px;
  padding: 4px 10px;
}

.win98-chat-button:active {
  border-top: 2px solid #404040;
  border-left: 2px solid #404040;
  border-right: 2px solid #dfdfdf;
  border-bottom: 2px solid #dfdfdf;
}
```

2. Message Styling:
```css
.win98-message-bubble {
  margin: 6px 0;
  max-width: 80%;
  background-color: #eaeaea;
  border-top: 1px solid #404040;
  border-left: 1px solid #404040;
  border-right: 1px solid #dfdfdf;
  border-bottom: 1px solid #dfdfdf;
  padding: 6px 10px;
  font-family: 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
}

.win98-message-bubble.user {
  background-color: #cce5ff;
}

.win98-message-header {
  font-weight: bold;
  font-size: 11px;
  color: #000080;
  margin-bottom: 3px;
}

.win98-message-time {
  font-size: 10px;
  color: #636363;
  margin-left: 5px;
}
```

## Docker Configuration Updates

Add Redis service for Channels:

```yaml
# docker-compose.yml
services:
  # ... existing services
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: always

volumes:
  # ... existing volumes
  redis_data:
```

## Integration Steps

### 1. Add Routing

Update the routing configuration to include the Chat page:

```jsx
// Update routes in App.js or routing configuration
<Route path="/chat" element={<ChatPage />} />
```

### 2. Add to Navigation

Add the Chat page link to the navigation menu:

```jsx
// In your navigation component
<NavLink to="/chat">Chat Room</NavLink>
```

### 3. Database Migrations

Run migrations to create the necessary database tables:

```bash
python manage.py makemigrations chat
python manage.py migrate chat
```

## Testing Plan

1. Test with multiple users sending messages simultaneously
2. Verify WebSocket functionality for real-time updates
3. Test the 3-day message expiration (you can temporarily modify the code to use minutes instead of days for testing)
4. Verify correct user identification in messages
5. Test the REST API fallback if WebSockets fail
6. Verify Windows 98 styling is consistent
7. Test message history loading on page refresh 