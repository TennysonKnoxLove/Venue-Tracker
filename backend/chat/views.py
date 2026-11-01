from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, ChatRoomMember, ChatMessage
from .serializers import (
    ChatRoomSerializer,
    ChatRoomMemberSerializer,
    ChatMessageSerializer
)

class ChatRoomViewSet(viewsets.ModelViewSet):
    """ViewSet for chat rooms"""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return chat rooms that the user is a member of"""
        return ChatRoom.objects.filter(members__user=self.request.user)
    
    def perform_create(self, serializer):
        """Create a new chat room and add the current user as a member"""
        chat_room = serializer.save()
        ChatRoomMember.objects.create(chat_room=chat_room, user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a chat room"""
        try:
            # Get chat room by ID without filtering by membership
            chat_room = ChatRoom.objects.get(id=pk)
            
            # Check if user is already a member
            if ChatRoomMember.objects.filter(chat_room=chat_room, user=request.user).exists():
                return Response({"message": "Already a member of this chat room"})
                
            # Join the chat room
            member = ChatRoomMember.objects.create(chat_room=chat_room, user=request.user)
            serializer = ChatRoomMemberSerializer(member)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ChatRoom.DoesNotExist:
            return Response({"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        """Get or create messages for a chat room"""
        chat_room = self.get_object()
        
        # Handle POST request to create a new message
        if request.method == 'POST':
            content = request.data.get('content')
            if not content:
                return Response(
                    {"error": "Message content is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message = ChatMessage.objects.create(
                chat_room=chat_room,
                sender=request.user,
                content=content
            )
            
            serializer = ChatMessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        messages = ChatMessage.objects.filter(chat_room=chat_room)
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all_rooms(self, request):
        """Get all chat rooms that the user can join"""
        # Get rooms the user is already a member of
        user_rooms = ChatRoom.objects.filter(members__user=request.user).values_list('id', flat=True)
        
        # Get all rooms including those the user is not a member of
        all_rooms = ChatRoom.objects.all()
        
        # Annotate each room with a field indicating if the user is a member
        result = []
        for room in all_rooms:
            room_data = ChatRoomSerializer(room).data
            room_data['is_member'] = room.id in user_rooms
            result.append(room_data)
        
        return Response(result)
