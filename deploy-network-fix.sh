#!/bin/bash

echo "Deploying Networking tab hiding fixes..."

# Copy the modified files to the server
scp frontend/src/pages/VenueDiscoveryPage.js frontend/src/components/layout/MainLayout.js root@147.182.168.13:/tmp/

# Deploy the files to the running container
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=frontend)
  
  # Copy files into the container
  docker cp /tmp/VenueDiscoveryPage.js $CONTAINER_ID:/app/src/pages/
  docker cp /tmp/MainLayout.js $CONTAINER_ID:/app/src/components/layout/
  
  echo "Files deployed to frontend container"
  
  # Restart the frontend container to apply changes
  echo "Restarting frontend container..."
  docker restart $CONTAINER_ID
  
  echo "Changes deployed and container restarted"
EOF

echo "Deployment complete" 