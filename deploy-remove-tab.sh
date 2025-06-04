#!/bin/bash

echo "Deploying completely rewritten VenueDiscoveryPage to remove Networking tab..."

# Copy the modified file to the server
scp frontend/src/pages/VenueDiscoveryPage.js root@147.182.168.13:/tmp/

# Deploy the file to the running container
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=root-frontend)
  
  # Copy file into the container - use the proper filepath
  docker cp /tmp/VenueDiscoveryPage.js "${CONTAINER_ID}:/app/src/pages/VenueDiscoveryPage.js"
  
  echo "File deployed to frontend container"
  
  # Restart the frontend container to apply changes
  echo "Restarting frontend container..."
  docker restart $CONTAINER_ID
  
  echo "Changes deployed and container restarted"
EOF

echo "Deployment complete" 