# Simple Kafka Docker Environment

The simplest Kafka Docker environment, ready to use out of the box without any configuration.

## Features

- ✅ **Zero Configuration** - No authentication or configuration files required
- ✅ **No Dependencies** - No Schema Registry needed
- ✅ **Auto Initialization** - Automatically creates a topic with 5 partitions
- ✅ **Simple Scripts** - Easy-to-use Producer and Consumer scripts
- ✅ **Offset Preservation** - Consumer script views data without affecting other applications

## Quick Start

### Prerequisites

- Docker and Docker Compose v2
- Python 3
- sudo permissions (for running Docker)

### 1. Install Python Dependencies

```bash
pip3 install kafka-python --user
```

### 2. Start Kafka Environment

```bash
./simple-kafka.sh start
```

After startup, it will automatically:
- Start Zookeeper (port 2181)
- Start Kafka Broker (port 9092)
- Create topic: `simple-topic` (5 partitions, replication factor 1)

### 3. Send Messages

```bash
./simple-kafka.sh produce
```

Or run directly:

```bash
python3 producer-simple.py
```

Each execution sends 3 messages to each of the 5 partitions (15 messages total).

**Example Output:**
```
============================================================
Simple Kafka Producer
============================================================

Connecting to Kafka...
✓ Connection successful

Starting to send messages... Time: 2026-02-01 00:04:09
Sending 3 messages per partition

✓ Send successful -> Partition: 0, Offset: 0, Message ID: p0_m0
✓ Send successful -> Partition: 0, Offset: 1, Message ID: p0_m1
...
Total sent: 15 messages
```

### 4. View Messages

```bash
./simple-kafka.sh consume
```

Or run directly:

```bash
python3 consumer-simple.py
```

**Features:**
- Uses temporary consumer group (randomly generated each run)
- Reads all messages from the beginning (`auto_offset_reset='earliest'`)
- Does not commit offsets (`enable_auto_commit=False`)
- Does not affect other applications' consumption progress

**Example Output:**
```
================================================================================
Simple Kafka Consumer - Message Viewer
================================================================================

Topic Partition Information:
Partition 0: 3 messages (offset 0 - 2)
Partition 1: 3 messages (offset 0 - 2)
...

================================================================================
Partition: 0 | Offset: 0 | Key: partition-0
  Content: {
    "partition": 0,
    "message_id": "p0_m0",
    "timestamp": "2026-02-01 00:04:09",
    "content": "This is message 1 from partition 0"
}
...

Statistics:
Total: 15 messages
```

## Management Commands

The `simple-kafka.sh` script provides the following commands:

```bash
./simple-kafka.sh start          # Start Kafka environment
./simple-kafka.sh stop           # Stop Kafka environment
./simple-kafka.sh restart        # Restart Kafka environment
./simple-kafka.sh clean          # Clean environment and all data
./simple-kafka.sh status         # View container status
./simple-kafka.sh logs           # View Kafka logs
./simple-kafka.sh topic          # View topic information
./simple-kafka.sh produce        # Run producer to send messages
./simple-kafka.sh consume        # Run consumer to view messages
./simple-kafka.sh install-deps   # Install Python dependencies
./simple-kafka.sh help           # Show help information
```

## Usage Scenario Examples

### Scenario 1: Send and View Messages

```bash
# Start environment
./simple-kafka.sh start

# Send first batch of messages
./simple-kafka.sh produce

# Send second batch of messages
./simple-kafka.sh produce

# View all messages
./simple-kafka.sh consume
```

### Scenario 2: View Topic Details

```bash
# View topic configuration and partition information
./simple-kafka.sh topic
```

Example output:
```
Topic: simple-topic	PartitionCount: 5	ReplicationFactor: 1
	Topic: simple-topic	Partition: 0	Leader: 1	Replicas: 1	Isr: 1
	Topic: simple-topic	Partition: 1	Leader: 1	Replicas: 1	Isr: 1
	...
```

### Scenario 3: Clear Data and Start Over

```bash
# Stop and clear all data
./simple-kafka.sh clean

# Restart
./simple-kafka.sh start

# Topic is now empty, can test again
./simple-kafka.sh produce
./simple-kafka.sh consume
```

## Script Details

### Producer Script (producer-simple.py)

**Features:**
- Sends messages to 5 partitions separately
- Each partition receives 3 messages by default
- Uses partition keys to ensure messages are sent to specified partitions
- Displays send results for each message

**Message Format:**
```json
{
  "partition": 0,
  "message_id": "p0_m0",
  "timestamp": "2026-02-01 00:04:09",
  "content": "This is message 1 from partition 0"
}
```

**Customize Number of Messages:**

Edit `producer-simple.py`, modify line 56:
```python
send_messages(producer, num_messages_per_partition=3)  # Change to desired number
```

### Consumer Script (consumer-simple.py)

**Features:**
- Views all historical messages in the topic
- Uses temporary consumer group (randomly generated each time)
- Does not commit offsets, does not affect other applications
- Displays detailed message content and statistics

**How It Works:**
1. Generates random consumer group ID (e.g., `viewer-2cb408fe`)
2. Subscribes to all topic partitions
3. Reads from the beginning (`auto_offset_reset='earliest'`)
4. Disables auto commit (`enable_auto_commit=False`)
5. Closes after reading all messages (3 second timeout)

**Why doesn't it affect offsets?**
- Uses temporary consumer group, isolated from production consumer groups
- Does not commit offsets, even after reading messages it doesn't update consumer group position

## Environment Configuration

### Docker Compose Configuration (docker-compose-simple.yml)

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper

  kafka-init:
    # Automatically creates topic
```

### Topic Configuration

- **Name**: `simple-topic`
- **Partitions**: 5
- **Replication Factor**: 1
- **Retention**: Default (7 days)
- **Cleanup Policy**: delete

## Troubleshooting

### Issue 1: docker-compose command not found

**Error Message:**
```
docker-compose: command not found
```

**Solution:**

The script automatically uses `docker compose` (v2 version), no manual handling needed.

### Issue 2: Docker Permission Error

**Error Message:**
```
permission denied while trying to connect to the Docker daemon socket
```

**Solution:**

The script automatically adds `sudo`, make sure you have sudo permissions.

### Issue 3: Port Conflict

**Error Message:**
```
Bind for 0.0.0.0:9092 failed: port is already allocated
```

**Solution:**

```bash
# Check which process is using the port
sudo lsof -i :9092

# Stop other Kafka instances
./simple-kafka.sh stop

# Or modify port mapping in docker-compose-simple.yml
```

### Issue 4: Python Module Not Found

**Error Message:**
```
ModuleNotFoundError: No module named 'kafka'
```

**Solution:**

```bash
# Install kafka-python
pip3 install kafka-python --user

# Or use script to install
./simple-kafka.sh install-deps
```

### Issue 5: Cannot Connect to Kafka

**Error Message:**
```
NoBrokersAvailable: NoBrokersAvailable
```

**Solution:**

```bash
# 1. Check container status
./simple-kafka.sh status

# 2. View logs
./simple-kafka.sh logs

# 3. Restart environment
./simple-kafka.sh restart

# 4. If still not working, completely clean and restart
./simple-kafka.sh clean
./simple-kafka.sh start
```

### Issue 6: Topic Not Created

**Solution:**

```bash
# View topic information
./simple-kafka.sh topic

# If topic doesn't exist, restart environment
./simple-kafka.sh restart
```

## View Logs

### View Kafka Logs (Real-time)

```bash
./simple-kafka.sh logs
```

### View All Container Logs

```bash
sudo docker compose -f docker-compose-simple.yml logs
```

### View Specific Container Logs

```bash
# Kafka logs
sudo docker logs kafka-simple

# Zookeeper logs
sudo docker logs zookeeper-simple
```

## Advanced Usage

### Using Kafka Command Line Tools

Enter Kafka container:

```bash
sudo docker exec -it kafka-simple bash
```

Use Kafka commands inside container:

```bash
# List all topics
kafka-topics --bootstrap-server localhost:9092 --list

# View topic details
kafka-topics --bootstrap-server localhost:9092 --describe --topic simple-topic

# View consumer groups
kafka-consumer-groups --bootstrap-server localhost:9092 --list

# View consumer group details
kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group <group-id>

# Manually consume messages
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic simple-topic \
  --from-beginning

# Manually produce messages
kafka-console-producer --bootstrap-server localhost:9092 \
  --topic simple-topic
```

### Custom Topic

To create other topics:

```bash
sudo docker exec kafka-simple kafka-topics \
  --bootstrap-server localhost:9092 \
  --create \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 1
```

### Delete Topic

```bash
sudo docker exec kafka-simple kafka-topics \
  --bootstrap-server localhost:9092 \
  --delete \
  --topic simple-topic
```

### Using in Python Code

```python
from kafka import KafkaProducer, KafkaConsumer
import json

# Producer
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

producer.send('simple-topic', {'key': 'value'})
producer.close()

# Consumer
consumer = KafkaConsumer(
    'simple-topic',
    bootstrap_servers=['localhost:9092'],
    auto_offset_reset='earliest',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

for message in consumer:
    print(message.value)
```

## File List

This environment contains the following files:

- **docker-compose-simple.yml** - Docker Compose configuration file
- **simple-kafka.sh** - Unified management script
- **producer-simple.py** - Producer script
- **consumer-simple.py** - Consumer script
- **README-SIMPLE.md** - This document
- **SIMPLE_VERIFICATION.md** - Environment verification report

## Technical Specifications

| Configuration | Value |
|--------|-----|
| Kafka Version | 7.5.0 (Confluent Platform) |
| Broker Address | localhost:9092 |
| Zookeeper Address | localhost:2181 |
| Topic Name | simple-topic |
| Partitions | 5 |
| Replication Factor | 1 |
| Authentication | None |
| Schema Registry | None |
| Data Persistence | Docker Volume |

## Performance Characteristics

- **Startup Time**: ~10-15 seconds
- **Message Latency**: < 10ms (local environment)
- **Throughput**: Depends on hardware, typically > 10k msg/s

## Use Cases

✅ **Suitable for:**
- Local development and testing
- Learning Kafka basic concepts
- Quick prototype validation
- Simple message queue requirements

❌ **Not suitable for:**
- Production environments
- High availability scenarios
- Scenarios requiring authentication and encryption
- Large-scale data processing

## Differences from Other Environments

This repository contains multiple Kafka environment configurations:

| Environment | Authentication | Schema Registry | Use Case |
|------|------|-----------------|---------|
| **Simple** (This environment) | None | None | Quick development testing |
| Standard environment | Kerberos | Yes | Enterprise-level development |

## FAQ

### Q: How to persist data?

A: Data is saved in Docker Volumes by default. Unless you run `./simple-kafka.sh clean`, data will not be lost.

### Q: Can it be used in production?

A: Not recommended. This is a simplified development environment lacking security, high availability, and other features required for production.

### Q: How to change the number of partitions?

A: Edit the `kafka-init` service in `docker-compose-simple.yml`, modify the `--partitions` parameter.

### Q: Will the consumer script affect other applications?

A: No. The consumer script uses a temporary consumer group and does not commit offsets, completely independent of other applications.

### Q: How to monitor Kafka?

A: You can use Kafka command line tools or add monitoring tools like Kafka Manager, CMAK, etc.

### Q: How long is data retained?

A: Default is 7 days, can be modified when creating a topic using the `--config retention.ms` parameter.

## Getting Help

If you encounter issues:

1. Check the "Troubleshooting" section of this document
2. Run `./simple-kafka.sh logs` to view logs
3. Check `SIMPLE_VERIFICATION.md` to understand verification steps

## Version Information

- Kafka: 7.5.0 (Confluent Platform)
- Python kafka-python: 2.3.0
- Docker Compose: v2+

---

**Quick Reference:**

```bash
# Complete workflow
./simple-kafka.sh start      # 1. Start environment
./simple-kafka.sh produce    # 2. Send messages
./simple-kafka.sh consume    # 3. View messages
./simple-kafka.sh topic      # 4. View topic information
./simple-kafka.sh stop       # 5. Stop environment
```

Happy using!
