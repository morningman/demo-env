#!/usr/bin/env python3
"""
Kafka Avro Producer with Schema Registry (BASIC Auth)
"""

import time
import os
from datetime import datetime
from confluent_kafka import Producer
from confluent_kafka.serialization import SerializationContext, MessageField
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

# Unset proxy environment variables to avoid localhost access issues
for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NO_PROXY']:
    if proxy_var in os.environ:
        del os.environ[proxy_var]

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'
TOPIC_USERS = 'users-avro'
TOPIC_ORDERS = 'orders-avro'

# Schema Registry configuration with BASIC Auth
SCHEMA_REGISTRY_URL = 'http://localhost:8081'
SCHEMA_REGISTRY_USER = 'admin'
SCHEMA_REGISTRY_PASSWORD = 'admin123'

# Kafka producer configuration (no authentication)
producer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
}

# Schema Registry client configuration
schema_registry_conf = {
    'url': SCHEMA_REGISTRY_URL,
    'basic.auth.user.info': f'{SCHEMA_REGISTRY_USER}:{SCHEMA_REGISTRY_PASSWORD}'
}

def delivery_report(err, msg):
    """Delivery callback"""
    if err is not None:
        print(f'✗ Message delivery failed: {err}')
    else:
        print(f'✓ Message delivered to {msg.topic()} [partition {msg.partition()}] at offset {msg.offset()}')

def create_user_data(user_id):
    """Create sample user data"""
    return {
        'id': user_id,
        'username': f'user{user_id}',
        'email': f'user{user_id}@example.com',
        'age': 20 + (user_id % 50),
        'created_at': int(time.time() * 1000),
        'is_active': True,
        'metadata': {
            'source': 'avro_producer',
            'version': '1.0'
        }
    }

def create_order_data(order_num, user_id):
    """Create sample order data"""
    statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    products = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headset']

    product = products[order_num % len(products)]
    quantity = 1 + (order_num % 5)
    price = 10.99 + (order_num % 100)

    return {
        'order_id': f'ORD-{order_num:06d}',
        'user_id': user_id,
        'product_name': product,
        'quantity': quantity,
        'price': price,
        'total_amount': quantity * price,
        'status': statuses[order_num % len(statuses)],
        'order_date': int(time.time() * 1000)
    }

def produce_users(producer, avro_serializer, count=10):
    """Produce user messages"""
    print(f"\n=== Producing {count} User messages ===")

    for i in range(1, count + 1):
        user = create_user_data(i)

        try:
            producer.produce(
                topic=TOPIC_USERS,
                key=str(user['id']).encode('utf-8'),
                value=avro_serializer(user, SerializationContext(TOPIC_USERS, MessageField.VALUE)),
                on_delivery=delivery_report
            )
            producer.poll(0)
            time.sleep(0.1)
        except Exception as e:
            print(f'✗ Failed to produce user {i}: {e}')

    producer.flush()
    print(f"✓ Flushed {count} user messages")

def produce_orders(producer, avro_serializer, count=20):
    """Produce order messages"""
    print(f"\n=== Producing {count} Order messages ===")

    for i in range(1, count + 1):
        user_id = 1 + (i % 10)  # Assign to users 1-10
        order = create_order_data(i, user_id)

        try:
            producer.produce(
                topic=TOPIC_ORDERS,
                key=order['order_id'].encode('utf-8'),
                value=avro_serializer(order, SerializationContext(TOPIC_ORDERS, MessageField.VALUE)),
                on_delivery=delivery_report
            )
            producer.poll(0)
            time.sleep(0.1)
        except Exception as e:
            print(f'✗ Failed to produce order {i}: {e}')

    producer.flush()
    print(f"✓ Flushed {count} order messages")

def main():
    print("=== Kafka Avro Producer ===")
    print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Schema Registry: {SCHEMA_REGISTRY_URL}")
    print()

    # Create Schema Registry client
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # Create producer
    producer = Producer(producer_config)

    # Get schemas from registry
    print("Fetching schemas from Schema Registry...")
    user_schema_str = schema_registry_client.get_latest_version('users-avro-value').schema.schema_str
    order_schema_str = schema_registry_client.get_latest_version('orders-avro-value').schema.schema_str
    print("✓ Schemas fetched successfully")

    # Create Avro serializers
    user_avro_serializer = AvroSerializer(
        schema_registry_client,
        user_schema_str
    )

    order_avro_serializer = AvroSerializer(
        schema_registry_client,
        order_schema_str
    )

    # Produce users
    produce_users(producer, user_avro_serializer, count=10)

    # Produce orders
    produce_orders(producer, order_avro_serializer, count=20)

    print("\n✓ All messages produced successfully!")

if __name__ == "__main__":
    main()
