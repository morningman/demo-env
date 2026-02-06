#!/usr/bin/env python3
"""
Kafka Avro Consumer - Special Scenario
Topic name: NRDP.topic1
Schema Subject: topic1-value (name mismatch)
Does not change offset when consuming (enable.auto.commit=False)
"""

import os
import json
from confluent_kafka import Consumer
from confluent_kafka.serialization import SerializationContext, MessageField
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer

# Clear proxy environment variables to avoid localhost access issues
for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NO_PROXY']:
    if proxy_var in os.environ:
        del os.environ[proxy_var]

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'
KAFKA_TOPIC = 'NRDP.topic1'  # Actual Kafka topic name

# Schema Registry configuration
SCHEMA_REGISTRY_URL = 'http://localhost:8081'
SCHEMA_REGISTRY_USER = 'admin'
SCHEMA_REGISTRY_PASSWORD = 'admin123'
SCHEMA_SUBJECT = 'topic1-value'  # Schema subject name (does not match topic name)

# Kafka consumer configuration
# enable.auto.commit=False: Do not auto-commit offset, allows repeated consumption
consumer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'wrong-topic-consumer-group',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False,  # Do not auto-commit offset, read from beginning each time
}

# Schema Registry client configuration
schema_registry_conf = {
    'url': SCHEMA_REGISTRY_URL,
    'basic.auth.user.info': f'{SCHEMA_REGISTRY_USER}:{SCHEMA_REGISTRY_PASSWORD}'
}

def consume_messages(consumer, avro_deserializer, max_messages=None):
    """Consume messages"""
    print(f"\n=== Consuming messages from topic: {KAFKA_TOPIC} ===")
    print(f"Schema Subject: {SCHEMA_SUBJECT}")
    print("⚠ Note: enable.auto.commit=False, offset will not change")
    print()

    message_count = 0

    try:
        while True:
            msg = consumer.poll(timeout=1.0)

            if msg is None:
                if message_count > 0:
                    print(f"\n⏸ No more messages (consumed {message_count} messages)")
                    break
                continue

            if msg.error():
                print(f"✗ Consumer error: {msg.error()}")
                continue

            # Deserialize message
            try:
                key = msg.key().decode('utf-8') if msg.key() else None
                value = avro_deserializer(msg.value(), SerializationContext(KAFKA_TOPIC, MessageField.VALUE))

                message_count += 1
                print(f"\n--- Message {message_count} ---")
                print(f"Key: {key}")
                print(f"Topic: {msg.topic()}")
                print(f"Partition: {msg.partition()}")
                print(f"Offset: {msg.offset()}")
                print(f"Timestamp: {msg.timestamp()}")
                print(f"Value:")
                print(json.dumps(value, indent=2, ensure_ascii=False, default=str))

                if max_messages and message_count >= max_messages:
                    print(f"\n✓ Reached maximum message count ({max_messages})")
                    break

            except Exception as e:
                print(f"✗ Failed to deserialize message: {e}")
                print(f"Raw value: {msg.value()}")

    except KeyboardInterrupt:
        print("\n✓ User interrupted consumption")
    finally:
        # Note: We don't call commit(), so offset will not change
        consumer.close()
        print(f"\n✓ Total consumed {message_count} messages")
        print("⚠ Offset not committed, next run will consume from beginning")

def main():
    print("=== Kafka Avro Consumer - Special Scenario ===")
    print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Schema Registry: {SCHEMA_REGISTRY_URL}")
    print()
    print("⚠ Special scenario description:")
    print(f"  - Kafka Topic: {KAFKA_TOPIC}")
    print(f"  - Schema Subject: {SCHEMA_SUBJECT}")
    print("  - Name mismatch scenario test")
    print("  - Does not commit offset when consuming (repeatable consumption)")
    print()

    # Create Schema Registry client
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # Get schema from Schema Registry
    print("Getting schema from Schema Registry...")
    try:
        schema_version = schema_registry_client.get_latest_version(SCHEMA_SUBJECT)
        schema_str = schema_version.schema.schema_str
        print(f"✓ Schema retrieved successfully (ID: {schema_version.schema_id}, Version: {schema_version.version})")
    except Exception as e:
        print(f"✗ Failed to get schema: {e}")
        print(f"\nPlease run register_schema.py to register schema first!")
        return

    # Create Avro deserializer
    avro_deserializer = AvroDeserializer(
        schema_registry_client,
        schema_str
    )

    # Create consumer
    consumer = Consumer(consumer_config)
    consumer.subscribe([KAFKA_TOPIC])

    # Ask user how many messages to consume
    print("\n" + "="*60)
    print("Options:")
    print("  1. Consume all messages")
    print("  2. Consume first 10 messages")
    print("  3. Consume first N messages (custom)")
    print("="*60)

    choice = input("\nPlease choose (1-3): ").strip()

    max_messages = None
    if choice == '2':
        max_messages = 10
    elif choice == '3':
        try:
            max_messages = int(input("Enter the number of messages to consume: ").strip())
        except ValueError:
            print("Invalid input, will consume all messages")
            max_messages = None

    # Consume messages
    consume_messages(consumer, avro_deserializer, max_messages=max_messages)

    print("\n✓ Consumption completed!")

if __name__ == "__main__":
    main()
