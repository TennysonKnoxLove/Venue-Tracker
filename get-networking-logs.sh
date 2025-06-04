#!/bin/bash

echo "Getting networking events related logs..."

# Get backend logs
ssh root@147.182.168.13 << 'EOF'
  # Get the backend container ID
  CONTAINER_ID=$(docker ps -q --filter name=backend)
  
  # Get logs with focus on networking events
  echo "===== NETWORKING EVENTS LOGS ====="
  docker logs $CONTAINER_ID 2>&1 | grep -i "networking\|event\|opportunity" | tail -n 50
  
  # Check database tables for events
  echo ""
  echo "===== CHECKING DATABASE TABLES ====="
  docker exec $CONTAINER_ID python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from networking.models import Event
print(f'Total events in database: {Event.objects.count()}')
print('Latest events:')
for event in Event.objects.all().order_by('-created_at')[:5]:
    print(f'- {event.name} (ID: {event.id}, created: {event.created_at})')
  "
EOF

echo "Log retrieval complete" 