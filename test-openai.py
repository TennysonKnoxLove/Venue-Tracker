#!/usr/bin/env python3

"""
Simple script to test OpenAI API directly.
This bypasses Django entirely and will show us if our monkey patching works.
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    # Test our monkey patching
    from openai import OpenAI
    
    logger.info("Imported OpenAI successfully")
    
    # Get API key from environment
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        logger.error("No OPENAI_API_KEY found in environment")
        sys.exit(1)
    
    logger.info(f"Using API key starting with: {api_key[:5]}...")
    
    # Try to create client
    try:
        logger.info("Creating OpenAI client...")
        client = OpenAI(api_key=api_key)
        logger.info("OpenAI client created successfully")
        
        # Try to call the API
        logger.info("Calling OpenAI API...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say hello world"}],
            max_tokens=10
        )
        
        logger.info(f"OpenAI API responded: {response.choices[0].message.content}")
        logger.info("Test completed successfully!")
        
    except Exception as e:
        logger.error(f"Error creating OpenAI client or calling API: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
except ImportError as e:
    logger.error(f"Error importing OpenAI: {e}")
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    import traceback
    logger.error(f"Traceback: {traceback.format_exc()}") 