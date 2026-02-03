#!/usr/bin/env python3
"""
Insert sample Avro data into users-avro and orders-avro topics
"""

import time
import random
from confluent_kafka import Producer
from confluent_kafka.serialization import SerializationContext, MessageField
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

# Configuration
KAFKA_BROKER = 'kafka.example.com:9092'
SCHEMA_REGISTRY_URL = 'http://schema-registry.example.com:8081'

# Kerberos configuration for producer
KAFKA_CONFIG = {
    'bootstrap.servers': KAFKA_BROKER,
    'security.protocol': 'SASL_PLAINTEXT',
    'sasl.mechanism': 'GSSAPI',
    'sasl.kerberos.service.name': 'kafka',
    'sasl.kerberos.keytab': 'keytabs/producer.keytab',
    'sasl.kerberos.principal': 'producer@EXAMPLE.COM'
}

# Sample user data
SAMPLE_USERS = [
    {
        "id": 1001,
        "username": "john_doe",
        "email": "john.doe@example.com",
        "age": 28,
        "created_at": int(time.time() * 1000),
        "is_active": True,
        "metadata": {"department": "Engineering", "level": "Senior"}
    },
    {
        "id": 1002,
        "username": "jane_smith",
        "email": "jane.smith@example.com",
        "age": 32,
        "created_at": int(time.time() * 1000),
        "is_active": True,
        "metadata": {"department": "Marketing", "level": "Manager"}
    },
    {
        "id": 1003,
        "username": "bob_wilson",
        "email": "bob.wilson@example.com",
        "age": None,
        "created_at": int(time.time() * 1000),
        "is_active": True,
        "metadata": {"department": "Sales", "level": "Junior"}
    },
    {
        "id": 1004,
        "username": "alice_brown",
        "email": "alice.brown@example.com",
        "age": 45,
        "created_at": int(time.time() * 1000),
        "is_active": False,
        "metadata": {"department": "HR", "level": "Director"}
    },
    {
        "id": 1005,
        "username": "charlie_davis",
        "email": "charlie.davis@example.com",
        "age": 26,
        "created_at": int(time.time() * 1000),
        "is_active": True,
        "metadata": {"department": "Engineering", "level": "Junior"}
    }
]

# Sample order data
SAMPLE_ORDERS = [
    {
        "order_id": "ORD-2026-001",
        "user_id": 1001,
        "product_name": "Laptop Pro 15",
        "quantity": 1,
        "price": 1299.99,
        "total_amount": 1299.99,
        "status": "DELIVERED",
        "order_date": int(time.time() * 1000) - 86400000 * 5  # 5 days ago
    },
    {
        "order_id": "ORD-2026-002",
        "user_id": 1002,
        "product_name": "Wireless Mouse",
        "quantity": 2,
        "price": 29.99,
        "total_amount": 59.98,
        "status": "SHIPPED",
        "order_date": int(time.time() * 1000) - 86400000 * 3  # 3 days ago
    },
    {
        "order_id": "ORD-2026-003",
        "user_id": 1001,
        "product_name": "USB-C Cable",
        "quantity": 3,
        "price": 12.99,
        "total_amount": 38.97,
        "status": "DELIVERED",
        "order_date": int(time.time() * 1000) - 86400000 * 2  # 2 days ago
    },
    {
        "order_id": "ORD-2026-004",
        "user_id": 1003,
        "product_name": "Mechanical Keyboard",
        "quantity": 1,
        "price": 149.99,
        "total_amount": 149.99,
        "status": "PROCESSING",
        "order_date": int(time.time() * 1000) - 86400000 * 1  # 1 day ago
    },
    {
        "order_id": "ORD-2026-005",
        "user_id": 1005,
        "product_name": "Monitor 27 inch",
        "quantity": 1,
        "price": 399.99,
        "total_amount": 399.99,
        "status": "PENDING",
        "order_date": int(time.time() * 1000)
    },
    {
        "order_id": "ORD-2026-006",
        "user_id": 1002,
        "product_name": "Desk Lamp",
        "quantity": 2,
        "price": 45.00,
        "total_amount": 90.00,
        "status": "CANCELLED",
        "order_date": int(time.time() * 1000) - 86400000 * 7  # 7 days ago
    },
    {
        "order_id": "ORD-2026-007",
        "user_id": 1004,
        "product_name": "Webcam HD",
        "quantity": 1,
        "price": 79.99,
        "total_amount": 79.99,
        "status": "SHIPPED",
        "order_date": int(time.time() * 1000) - 86400000 * 1
    }
]

def delivery_report(err, msg):
    """Callback for message delivery reports"""
    if err is not None:
        print(f'✗ Message delivery failed: {err}')
    else:
        print(f'✓ Message delivered to {msg.topic()} [partition {msg.partition()}]')

def produce_users(producer, user_serializer):
    """Produce sample user data"""
    print("\nProducing user data to users-avro topic...")

    for user in SAMPLE_USERS:
        try:
            producer.produce(
                topic='users-avro',
                key=str(user['id']),
                value=user_serializer(user, SerializationContext('users-avro', MessageField.VALUE)),
                on_delivery=delivery_report
            )
            producer.poll(0)
        except Exception as e:
            print(f'✗ Failed to produce user {user["id"]}: {e}')

    producer.flush()
    print(f'✓ Produced {len(SAMPLE_USERS)} user records')

def produce_orders(producer, order_serializer):
    """Produce sample order data"""
    print("\nProducing order data to orders-avro topic...")

    for order in SAMPLE_ORDERS:
        try:
            producer.produce(
                topic='orders-avro',
                key=order['order_id'],
                value=order_serializer(order, SerializationContext('orders-avro', MessageField.VALUE)),
                on_delivery=delivery_report
            )
            producer.poll(0)
        except Exception as e:
            print(f'✗ Failed to produce order {order["order_id"]}: {e}')

    producer.flush()
    print(f'✓ Produced {len(SAMPLE_ORDERS)} order records')

def main():
    print("=== Inserting Sample Avro Data ===\n")

    # Schema Registry client
    schema_registry_conf = {'url': SCHEMA_REGISTRY_URL}
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # Get schemas from Schema Registry
    try:
        user_schema_str = schema_registry_client.get_latest_version('users-value').schema.schema_str
        order_schema_str = schema_registry_client.get_latest_version('orders-value').schema.schema_str
        print("✓ Retrieved schemas from Schema Registry")
    except Exception as e:
        print(f"✗ Failed to get schemas: {e}")
        return 1

    # Create serializers
    user_serializer = AvroSerializer(
        schema_registry_client,
        user_schema_str
    )

    order_serializer = AvroSerializer(
        schema_registry_client,
        order_schema_str
    )

    # Create producer
    producer = Producer(KAFKA_CONFIG)

    # Produce data
    produce_users(producer, user_serializer)
    produce_orders(producer, order_serializer)

    print("\n✓ Sample Avro data insertion completed!")
    return 0

if __name__ == "__main__":
    exit(main())
