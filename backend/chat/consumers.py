import json
import traceback
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage, ChatRoomMember
from .serializers import ChatMessageSerializer, UserSerializer
from django.utils import timezone

logger = logging.getLogger(__name__)
User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get room ID from URL route
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Log connection attempt
        logger.debug(f"WS connect: User={self.scope['user']} Room={self.room_id}")
        
        # Reject anonymous users
        if self.scope['user'].is_anonymous:
            logger.warning("WS rejected: Anonymous user")
            await self.close(code=4001)
            return
        
        # Check if the room exists
        room_exists = await self.check_room_exists()
        if not room_exists:
            logger.warning(f"WS rejected: Room {self.room_id} not found")
            await self.close(code=4004)
            return
            
        # Auto-join the room if needed
        is_member = await self.is_room_member()
        if not is_member:
            await self.add_room_member()
        
        # Join the channel group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Accept the websocket connection
        await self.accept()
        logger.info(f"WS accepted: User={self.scope['user'].username} Room={self.room_id}")
        
        # Send chat history
        await self.send_chat_history()
        
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        logger.debug(f"WS disconnected: code={close_code}")
        
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            if message_type == 'message':
                message = data.get('message', '').strip()
                if not message:
                    return
                    
                # Save message to database
                message_obj = await self.save_message(message)
                
                # Send message to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': self.scope['user'].username,
                        'timestamp': message_obj['timestamp'],
                        'id': message_obj['id']
                    }
                )
                
            elif message_type == 'get_history':
                await self.send_chat_history()
                
        except Exception as e:
            logger.error(f"WS receive error: {str(e)}")
            
    async def chat_message(self, event):
        """Sends received message to WebSocket"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'message',
                'message': event['message'],
                'username': event['username'],
                'timestamp': event['timestamp'],
                'id': event.get('id')
            }))
        except Exception as e:
            logger.error(f"WS send error: {str(e)}")
            
    async def send_chat_history(self):
        """Send chat history to the client"""
        try:
            messages = await self.get_chat_history()
            await self.send(text_data=json.dumps({
                'type': 'room_history',
                'messages': messages
            }))
        except Exception as e:
            logger.error(f"History error: {str(e)}")
    
    @database_sync_to_async
    def check_room_exists(self):
        """Check if the chat room exists"""
        return ChatRoom.objects.filter(id=self.room_id).exists()
        
    @database_sync_to_async
    def is_room_member(self):
        """Check if user is a member of the chat room"""
        return ChatRoomMember.objects.filter(
            chat_room_id=self.room_id,
            user=self.scope['user']
        ).exists()
    
    @database_sync_to_async
    def add_room_member(self):
        """Add user as a member of the chat room"""
        try:
            chat_room = ChatRoom.objects.get(id=self.room_id)
            ChatRoomMember.objects.create(
                chat_room=chat_room,
                user=self.scope['user']
            )
            return True
        except Exception as e:
            logger.error(f"Add member error: {str(e)}")
            return False
            
    @database_sync_to_async
    def save_message(self, message):
        """Save message to database and return serialized data"""
        chat_message = ChatMessage.objects.create(
            chat_room_id=self.room_id,
            sender=self.scope['user'],
            content=message
        )
        
        serializer = ChatMessageSerializer(chat_message)
        return serializer.data
    
    @database_sync_to_async
    def get_chat_history(self):
        """Get chat history for the room"""
        messages = ChatMessage.objects.filter(
            chat_room_id=self.room_id
        ).order_by('timestamp')[:50]
        
        # Update last read timestamp
        try:
            member = ChatRoomMember.objects.get(
                chat_room_id=self.room_id,
                user=self.scope['user']
            )
            member.last_read = timezone.now()
            member.save()
        except Exception:
            pass
            
        serializer = ChatMessageSerializer(messages, many=True)
        return serializer.data 