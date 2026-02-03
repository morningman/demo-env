#!/usr/bin/env python3
"""
Kafka Producer with Kerberos Authentication
"""

from kafka import KafkaProducer
import json
import time
from datetime import datetime

def create_producer():
    """Create Kafka producer with Kerberos authentication"""
    producer = KafkaProducer(
        bootstrap_servers=['kafka.example.com:9092'],
        security_protocol='SASL_PLAINTEXT',
        sasl_mechanism='GSSAPI',
        sasl_kerberos_service_name='kafka',
        sasl_kerberos_domain_name='example.com',
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        # Kerberos configuration
        sasl_kerberos_keytab='keytabs/producer.keytab',
        sasl_kerberos_principal='producer@EXAMPLE.COM'
    )
    return producer

def main():
    print("=== Kafka Kerberos Producer ===")
    print("Connecting to Kafka with Kerberos authentication...")

    try:
        producer = create_producer()
        print("✓ Connected successfully!")

        topic = 'test-topic'
        print(f"\nSending messages to topic: {topic}")

        # Send 10 test messages
        for i in range(10):
            message = {
                'message_id': i,
                'timestamp': datetime.now().isoformat(),
                'content': f'Test message {i} from Kerberos authenticated producer'
            }

            future = producer.send(topic, value=message)
            record_metadata = future.get(timeout=10)

            print(f"✓ Sent message {i}: partition={record_metadata.partition}, offset={record_metadata.offset}")
            time.sleep(1)

        producer.flush()
        print("\n✓ All messages sent successfully!")

    except Exception as e:
        print(f"✗ Error: {e}")
        raise
    finally:
        if 'producer' in locals():
            producer.close()

if __name__ == "__main__":
    main()
