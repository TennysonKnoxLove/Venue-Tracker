#!/bin/bash

echo "Creating a Docker rebuild package for the frontend container..."

# Create a temp directory
mkdir -p frontend-rebuild-temp
cd frontend-rebuild-temp

# Create a Dockerfile to rebuild the frontend container
cat > Dockerfile << 'EOF'
FROM node:16-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Remove problematic dependency
RUN sed -i '/react-hot-toast/d' src/components/networking/EventForm.js
RUN sed -i 's/import { toast } from .*//g' src/components/networking/EventForm.js
RUN sed -i 's/toast.success/alert/g' src/components/networking/EventForm.js
RUN sed -i '/FALLBACK_EVENT_TYPES/d' src/components/networking/EventForm.js
RUN sed -i 's/const typeId = .*/\/\/ Removed typeId/g' src/components/networking/EventsDashboard.js

# Start the app
CMD ["npm", "start"]
EOF

# Create a docker-compose file to rebuild and deploy
cat > docker-compose.rebuild.yml << 'EOF'
version: '3'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    image: venue-tracker-frontend:rebuild
    container_name: frontend
    ports:
      - "3000:3000"
    restart: always
    environment:
      - REACT_APP_API_URL=http://147.182.168.13:8000/api
      - REACT_APP_BACKEND_HOST=147.182.168.13:8000
EOF

cd ..

# Copy the rebuild files to the server
echo "Copying rebuild files to server..."
scp -r frontend-rebuild-temp/* root@147.182.168.13:/tmp/frontend-rebuild/

# Rebuild the frontend container on the server
echo "Rebuilding frontend container on server..."
ssh root@147.182.168.13 << 'EOF'
  cd /tmp/frontend-rebuild
  
  # Stop and remove the current frontend container
  docker rm -f frontend || true
  
  # Check if there's a frontend directory
  if [ -d "/root/venue-tracker/frontend" ]; then
    # Copy frontend files to the build context
    cp -r /root/venue-tracker/frontend/* /tmp/frontend-rebuild/
  else
    echo "Warning: Could not find frontend directory, will use existing files"
  fi
  
  # Build and start the new container
  docker compose -f docker-compose.rebuild.yml up -d --build
  
  echo "Frontend container rebuilt and started!"
EOF

# Clean up temp directory
rm -rf frontend-rebuild-temp

echo "Rebuild process completed!" 