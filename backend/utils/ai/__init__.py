# Import the patch early to ensure it's applied before any OpenAI client is created
from .openai_patch import *

# Now import regular modules
from .openai_client import *
from .templates import * 