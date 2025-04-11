"""
Monkey patch for OpenAI client to handle proxies issues.
This file is imported by __init__.py to ensure it's loaded at startup.
"""
import logging
from functools import wraps
import openai
import inspect
import httpx

logger = logging.getLogger(__name__)

# Store the original HTTPX Client class
OriginalHttpxClient = httpx.Client

# Create a patched version of the HTTPX Client class
class PatchedHttpxClient(OriginalHttpxClient):
    def __init__(self, **kwargs):
        # Remove proxies parameter if it exists
        if 'proxies' in kwargs:
            logger.warning("Removed 'proxies' from HTTPX Client initialization")
            kwargs.pop('proxies')
        
        # Call the original __init__ with filtered kwargs
        super().__init__(**kwargs)

# Replace the original HTTPX Client with our patched version
httpx.Client = PatchedHttpxClient
logger.info("HTTPX Client has been monkey-patched to handle 'proxies' parameter")

# Store the original OpenAI class
OriginalOpenAI = openai.OpenAI

# Create a patched version of the class
class PatchedOpenAI(OriginalOpenAI):
    def __init__(self, **kwargs):
        # More aggressively filter kwargs
        # Only allow known parameters for OpenAI client initialization
        allowed_params = {'api_key', 'base_url', 'timeout', 'max_retries', 'default_headers', 'organization'}
        filtered_kwargs = {k: v for k, v in kwargs.items() if k in allowed_params}
        
        if 'proxies' in kwargs:
            logger.warning("Removed 'proxies' from OpenAI client initialization")
        
        if set(kwargs.keys()) != set(filtered_kwargs.keys()):
            removed = set(kwargs.keys()) - set(filtered_kwargs.keys())
            logger.warning(f"Removed unexpected kwargs from OpenAI client: {removed}")
        
        # Call the original __init__ with filtered kwargs
        super().__init__(**filtered_kwargs)

# Replace the original class with our patched version
openai.OpenAI = PatchedOpenAI

logger.info("OpenAI client has been monkey-patched to handle 'proxies' parameter and other unwanted parameters") 