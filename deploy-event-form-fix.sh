#!/bin/bash

echo "Deploying fixed EventForm.js without react-hot-toast dependency..."

# Copy the file to the server's temporary directory
scp frontend/src/components/networking/EventForm.js root@147.182.168.13:/tmp/

# Deploy the file into the running container
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=frontend)
  
  # Copy file into the container
  docker cp /tmp/EventForm.js $CONTAINER_ID:/app/src/components/networking/
  
  echo "Fixed EventForm.js deployed to frontend container"
EOF

echo "Deployment complete" 