#!/bin/bash

echo "Deploying fixed EventsDashboard.js to server..."

# Copy the file to the server's temporary directory
scp frontend/src/components/networking/EventsDashboard.js root@147.182.168.13:/tmp/

# Deploy the file into the running container
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=frontend)
  
  # Copy file into the container
  docker cp /tmp/EventsDashboard.js $CONTAINER_ID:/app/src/components/networking/
  
  echo "Fixed EventsDashboard.js deployed to frontend container"
EOF

echo "Deployment complete" 