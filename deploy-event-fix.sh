#!/bin/bash

echo "Deploying EventDetail.js fix to server..."

# Copy the file to the server
scp frontend/src/components/networking/EventDetail.js root@147.182.168.13:/tmp/

# Deploy the file into the running container
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=frontend)
  
  # Copy file into the container
  docker cp /tmp/EventDetail.js $CONTAINER_ID:/app/src/components/networking/
  
  echo "File deployed to frontend container"
  echo "Note: If changes don't appear, a rebuild of the frontend container may be needed"
EOF

echo "Deployment complete" 