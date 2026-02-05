#!/usr/bin/env python3
"""
Simple Kafka Producer
Each execution inserts messages into 5 partitions
"""

from kafka import KafkaProducer
import json
import time
from datetime import datetime

# Kafka configuration
BOOTSTRAP_SERVERS = ['localhost:9092']
TOPIC = 'simple-topic'
TOPICS = {
    'simple-topic': 5,  # 5 partitions
    'tp1.test1': 3,     # 3 partitions
    'TP1.TEST1': 3      # 3 partitions
}

def create_producer():
    """Create Kafka Producer"""
    return KafkaProducer(
        bootstrap_servers=BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        key_serializer=lambda k: k.encode('utf-8') if k else None
    )

def send_messages(producer, num_messages_per_partition=3):
    """
    Send messages to each partition of all topics

    Args:
        producer: Kafka producer instance
        num_messages_per_partition: Number of messages to send per partition
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    print(f"\nStarting to send messages... Time: {timestamp}")
    print(f"Sending {num_messages_per_partition} messages per partition\n")

    total_sent = 0

    # Send messages to all topics
    for topic_name, num_partitions in TOPICS.items():
        print(f"\n{'='*60}")
        print(f"Sending to topic: {topic_name} ({num_partitions} partitions)")
        print('='*60)

        # Send messages to each partition
        for partition in range(num_partitions):
            for i in range(num_messages_per_partition):
                # Construct message
                message = {
                    'topic': topic_name,
                    'partition': partition,
                    'message_id': f'{topic_name}_p{partition}_m{i}',
                    'timestamp': timestamp,
                    'content': f'This is message {i+1} in partition {partition} of topic {topic_name}'
                }

                # Use partition parameter to specify partition
                key = f'{topic_name}-partition-{partition}'

                future = producer.send(
                    topic_name,
                    key=key,
                    value=message,
                    partition=partition
                )

                # Wait for sending to complete
                record_metadata = future.get(timeout=10)

                print(f"✓ Sent successfully -> Topic: {topic_name}, Partition: {record_metadata.partition}, "
                      f"Offset: {record_metadata.offset}, "
                      f"Message ID: {message['message_id']}")

                total_sent += 1

    print(f"\n{'='*60}")
    print(f"Total sent: {total_sent} messages across {len(TOPICS)} topics")
    print('='*60)

def main():
    """Main function"""
    print("=" * 60)
    print("Simple Kafka Producer")
    print("=" * 60)

    producer = None
    try:
        # Create producer
        print("\nConnecting to Kafka...")
        producer = create_producer()
        print("✓ Connected successfully")

        # Send messages
        send_messages(producer, num_messages_per_partition=3)

        # Ensure all messages are sent
        producer.flush()
        print("\n✓ All messages flushed to Kafka")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        raise
    finally:
        if producer:
            producer.close()
            print("✓ Producer closed")

if __name__ == '__main__':
    main()
