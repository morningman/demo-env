#!/bin/bash

# List all Kafka topics
# Usage: ./list_topics.sh

set -e

KAFKA_CONTAINER="kafka-sr"
BOOTSTRAP_SERVER="localhost:9092"

echo "============================================"
echo "Kafka Topics List"
echo "============================================"
echo ""

# Check if Kafka container is running
if ! sudo docker ps --format '{{.Names}}' | grep -q "^${KAFKA_CONTAINER}$"; then
    echo "Error: Kafka container '${KAFKA_CONTAINER}' is not running"
    echo "Please start the environment with: ./manage.sh start"
    exit 1
fi

# List all topics
echo "Listing all topics:"
echo ""
sudo docker exec ${KAFKA_CONTAINER} kafka-topics \
    --bootstrap-server ${BOOTSTRAP_SERVER} \
    --list

echo ""
echo "To see detailed information about a topic, use:"
echo "  sudo docker exec ${KAFKA_CONTAINER} kafka-topics --bootstrap-server ${BOOTSTRAP_SERVER} --describe --topic <topic-name>"
