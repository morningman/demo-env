#!/bin/bash
# Insert sample data into test-topic (plain text messages)
set -eo pipefail

echo "Inserting sample data into test-topic..."

# Sample messages
MESSAGES=(
    "Hello Kafka with Kerberos!"
    '{"type":"info","message":"System startup completed","timestamp":"2026-01-30T10:00:00Z"}'
    '{"type":"warning","message":"High memory usage detected","timestamp":"2026-01-30T10:05:00Z"}'
    '{"type":"error","message":"Connection timeout to database","timestamp":"2026-01-30T10:10:00Z"}'
    "Simple text message 1"
    "Simple text message 2"
    '{"user_id":1001,"action":"login","ip":"192.168.1.100"}'
    '{"user_id":1002,"action":"logout","ip":"192.168.1.101"}'
    "Event: User registration completed"
    "Event: Payment processed successfully"
)

# Send messages to Kafka
for msg in "${MESSAGES[@]}"; do
    echo "$msg" | docker exec -i kafka kafka-console-producer \
        --broker-list kafka.example.com:9092 \
        --topic test-topic \
        --producer.config /etc/kafka/secrets/producer.properties 2>/dev/null
done

echo "✓ Inserted ${#MESSAGES[@]} sample messages into test-topic"
