#!/usr/bin/env python3
"""
Simple Kafka Consumer
Used to view existing data in a topic without affecting the offset of existing consumer groups
Uses a temporary consumer group each time, reads all messages from the beginning
"""

from kafka import KafkaConsumer, TopicPartition
import json
from datetime import datetime
import uuid

# Kafka configuration
BOOTSTRAP_SERVERS = ['localhost:9092']
TOPIC = 'simple-topic'

def view_messages(timeout_ms=5000):
    """
    View all messages in the topic

    Args:
        timeout_ms: Consumer timeout (milliseconds)
    """
    # Use random group id, each time is a new consumer group
    temp_group_id = f'viewer-{uuid.uuid4().hex[:8]}'

    print(f"Using temporary Consumer Group: {temp_group_id}")
    print(f"This will not affect the offset of other consumer groups\n")

    consumer = None
    try:
        # Create consumer
        consumer = KafkaConsumer(
            TOPIC,
            bootstrap_servers=BOOTSTRAP_SERVERS,
            group_id=temp_group_id,
            auto_offset_reset='earliest',  # Start from earliest message
            enable_auto_commit=False,  # Don't auto-commit offset
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            consumer_timeout_ms=timeout_ms  # Stop after timeout
        )

        print(f"Connected to Kafka successfully")
        print(f"Topic: {TOPIC}")
        print(f"Number of partitions: {len(consumer.partitions_for_topic(TOPIC))}\n")
        print("=" * 80)

        # Statistics by partition
        partition_stats = {}
        total_messages = 0

        # Consume messages
        for message in consumer:
            partition = message.partition
            offset = message.offset
            key = message.key.decode('utf-8') if message.key else None
            value = message.value

            # Statistics
            if partition not in partition_stats:
                partition_stats[partition] = {
                    'count': 0,
                    'first_offset': offset,
                    'last_offset': offset
                }

            partition_stats[partition]['count'] += 1
            partition_stats[partition]['last_offset'] = offset
            total_messages += 1

            # Print message
            print(f"Partition: {partition} | Offset: {offset} | Key: {key}")
            print(f"  Content: {json.dumps(value, ensure_ascii=False, indent=4)}")
            print("-" * 80)

        # Print statistics
        print("\n" + "=" * 80)
        print("Statistics:")
        print("=" * 80)

        for partition in sorted(partition_stats.keys()):
            stats = partition_stats[partition]
            print(f"Partition {partition}: {stats['count']} messages "
                  f"(offset {stats['first_offset']} - {stats['last_offset']})")

        print(f"\nTotal: {total_messages} messages")

        if total_messages == 0:
            print("\nNote: Topic currently has no messages")

    except Exception as e:
        print(f"\nError: {e}")
        raise
    finally:
        if consumer:
            consumer.close()
            print(f"\nConsumer closed")

def show_topic_info():
    """Display detailed topic information"""
    consumer = None
    try:
        # Create temporary consumer to get topic info
        consumer = KafkaConsumer(
            bootstrap_servers=BOOTSTRAP_SERVERS,
            group_id=f'info-{uuid.uuid4().hex[:8]}'
        )

        partitions = consumer.partitions_for_topic(TOPIC)

        if not partitions:
            print(f"Topic '{TOPIC}' does not exist or is not accessible")
            return

        print("\n" + "=" * 80)
        print("Topic Partition Information:")
        print("=" * 80)

        # Get start and end offset for each partition
        topic_partitions = [TopicPartition(TOPIC, p) for p in partitions]

        # Get beginning and end positions
        beginning_offsets = consumer.beginning_offsets(topic_partitions)
        end_offsets = consumer.end_offsets(topic_partitions)

        for tp in sorted(topic_partitions, key=lambda x: x.partition):
            begin = beginning_offsets[tp]
            end = end_offsets[tp]
            count = end - begin
            print(f"Partition {tp.partition}: {count} messages "
                  f"(offset {begin} - {end-1})" if count > 0
                  else f"Partition {tp.partition}: 0 messages")

    except Exception as e:
        print(f"Failed to get topic information: {e}")
    finally:
        if consumer:
            consumer.close()

def main():
    """Main function"""
    print("=" * 80)
    print("Simple Kafka Consumer - Message Viewer")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    # First display topic info
    show_topic_info()

    print("\nStarting to read messages...\n")

    # View messages
    view_messages(timeout_ms=5000)

if __name__ == '__main__':
    main()
