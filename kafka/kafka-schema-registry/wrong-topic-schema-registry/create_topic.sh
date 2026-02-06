#!/bin/bash
# Create Kafka topic "NRDP.topic1"

echo "=== Creating Kafka Topic ==="
echo "Topic Name: NRDP.topic1"
echo ""

# Use kafka-topics command to create topic
docker exec -it kafka kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --topic NRDP.topic1 \
  --partitions 3 \
  --replication-factor 1

echo ""
echo "✓ Topic created successfully!"
echo ""
echo "=== Listing all topics ==="
docker exec -it kafka kafka-topics.sh \
  --list \
  --bootstrap-server localhost:9092

echo ""
echo "=== Describing topic NRDP.topic1 ==="
docker exec -it kafka kafka-topics.sh \
  --describe \
  --bootstrap-server localhost:9092 \
  --topic NRDP.topic1
