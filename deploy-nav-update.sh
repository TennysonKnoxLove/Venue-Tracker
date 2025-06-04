#!/bin/bash

echo "Deploying navigation bar update to the server..."

# Copy the updated MainLayout.js file to temporary location on the server
scp frontend/src/components/layout/MainLayout.js root@147.182.168.13:/tmp/

# SSH into the server to deploy the file
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=frontend)
  
  # Copy the updated file to the container
  docker cp /tmp/MainLayout.js $CONTAINER_ID:/app/src/components/layout/
  
  # Trigger a rebuild in the container
  echo "Building frontend in container..."
  docker exec $CONTAINER_ID sh -c "cd /app && npm run build"
  
  # Restart the frontend container
  docker restart $CONTAINER_ID
  
  echo "Frontend rebuilt and container restarted"
EOF

echo "Navigation bar update deployed successfully!" 