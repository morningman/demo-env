#!/usr/bin/env python3
"""
Kafka Avro Producer - Special Scenario
Topic name: NRDP.topic1
Schema Subject: topic1-value (name mismatch)
"""

import time
import os
from datetime import datetime
from confluent_kafka import Producer
from confluent_kafka.serialization import SerializationContext, MessageField
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

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

# Kafka producer configuration
producer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
}

# Schema Registry client configuration
schema_registry_conf = {
    'url': SCHEMA_REGISTRY_URL,
    'basic.auth.user.info': f'{SCHEMA_REGISTRY_USER}:{SCHEMA_REGISTRY_PASSWORD}'
}

def delivery_report(err, msg):
    """Message delivery callback function"""
    if err is not None:
        print(f'✗ Message delivery failed: {err}')
    else:
        print(f'✓ Message delivered to {msg.topic()} [partition {msg.partition()}] offset {msg.offset()}')

def create_sample_data(record_id):
    """Create sample data"""
    statuses = ['ACTIVE', 'INACTIVE', 'PENDING']

    return {
        'id': record_id,
        'message': f'This is message {record_id} - testing special scenario',
        'timestamp': int(time.time() * 1000),
        'status': statuses[record_id % 3],
        'metadata': {
            'source': 'wrong-topic-producer',
            'version': '1.0',
            'scenario': 'topic-schema-mismatch'
        }
    }

def produce_messages(producer, avro_serializer, count=10):
    """Produce messages"""
    print(f"\n=== Producing {count} messages ===")
    print(f"Topic: {KAFKA_TOPIC}")
    print(f"Schema Subject: {SCHEMA_SUBJECT}")
    print()

    for i in range(1, count + 1):
        data = create_sample_data(i)

        try:
            # Note: Here we pass the actual topic name to SerializationContext
            # But the schema is fetched from a different subject
            producer.produce(
                topic=KAFKA_TOPIC,
                key=str(data['id']).encode('utf-8'),
                value=avro_serializer(data, SerializationContext(KAFKA_TOPIC, MessageField.VALUE)),
                on_delivery=delivery_report
            )
            producer.poll(0)
            time.sleep(0.2)
        except Exception as e:
            print(f'✗ Failed to produce message {i}: {e}')

    producer.flush()
    print(f"\n✓ Flushed all messages to Kafka")

def main():
    print("=== Kafka Avro Producer - Special Scenario ===")
    print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Schema Registry: {SCHEMA_REGISTRY_URL}")
    print()
    print("⚠ Special scenario description:")
    print(f"  - Kafka Topic: {KAFKA_TOPIC}")
    print(f"  - Schema Subject: {SCHEMA_SUBJECT}")
    print("  - Name mismatch scenario test")
    print()

    # Create Schema Registry client
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # Create producer
    producer = Producer(producer_config)

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

    # Create Avro serializer
    avro_serializer = AvroSerializer(
        schema_registry_client,
        schema_str
    )

    # Produce messages
    produce_messages(producer, avro_serializer, count=10)

    print("\n✓ Message production completed!")

if __name__ == "__main__":
    main()
