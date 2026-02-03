#!/bin/bash

set -e

echo "Starting Kudu Docker environment..."

# Start Docker Compose
docker compose up -d

echo "Waiting for Kudu services to start..."
sleep 10

# Check service status
echo "Checking service status..."
docker compose ps

# Wait for Kudu Master to fully start
echo "Waiting for Kudu Master to fully start..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8051 > /dev/null 2>&1; then
        echo "Kudu Master is up!"
        break
    fi
    attempt=$((attempt+1))
    echo "Waiting... ($attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "Warning: Kudu Master startup timeout"
fi

# Wait for Kudu TServer to fully start
echo "Waiting for Kudu TServer to fully start..."
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:18050 > /dev/null 2>&1; then
        echo "Kudu TServer is up!"
        break
    fi
    attempt=$((attempt+1))
    echo "Waiting... ($attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "Warning: Kudu TServer startup timeout"
fi

echo ""
echo "Kudu services are running!"
echo "Master Web UI: http://localhost:8051"
echo "TServer Web UI: http://localhost:18050"
echo "Master RPC: localhost:7051"
echo ""

# Initialize tables and data
echo "Initializing tables..."

# Create tables using CLI tool
if [ -f "init-kudu-cli.sh" ]; then
    ./init-kudu-cli.sh
else
    echo "init-kudu-cli.sh not found, skipping table creation"
fi

echo ""
echo "Environment is ready!"
