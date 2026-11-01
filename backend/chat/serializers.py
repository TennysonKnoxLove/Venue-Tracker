from rest_framework import serializers
from .models import ChatRoom, ChatRoomMember, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'chat_room', 'sender', 'content', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class ChatRoomMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatRoomMember
        fields = ['id', 'chat_room', 'user', 'joined_at']
        read_only_fields = ['id', 'joined_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    members = ChatRoomMemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_at', 'updated_at', 'members']
        read_only_fields = ['id', 'created_at', 'updated_at']
