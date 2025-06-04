#!/bin/bash

echo "Getting backend logs with focus on OpenAI and AI related errors..."

# Get backend logs
ssh root@147.182.168.13 << 'EOF'
  # Get the backend container ID
  CONTAINER_ID=$(docker ps -q --filter name=backend)
  
  # Get logs with focus on OpenAI and errors
  echo "===== BACKEND OPENAI/AI LOGS ====="
  docker logs $CONTAINER_ID 2>&1 | grep -i "openai\|ai\|proxy\|error\|exception" | tail -n 100
  
  echo ""
  echo "===== BACKEND CONTAINER STATUS ====="
  docker inspect --format='{{.State.Status}}' $CONTAINER_ID
  
  echo ""
  echo "===== CHECKING BACKEND PROCESSES ====="
  docker exec $CONTAINER_ID ps aux | grep -i "python\|gunicorn"
EOF

echo "Log retrieval complete" 