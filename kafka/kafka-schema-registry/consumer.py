#!/usr/bin/env python3
"""
Kafka Avro Consumer with Schema Registry (BASIC Auth)
"""

import os
import json
from confluent_kafka import Consumer
from confluent_kafka.serialization import SerializationContext, MessageField
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer

# Unset proxy environment variables to avoid localhost access issues
for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NO_PROXY']:
    if proxy_var in os.environ:
        del os.environ[proxy_var]

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'

# Schema Registry configuration with BASIC Auth
SCHEMA_REGISTRY_URL = 'http://localhost:8081'
SCHEMA_REGISTRY_USER = 'admin'
SCHEMA_REGISTRY_PASSWORD = 'admin123'

# Kafka consumer configuration (no authentication)
consumer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'avro-consumer-group',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': True,
}

# Schema Registry client configuration
schema_registry_conf = {
    'url': SCHEMA_REGISTRY_URL,
    'basic.auth.user.info': f'{SCHEMA_REGISTRY_USER}:{SCHEMA_REGISTRY_PASSWORD}'
}

def consume_topic(topic, avro_deserializer, max_messages=None):
    """Consume messages from a topic"""
    print(f"\n=== Consuming from topic: {topic} ===")

    # Create consumer
    consumer = Consumer(consumer_config)
    consumer.subscribe([topic])

    message_count = 0

    try:
        while True:
            msg = consumer.poll(timeout=1.0)

            if msg is None:
                continue

            if msg.error():
                print(f"✗ Consumer error: {msg.error()}")
                continue

            # Deserialize message
            try:
                key = msg.key().decode('utf-8') if msg.key() else None
                value = avro_deserializer(msg.value(), SerializationContext(topic, MessageField.VALUE))

                message_count += 1
                print(f"\n--- Message {message_count} ---")
                print(f"Key: {key}")
                print(f"Partition: {msg.partition()}")
                print(f"Offset: {msg.offset()}")
                print(f"Value: {json.dumps(value, indent=2, default=str)}")

                if max_messages and message_count >= max_messages:
                    print(f"\n✓ Reached max messages ({max_messages})")
                    break

            except Exception as e:
                print(f"✗ Error deserializing message: {e}")

    except KeyboardInterrupt:
        print("\n✓ Consumer interrupted by user")
    finally:
        consumer.close()
        print(f"✓ Consumed {message_count} messages from {topic}")

def main():
    print("=== Kafka Avro Consumer ===")
    print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Schema Registry: {SCHEMA_REGISTRY_URL}")

    # Create Schema Registry client
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # Get schemas from registry
    print("\nFetching schemas from Schema Registry...")
    user_schema_str = schema_registry_client.get_latest_version('users-avro-value').schema.schema_str
    order_schema_str = schema_registry_client.get_latest_version('orders-avro-value').schema.schema_str
    print("✓ Schemas fetched successfully")

    # Create Avro deserializers
    user_avro_deserializer = AvroDeserializer(
        schema_registry_client,
        user_schema_str
    )

    order_avro_deserializer = AvroDeserializer(
        schema_registry_client,
        order_schema_str
    )

    print("\n" + "="*60)
    print("Choose topic to consume:")
    print("  1. users-avro")
    print("  2. orders-avro")
    print("  3. both (sequential)")
    print("="*60)

    choice = input("\nEnter choice (1-3): ").strip()

    if choice == '1':
        consume_topic('users-avro', user_avro_deserializer, max_messages=10)
    elif choice == '2':
        consume_topic('orders-avro', order_avro_deserializer, max_messages=20)
    elif choice == '3':
        consume_topic('users-avro', user_avro_deserializer, max_messages=10)
        consume_topic('orders-avro', order_avro_deserializer, max_messages=20)
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()
