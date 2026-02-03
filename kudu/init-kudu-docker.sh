#!/bin/bash

set -e

echo "Initializing Kudu tables and data using Docker container..."

# Create temporary Dockerfile
cat > Dockerfile.init <<EOF
FROM python:3.9-slim

RUN pip install --no-cache-dir kudu-python

WORKDIR /app
COPY init-kudu.py /app/

CMD ["python", "init-kudu.py"]
EOF

# Build initialization image
echo "Building initialization image..."
sudo docker build -f Dockerfile.init -t kudu-init:latest .

# Run initialization container (connect to kudu-network)
echo "Running initialization container..."
sudo docker run --rm --network kudu_kudu-network \
    -e KUDU_MASTER=kudu-master \
    kudu-init:latest

# Clean up temporary files
rm -f Dockerfile.init

echo "✓ Initialization complete!"
