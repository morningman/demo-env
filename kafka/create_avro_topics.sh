#!/bin/bash
set -eo pipefail

# Error handling function
error_exit() {
    echo ""
    echo "❌ ERROR: $1" >&2
    exit 1
}

echo "=== Creating Avro Topics with Multiple Partitions ==="
echo ""

# Verify Kafka container is running
if ! docker ps --filter "name=kafka" --filter "status=running" --format "{{.Names}}" | grep -q "^kafka$"; then
    echo "Kafka container status:"
    docker ps -a --filter "name=kafka"
    error_exit "Kafka container is not running"
fi

# Create users-avro topic with 3 partitions
echo "1. Creating 'users-avro' topic (3 partitions)..."
CREATE_OUTPUT=$(docker exec kafka kafka-topics --create \
  --bootstrap-server kafka.example.com:9092 \
  --topic users-avro \
  --partitions 3 \
  --replication-factor 1 \
  --command-config /etc/kafka/secrets/producer.properties 2>&1) || true

if echo "$CREATE_OUTPUT" | grep -q "Created topic\|already exists"; then
    echo "✓ users-avro topic created or already exists"
elif echo "$CREATE_OUTPUT" | grep -q "TopicExistsException"; then
    echo "✓ users-avro topic already exists"
else
    echo "Error output: $CREATE_OUTPUT"
    error_exit "Failed to create users-avro topic"
fi

echo ""

# Create orders-avro topic with 5 partitions
echo "2. Creating 'orders-avro' topic (5 partitions)..."
CREATE_OUTPUT=$(docker exec kafka kafka-topics --create \
  --bootstrap-server kafka.example.com:9092 \
  --topic orders-avro \
  --partitions 5 \
  --replication-factor 1 \
  --command-config /etc/kafka/secrets/producer.properties 2>&1) || true

if echo "$CREATE_OUTPUT" | grep -q "Created topic\|already exists"; then
    echo "✓ orders-avro topic created or already exists"
elif echo "$CREATE_OUTPUT" | grep -q "TopicExistsException"; then
    echo "✓ orders-avro topic already exists"
else
    echo "Error output: $CREATE_OUTPUT"
    error_exit "Failed to create orders-avro topic"
fi

echo ""

# Describe topics
echo "3. Describing created topics..."
echo ""
echo "--- users-avro ---"
if ! docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic users-avro \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null; then
    error_exit "Failed to describe users-avro topic"
fi

echo ""
echo "--- orders-avro ---"
if ! docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic orders-avro \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null; then
    error_exit "Failed to describe orders-avro topic"
fi

echo ""
echo "✓ Avro topics created successfully!"
