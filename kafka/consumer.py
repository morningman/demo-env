#!/usr/bin/env python3
"""
Kafka Consumer with Kerberos Authentication
"""

from kafka import KafkaConsumer
import json

def create_consumer():
    """Create Kafka consumer with Kerberos authentication"""
    consumer = KafkaConsumer(
        'test-topic',
        bootstrap_servers=['kafka.example.com:9092'],
        security_protocol='SASL_PLAINTEXT',
        sasl_mechanism='GSSAPI',
        sasl_kerberos_service_name='kafka',
        sasl_kerberos_domain_name='example.com',
        group_id='test-consumer-group',
        auto_offset_reset='earliest',
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        # Kerberos configuration
        sasl_kerberos_keytab='keytabs/consumer.keytab',
        sasl_kerberos_principal='consumer@EXAMPLE.COM'
    )
    return consumer

def main():
    print("=== Kafka Kerberos Consumer ===")
    print("Connecting to Kafka with Kerberos authentication...")

    try:
        consumer = create_consumer()
        print("✓ Connected successfully!")
        print("\nWaiting for messages... (Press Ctrl+C to stop)\n")

        for message in consumer:
            print(f"✓ Received message:")
            print(f"  Topic: {message.topic}")
            print(f"  Partition: {message.partition}")
            print(f"  Offset: {message.offset}")
            print(f"  Value: {message.value}")
            print()

    except KeyboardInterrupt:
        print("\n✓ Consumer stopped by user")
    except Exception as e:
        print(f"✗ Error: {e}")
        raise
    finally:
        if 'consumer' in locals():
            consumer.close()

if __name__ == "__main__":
    main()
