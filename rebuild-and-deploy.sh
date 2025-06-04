#!/bin/bash

set -e  # Exit on any error

echo "============================================"
echo "REBUILDING AND DEPLOYING VENUE TRACKER"
echo "============================================"

# Step 1: Log in to DigitalOcean registry
echo "Logging in to DigitalOcean Container Registry..."
read -sp "Enter your DigitalOcean API token: " DOTOKEN
echo ""
docker login -u $DOTOKEN -p $DOTOKEN registry.digitalocean.com

# Step 2: Build the images
echo "Building Docker images..."

echo "Building backend image..."
docker build -t registry.digitalocean.com/venue-tracker/backend:latest -f Dockerfile.backend .

echo "Building frontend image..."
docker build -t registry.digitalocean.com/venue-tracker/frontend:latest -f Dockerfile.frontend .

# Step 3: Push images to registry
echo "Pushing images to DigitalOcean registry..."
docker push registry.digitalocean.com/venue-tracker/backend:latest
docker push registry.digitalocean.com/venue-tracker/frontend:latest

# Step 4: Deploy to server
echo "Deploying to server..."
ssh root@147.182.168.13 << 'EOF'
  echo "Pulling latest images..."
  docker pull registry.digitalocean.com/venue-tracker/backend:latest
  docker pull registry.digitalocean.com/venue-tracker/frontend:latest
  
  echo "Restarting containers..."
  cd ~/
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml up -d
  
  echo "Deployment complete!"
  docker ps
EOF

echo "============================================"
echo "REBUILD AND DEPLOYMENT COMPLETE"
echo "============================================" 