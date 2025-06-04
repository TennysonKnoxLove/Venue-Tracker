#!/bin/bash

echo "Deploying fixed VenueDiscoveryPage.js to fix venue saving..."

# Copy our fixed file to the server
scp fix-discovery-page.js root@147.182.168.13:/tmp/VenueDiscoveryPage.js

# SSH into the server and deploy the file
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=root-frontend)
  
  # Copy the file into the container
  docker cp /tmp/VenueDiscoveryPage.js $CONTAINER_ID:/app/src/pages/VenueDiscoveryPage.js
  
  # Verify file was copied
  docker exec $CONTAINER_ID ls -la /app/src/pages/VenueDiscoveryPage.js
  
  # Restart the container
  docker restart $CONTAINER_ID
  
  echo "File deployed and container restarted!"
EOF

echo "Done! The API method has been corrected from saveVenue to importVenues." 