import os
import django

# Set Django settings and initialize first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

# Now import the remaining modules after Django is initialized
import logging
import jwt
from urllib.parse import parse_qs

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.security.websocket import AllowedHostsOriginValidator

# Configure logging
logger = logging.getLogger('websocket')
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

User = get_user_model()

# Import websocket_urlpatterns after Django is setup
from chat.routing import websocket_urlpatterns
logger.debug(f"Loaded websocket patterns: {websocket_urlpatterns}")

class TokenAuthMiddleware:
    """
    Custom middleware for JWT token authentication in websocket connections
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Extract token from query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        user = AnonymousUser()
        
        if token:
            try:
                # Authenticate with JWT token
                user = await self.get_user_from_token(token)
                logger.debug(f"Authenticated user: {user.username if not user.is_anonymous else 'Anonymous'}")
            except Exception as e:
                logger.error(f"Authentication error: {str(e)}")
                scope['user'] = AnonymousUser()
                # Log full exception for debugging
                import traceback
                logger.error(traceback.format_exc())
        else:
            logger.warning("No token provided in WebSocket connection")
        
        # Add user to scope
        scope['user'] = user
        return await self.app(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and get user"""
        try:
            # Decode token and validate
            from django.conf import settings
            from rest_framework_simplejwt.tokens import AccessToken
            
            # First try REST framework token
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                return User.objects.get(id=user_id)
            except Exception as e:
                # If that fails, try manual JWT decoding
                logger.warning(f"JWT token validation through AccessToken failed: {str(e)}")
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                if user_id:
                    return User.objects.get(id=user_id)
                else:
                    logger.warning("No user_id in token payload")
                    return AnonymousUser()
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return AnonymousUser()

# Wrap with token auth middleware
def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(inner)

# Define application
application = ProtocolTypeRouter({
    # Django's ASGI application for handling HTTP requests
    "http": get_asgi_application(),
    
    # WebSocket handler with auth and validation
    "websocket": TokenAuthMiddlewareStack(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})

logger.debug("ASGI application initialized") 