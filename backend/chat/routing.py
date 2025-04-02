import logging
from django.urls import re_path
from . import consumers

logger = logging.getLogger('websocket')

# Define your WebSocket URL patterns
websocket_urlpatterns = [
    # Main WebSocket URL pattern for chat rooms
    re_path(r'ws/chat/(?P<room_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]

logger.debug(f"WebSocket URL patterns registered: {[pattern.pattern for pattern in websocket_urlpatterns]}") 