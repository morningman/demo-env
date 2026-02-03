# Simple Kafka Docker Environment

The simplest Kafka Docker environment configuration for quick development and testing.

## Features

- ✓ No authentication required
- ✓ No Schema Registry needed
- ✓ Auto-creates a 5-partition topic (`simple-topic`)
- ✓ Simple Producer script (inserts messages to all partitions each execution)
- ✓ Simple Consumer script (views data without affecting offset)

## Quick Start

### 1. Install Python Dependencies

```bash
./simple-kafka.sh install-deps
# or
pip3 install kafka-python
```

### 2. Start Kafka Environment

```bash
./simple-kafka.sh start
```

This will start:
- Zookeeper (port 2181)
- Kafka Broker (port 9092)
- Auto-create topic: `simple-topic` (5 partitions)

### 3. Send Messages

```bash
./simple-kafka.sh produce
# or run directly
python3 producer-simple.py
```

Each execution sends 3 messages to each of 5 partitions (15 messages total).

### 4. View Messages

```bash
./simple-kafka.sh consume
# or run directly
python3 consumer-simple.py
```

Uses a temporary consumer group, reads all messages from the beginning, doesn't affect other consumers' offsets.

## Management Commands

```bash
./simple-kafka.sh start          # Start environment
./simple-kafka.sh stop           # Stop environment
./simple-kafka.sh restart        # Restart environment
./simple-kafka.sh clean          # Clean environment and all data
./simple-kafka.sh status         # View container status
./simple-kafka.sh logs           # View Kafka logs
./simple-kafka.sh topic          # View topic information
./simple-kafka.sh produce        # Send messages
./simple-kafka.sh consume        # View messages
./simple-kafka.sh help           # Show help
```

## File Descriptions

- `docker-compose-simple.yml` - Docker Compose configuration
- `producer-simple.py` - Producer script
- `consumer-simple.py` - Consumer script
- `simple-kafka.sh` - Environment management script
- `SIMPLE_README.md` - This document

## Usage Example

```bash
# Start environment
./simple-kafka.sh start

# Send a batch of messages
./simple-kafka.sh produce

# Send another batch
./simple-kafka.sh produce

# View all messages
./simple-kafka.sh consume

# View topic details
./simple-kafka.sh topic

# Clean data and restart
./simple-kafka.sh clean
./simple-kafka.sh start
```

## Producer Script Description

`producer-simple.py` each execution:
- Sends 3 messages to each of 5 partitions (can modify `num_messages_per_partition` parameter)
- Each message contains: partition number, message ID, timestamp, content
- Uses partition key to ensure messages go to specified partition

## Consumer Script Description

`consumer-simple.py` each execution:
- Uses randomly generated temporary consumer group
- Reads all messages from beginning (`auto_offset_reset='earliest'`)
- Disables auto-commit (`enable_auto_commit=False`)
- Doesn't affect other consumer groups' offsets
- Displays detailed message content and partition statistics

## Technical Details

- Kafka version: 7.5.0 (Confluent Platform)
- Broker address: `localhost:9092`
- Topic: `simple-topic`
- Partitions: 5
- Replication factor: 1
- No authentication, no encryption

## Troubleshooting

### Port Conflicts

If port 9092 or 2181 is already in use:

```bash
# Stop other Kafka instances
./simple-kafka.sh stop

# or modify port mapping in docker-compose-simple.yml
```

### Python Dependency Issues

```bash
# Ensure using Python 3
python3 --version

# Reinstall dependencies
pip3 install --upgrade kafka-python
```

### View Logs

```bash
# View Kafka logs
./simple-kafka.sh logs

# or
docker-compose -f docker-compose-simple.yml logs kafka
```

## Clean Environment

```bash
# Stop but keep data
./simple-kafka.sh stop

# Complete cleanup (including data)
./simple-kafka.sh clean
```
