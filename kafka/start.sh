#!/bin/bash
set -eo pipefail

# Error handling function
error_exit() {
    echo ""
    echo "❌ ERROR: $1" >&2
    echo "Process stopped due to error."
    exit 1
}

# Success notification function
success() {
    echo "✓ $1"
}

echo "=== Starting Kafka with Kerberos Authentication ==="
echo ""

# ==================== Cleanup Phase ====================
echo "=== Cleanup Phase ==="
echo ""

echo "Step 0.1: Stopping all containers..."
if docker compose ps -q 2>/dev/null | grep -q .; then
    docker compose down || error_exit "Failed to stop containers"
    success "All containers stopped"
else
    success "No running containers found"
fi

echo ""
echo "Step 0.2: Removing containers, networks, and volumes..."
docker compose down -v --remove-orphans 2>/dev/null || true
success "Cleanup completed"

echo ""
echo "Step 0.3: Cleaning up keytabs directory..."
if [ -d "keytabs" ]; then
    rm -rf keytabs/* 2>/dev/null || true
    success "Keytabs directory cleaned"
else
    mkdir -p keytabs
    success "Keytabs directory created"
fi

echo ""
echo "Step 0.4: Verifying all containers are removed..."
RUNNING_CONTAINERS=$(docker compose ps -q 2>/dev/null | wc -l)
if [ "$RUNNING_CONTAINERS" -ne 0 ]; then
    error_exit "Some containers are still running. Manual cleanup may be required."
fi
success "All containers removed successfully"

echo ""
echo "=== Cleanup completed. Starting fresh environment... ==="
echo ""

# ==================== Initialization Phase ====================

# Add hosts entries
echo "Step 0.5: Adding hosts entries..."
if ! grep -q "kdc.example.com" /etc/hosts; then
    echo "172.25.0.10 kdc.example.com" | sudo tee -a /etc/hosts > /dev/null || error_exit "Failed to add hosts entries"
    echo "172.25.0.20 zookeeper.example.com" | sudo tee -a /etc/hosts > /dev/null || error_exit "Failed to add hosts entries"
    echo "172.25.0.30 kafka.example.com" | sudo tee -a /etc/hosts > /dev/null || error_exit "Failed to add hosts entries"
    echo "172.25.0.40 schema-registry.example.com" | sudo tee -a /etc/hosts > /dev/null || error_exit "Failed to add hosts entries"
    success "Hosts entries added"
else
    success "Hosts entries already exist"
fi

# ==================== Startup Phase ====================

# Phase 1: Start KDC
echo ""
echo "Step 1: Starting KDC container..."
docker compose up -d kdc || error_exit "Failed to start KDC container"
success "KDC container started"

# Wait for KDC to start
echo ""
echo "Step 1.1: Waiting for KDC to be ready..."

# Verify container status
sleep 5
if ! docker ps --filter "name=kdc" --filter "status=running" --format "{{.Names}}" | grep -q "^kdc$"; then
    docker logs kdc --tail 50
    error_exit "KDC container failed to start"
fi

# Wait for KDC service to start
sleep 5
success "KDC is ready"

# Initialize Kerberos
echo ""
echo "Step 2: Initializing Kerberos principals and keytabs..."
docker exec kdc sh /scripts/init-kerberos.sh || error_exit "Failed to initialize Kerberos"
success "Kerberos initialized successfully"

# Verify keytabs are generated
echo ""
echo "Step 2.1: Verifying keytabs generation..."
if [ ! -f "keytabs/kafka.keytab" ] || [ ! -f "keytabs/producer.keytab" ]; then
    error_exit "Keytabs were not generated correctly"
fi
success "Keytabs verified"

# Phase 2: Start Zookeeper and Kafka
echo ""
echo "Step 3: Starting Zookeeper and Kafka containers..."
docker compose up -d zookeeper kafka || error_exit "Failed to start Zookeeper and Kafka"
success "Zookeeper and Kafka containers started"

# Wait for Kafka to fully start
echo ""
echo "Step 3.1: Waiting for Kafka to be ready..."
echo "This may take 30-60 seconds..."

# Wait for basic startup
sleep 10

# Verify container status
if ! docker ps --filter "name=kafka" --filter "status=running" --format "{{.Names}}" | grep -q "^kafka$"; then
    docker logs kafka --tail 50
    error_exit "Kafka container failed to start"
fi

# Wait for Kafka service to truly be available - check for key information in logs
echo "Waiting for Kafka broker to be ready..."
MAX_WAIT=60
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if docker logs kafka 2>&1 | grep -q "KafkaServer.*started"; then
        success "Kafka broker is ready"
        break
    fi
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    echo -n "."
done
echo ""

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    echo "Kafka logs:"
    docker logs kafka --tail 100
    error_exit "Kafka broker did not become ready within ${MAX_WAIT} seconds"
fi

# Verify Kafka is running
echo ""
echo "Step 3.2: Verifying Kafka is running..."
if ! docker ps --filter "name=kafka" --filter "status=running" --format "{{.Names}}" | grep -q "^kafka$"; then
    error_exit "Kafka container is not running properly"
fi
success "Kafka is running"

# Create test topic
echo ""
echo "Step 4: Creating test topic..."
if ! docker exec kafka kafka-topics --create \
  --bootstrap-server kafka.example.com:9092 \
  --topic test-topic \
  --partitions 1 \
  --replication-factor 1 \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null; then
    echo "⚠ Warning: Test topic creation failed (may already exist)"
fi
success "Test topic created or already exists"

# Phase 3: Start Schema Registry
echo ""
echo "Step 5: Starting Schema Registry..."
docker compose up -d schema-registry || error_exit "Failed to start Schema Registry"
success "Schema Registry container started"

# Wait for Schema Registry to start
echo ""
echo "Step 5.1: Waiting for Schema Registry to be ready..."
echo "This may take 20-30 seconds..."

# Wait for basic startup
sleep 10

# Verify container status
if ! docker ps --filter "name=schema-registry" --filter "status=running" --format "{{.Names}}" | grep -q "^schema-registry$"; then
    docker logs schema-registry --tail 50
    error_exit "Schema Registry container failed to start"
fi

# Wait for Schema Registry service to truly be available
echo "Waiting for Schema Registry service to be ready..."
MAX_WAIT=30
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s http://schema-registry.example.com:8081/subjects > /dev/null 2>&1; then
        success "Schema Registry is ready"
        break
    fi
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    echo -n "."
done
echo ""

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    echo "Schema Registry logs:"
    docker logs schema-registry --tail 100
    error_exit "Schema Registry did not become ready within ${MAX_WAIT} seconds"
fi

# Verify Schema Registry is running
echo ""
echo "Step 5.2: Verifying Schema Registry is running..."
if ! docker ps --filter "name=schema-registry" --filter "status=running" --format "{{.Names}}" | grep -q "^schema-registry$"; then
    error_exit "Schema Registry container is not running properly"
fi
success "Schema Registry is running"

# Create Avro topics
echo ""
echo "Step 6: Creating Avro topics with multiple partitions..."
if [ -f "./create_avro_topics.sh" ]; then
    ./create_avro_topics.sh || error_exit "Failed to create Avro topics"
    success "Avro topics created"
else
    echo "⚠ Warning: create_avro_topics.sh not found, skipping..."
fi

# Register Avro schemas
echo ""
echo "Step 7: Registering Avro schemas..."
if [ -f "./register_schemas.py" ]; then
    python3 register_schemas.py || error_exit "Failed to register Avro schemas"
    success "Avro schemas registered"
else
    echo "⚠ Warning: register_schemas.py not found, skipping..."
fi

# Insert sample data
echo ""
echo "Step 7.5: Inserting sample data into all topics..."
if [ -f "./insert_sample_data.sh" ]; then
    bash ./insert_sample_data.sh || error_exit "Failed to insert sample data"
    success "Sample data inserted"
else
    echo "⚠ Warning: insert_sample_data.sh not found, skipping..."
fi

# Display status
echo ""
echo "=== Environment Status ==="
if ! docker compose ps; then
    error_exit "Failed to get container status"
fi

# Final verification
echo ""
echo "Step 8: Final verification..."
RUNNING_COUNT=$(docker ps --filter "status=running" --format "{{.Names}}" | grep -E "^(kdc|zookeeper|kafka|schema-registry)$" | wc -l)
if [ "$RUNNING_COUNT" -lt 4 ]; then
    echo "Expected 4 containers running, but found: $RUNNING_COUNT"
    echo "Running containers:"
    docker ps --filter "status=running" --format "table {{.Names}}\t{{.Status}}"
    error_exit "Not all containers are running. Expected at least 4 containers running."
fi
success "All containers are running properly ($RUNNING_COUNT/4)"

echo ""
echo "=== ✅ Setup Complete! ==="
echo ""
echo "Kerberos Realm: EXAMPLE.COM"
echo "KDC: kdc.example.com"
echo ""
echo "Available Principals:"
echo "  - kafka/kafka.example.com@EXAMPLE.COM (keytab: keytabs/kafka.keytab)"
echo "  - zookeeper/zookeeper.example.com@EXAMPLE.COM (keytab: keytabs/zookeeper.keytab)"
echo "  - producer@EXAMPLE.COM (password: producer123, keytab: keytabs/producer.keytab)"
echo "  - consumer@EXAMPLE.COM (password: consumer123, keytab: keytabs/consumer.keytab)"
echo "  - admin@EXAMPLE.COM (password: admin123, keytab: keytabs/admin.keytab)"
echo ""
echo "Schema Registry:"
echo "  - URL: http://schema-registry.example.com:8081"
echo "  - Authentication: BASIC (admin/admin123)"
echo "  - Users: admin, developer, schemauser"
echo ""
echo "Test Scripts:"
echo "  - ./producer.sh - Shell-based producer"
echo "  - ./consumer.sh - Shell-based consumer"
echo "  - ./producer.py - Python producer (requires kafka-python)"
echo "  - ./consumer.py - Python consumer (requires kafka-python)"
echo ""
echo "Avro Scripts:"
echo "  - ./avro-examples/avro_producer.py - Avro producer with Schema Registry"
echo "  - ./avro-examples/avro_consumer.py - Avro consumer with Schema Registry"
echo ""
echo "Topics:"
echo "  - test-topic (1 partition)"
echo "  - users-avro (3 partitions)"
echo "  - orders-avro (5 partitions)"
echo ""
echo "Kafka Broker: kafka.example.com:9092"
echo "Schema Registry: http://schema-registry.example.com:8081"
echo ""
echo "🎉 Environment is ready to use!"
