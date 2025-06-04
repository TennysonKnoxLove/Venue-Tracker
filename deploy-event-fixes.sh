#!/bin/bash

echo "Deploying EventsDashboard.js and EventForm.js fixes to server..."

# Copy the files to the server's temporary directory
scp frontend/src/components/networking/EventsDashboard.js frontend/src/components/networking/EventForm.js root@147.182.168.13:/tmp/

# Deploy the files into the running container
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=frontend)
  
  # Copy files into the container
  docker cp /tmp/EventsDashboard.js $CONTAINER_ID:/app/src/components/networking/
  docker cp /tmp/EventForm.js $CONTAINER_ID:/app/src/components/networking/
  
  echo "Files deployed to frontend container"
  echo "Note: If changes don't appear immediately, you may need to rebuild the frontend container"
EOF

echo "Deployment complete" 