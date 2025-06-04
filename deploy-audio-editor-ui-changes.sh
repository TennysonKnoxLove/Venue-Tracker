#!/bin/bash

echo "Deploying audio editor UI changes (removing playback buttons)..."

# Create a temporary patch script with the content of the modified AudioEditorPage.js
# (This assumes the local AudioEditorPage.js is already modified as per the previous step)

# Copy the locally modified AudioEditorPage.js to a temporary file on the remote server
scp frontend/src/pages/AudioEditorPage.js root@147.182.168.13:/tmp/AudioEditorPage.js_patched

# SSH into the server and apply the fix
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=root-frontend)
  
  # Copy the patched file into the container, overwriting the existing one
  docker cp /tmp/AudioEditorPage.js_patched $CONTAINER_ID:/app/src/pages/AudioEditorPage.js
  
  # Verify file was copied (optional, but good for sanity check)
  docker exec $CONTAINER_ID ls -la /app/src/pages/AudioEditorPage.js
  docker exec $CONTAINER_ID head -n 5 /app/src/pages/AudioEditorPage.js # Check first few lines
  docker exec $CONTAINER_ID tail -n 5 /app/src/pages/AudioEditorPage.js # Check last few lines

  # Restart the frontend container to apply changes
  docker restart $CONTAINER_ID
  
  echo "Audio editor UI changes deployed and container restarted!"
EOF

echo "Done! Playback buttons should be removed from the Audio Editor UI." 