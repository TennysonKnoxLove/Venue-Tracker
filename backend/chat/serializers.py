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
    sender_id = serializers.IntegerField(write_only=True, required=False)
    username = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'chat_room', 'sender', 'sender_id', 'content', 'timestamp', 'username', 'message']
        read_only_fields = ['id', 'timestamp', 'username', 'message']
    
    def get_username(self, obj):
        return obj.sender.username if obj.sender else None
    
    def get_message(self, obj):
        return obj.content
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['sender'] = request.user
        
        if 'sender_id' in validated_data:
            del validated_data['sender_id']
            
        return super().create(validated_data)

class ChatRoomMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatRoomMember
        fields = ['id', 'chat_room', 'user', 'joined_at', 'last_read']
        read_only_fields = ['id', 'joined_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    members = ChatRoomMemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_at', 'updated_at', 'members']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
class ChatRoomDetailSerializer(serializers.ModelSerializer):
    members = ChatRoomMemberSerializer(many=True, read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_at', 'updated_at', 'members', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at'] 