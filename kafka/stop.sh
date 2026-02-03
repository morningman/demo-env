#!/bin/bash
set -eo pipefail

# Error handling function
error_exit() {
    echo ""
    echo "❌ ERROR: $1" >&2
    exit 1
}

# Success notification function
success() {
    echo "✓ $1"
}

echo "=== Stopping Kafka Environment ==="
echo ""

# Stop all containers
echo "Step 1: Stopping all containers..."
if docker compose ps -q 2>/dev/null | grep -q .; then
    docker compose down || error_exit "Failed to stop containers"
    success "All containers stopped"
else
    success "No running containers found"
fi

# Remove containers, networks and volumes
echo ""
echo "Step 2: Removing containers, networks, and volumes..."
docker compose down -v --remove-orphans 2>/dev/null || true
success "Cleanup completed"

# Clean up keytabs
echo ""
echo "Step 3: Cleaning up keytabs directory..."
if [ -d "keytabs" ]; then
    rm -rf keytabs/* 2>/dev/null || true
    success "Keytabs directory cleaned"
fi

# Optional: Clean up hosts file entries
echo ""
echo "Step 4: Removing hosts entries (optional)..."
read -p "Do you want to remove hosts entries? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo sed -i '/kdc.example.com/d' /etc/hosts || echo "⚠ Warning: Failed to remove hosts entries"
    sudo sed -i '/zookeeper.example.com/d' /etc/hosts || true
    sudo sed -i '/kafka.example.com/d' /etc/hosts || true
    sudo sed -i '/schema-registry.example.com/d' /etc/hosts || true
    success "Hosts entries removed"
else
    echo "✓ Hosts entries kept"
fi

# Verify cleanup
echo ""
echo "Step 5: Verifying cleanup..."
RUNNING_CONTAINERS=$(docker compose ps -q 2>/dev/null | wc -l)
if [ "$RUNNING_CONTAINERS" -ne 0 ]; then
    error_exit "Some containers are still running. Manual cleanup may be required."
fi
success "All containers removed successfully"

echo ""
echo "=== ✅ Environment stopped and cleaned up ==="
echo ""
echo "To start the environment again, run: ./start.sh"
