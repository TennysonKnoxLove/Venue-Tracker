#!/bin/bash

echo "Creating default event types in the database..."

# Copy the script to the server
scp backend/create_event_types.py root@147.182.168.13:/tmp/

# SSH into the server to execute the script
ssh root@147.182.168.13 << 'EOF'
  # Get the backend container ID
  CONTAINER_ID=$(docker ps -q --filter name=backend)
  
  # Copy the script into the container
  docker cp /tmp/create_event_types.py $CONTAINER_ID:/app/
  
  # Run the script inside the Django environment
  docker exec $CONTAINER_ID python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
exec(open('create_event_types.py').read())
  "
  
  echo "Event types created successfully!"
EOF

echo "Deployment complete!" 