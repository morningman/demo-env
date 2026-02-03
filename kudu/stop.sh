#!/bin/bash

echo "Stopping Kudu Docker environment..."

# Stop and remove containers
docker compose down

echo "Kudu environment stopped"
echo ""
echo "Note: Data is still preserved in Docker volumes"
echo "To completely remove data, run: docker-compose down -v"
