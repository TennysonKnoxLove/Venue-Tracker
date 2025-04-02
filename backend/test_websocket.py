#!/usr/bin/env python
"""
WebSocket test client for Django Channels

Usage:
    python test_websocket.py [token]

This script tests the WebSocket connection to a Django Channels server.
It requires a valid JWT token for authentication.
"""

import asyncio
import websockets
import json
import sys
import logging
import traceback
from urllib.parse import quote

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('websocket-test')

# WebSocket URL - adjust as needed - test with both localhost and internal container name
WS_URLS = [
    "ws://localhost:8000/ws/chat/1/?token={token}",
    "ws://127.0.0.1:8000/ws/chat/1/?token={token}"
]

async def test_websocket(token):
    """Test WebSocket connection with the given token"""
    # URL-encode the token to ensure it's properly formatted
    encoded_token = quote(token)
    
    # Try multiple URL variations
    for url_template in WS_URLS:
        url = url_template.format(token=encoded_token)
        logger.info(f"Trying to connect to: {url}")
        
        try:
            # Set a connection timeout
            websocket_connection = websockets.connect(
                url,
                ping_interval=5,
                ping_timeout=20,
                close_timeout=10,
                max_size=10_000_000  # 10MB buffer size
            )
            
            async with websocket_connection as websocket:
                logger.info("Connected successfully!")
                
                # Send get_history message
                msg = json.dumps({"type": "get_history"})
                logger.info(f"Sending: {msg}")
                await websocket.send(msg)
                
                # Wait for response with timeout
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    logger.info(f"Received: {response[:200]}...")
                    
                    # Connection test successful - no need to send a test message
                    logger.info("Connection test successful!")
                    return True
                except asyncio.TimeoutError:
                    logger.warning("No response received after requesting history")
                
                # Gracefully close the connection
                await websocket.close()
                
        except websockets.exceptions.ConnectionClosed as e:
            logger.error(f"Connection closed: code={e.code}, reason='{e.reason}'")
        except Exception as e:
            logger.error(f"Error: {str(e)}")
            logger.debug(traceback.format_exc())
    
    logger.error("Failed to establish WebSocket connection to any endpoint")
    return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        token = sys.argv[1]
    else:
        # You should provide your own token as command line arg
        logger.error("No token provided. Please provide a valid JWT token as command line argument.")
        logger.error("Usage: python test_websocket.py <jwt_token>")
        sys.exit(1)
    
    # Run the test
    result = asyncio.run(test_websocket(token))
    if not result:
        sys.exit(1) 