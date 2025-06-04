#!/bin/bash

echo "Getting frontend logs from server..."

# Get frontend logs
ssh root@147.182.168.13 << 'EOF'
  # Get the frontend container ID
  CONTAINER_ID=$(docker ps -q --filter name=frontend)
  
  # Get logs with focus on errors
  echo "===== FRONTEND CONTAINER LOGS ====="
  docker logs $CONTAINER_ID 2>&1 | grep -i "error\|exception\|warning\|fail" | tail -n 50
  
  echo ""
  echo "===== FRONTEND CONTAINER STATUS ====="
  docker inspect --format='{{.State.Status}}' $CONTAINER_ID
  
  echo ""
  echo "===== CHECKING IF REACT APP IS RUNNING ====="
  docker exec $CONTAINER_ID ps aux | grep -i "node"
EOF

echo "Log retrieval complete" 