# Wrong Topic Schema Registry - Special Scenario

This directory contains a special test scenario that demonstrates a case where Kafka Topic name and Schema Registry Subject name do not match.

## Scenario Description

In this special scenario:

- **Kafka Topic Name**: `NRDP.topic1`
- **Schema Registry Subject Name**: `topic1-value`

Normally, Schema Registry subject naming convention is `<topic-name>-value` or `<topic-name>-key`. But in this scenario, we deliberately created a mismatch where the topic name contains the `NRDP.` prefix, but the schema subject does not have this prefix.

## Directory Structure

```
wrong-topic-schema-registry/
├── schemas/
│   └── topic1.avsc          # Avro schema definition
├── create_topic.sh          # Create Kafka topic script
├── register_schema.py       # Register schema to Schema Registry
├── producer.py              # Produce messages script
├── consumer.py              # Consume messages script (does not change offset)
├── manage.sh                # Main management script
└── README.md                # This file
```

## Quick Start

### 1. Complete Setup (Recommended)

Use the management script for one-click environment setup:

```bash
cd wrong-topic-schema-registry
chmod +x manage.sh
./manage.sh setup
```

This will automatically:
- Create Kafka topic `NRDP.topic1`
- Register schema subject `topic1-value` in Schema Registry

### 2. Produce Messages

```bash
./manage.sh produce
```

This will produce 10 Avro-formatted messages to the `NRDP.topic1` topic.

### 3. Consume Messages

```bash
./manage.sh consume
```

Consumer features:
- Reads messages from topic `NRDP.topic1`
- Uses Schema Registry's `topic1-value` subject for deserialization
- **Does not commit offset** (`enable.auto.commit=False`), consumes from beginning each time

## Manual Steps

If you want to execute step by step, you can use the following commands:

### 1. Create Topic

```bash
./manage.sh create-topic
```

Or run directly:

```bash
chmod +x create_topic.sh
./create_topic.sh
```

### 2. Register Schema

```bash
./manage.sh register
```

Or run directly:

```bash
chmod +x register_schema.py
./register_schema.py
```

### 3. Run Producer

```bash
chmod +x producer.py
./producer.py
```

### 4. Run Consumer

```bash
chmod +x consumer.py
./consumer.py
```

## Management Commands

`manage.sh` provides the following commands:

| Command | Description |
|---------|-------------|
| `setup` | Complete setup (create topic + register schema) |
| `create-topic` | Create Kafka topic only |
| `register` | Register schema only |
| `produce` | Run producer to produce messages |
| `consume` | Run consumer to consume messages |
| `status` | View current status |
| `cleanup` | Clean up topic and schema |
| `help` | Display help information |

### View Status

```bash
./manage.sh status
```

### Clean Up Environment

```bash
./manage.sh cleanup
```

This will delete:
- Kafka topic `NRDP.topic1`
- Schema Registry subject `topic1-value`

## Schema Definition

Schema is defined in `schemas/topic1.avsc`:

```json
{
  "type": "record",
  "name": "Topic1Data",
  "namespace": "com.nrdp.avro",
  "fields": [
    {"name": "id", "type": "long"},
    {"name": "message", "type": "string"},
    {"name": "timestamp", "type": "long"},
    {"name": "status", "type": {"type": "enum", "name": "Status", "symbols": ["ACTIVE", "INACTIVE", "PENDING"]}},
    {"name": "metadata", "type": {"type": "map", "values": "string"}}
  ]
}
```

## Technical Details

### Producer

- Produces messages to topic `NRDP.topic1`
- Gets schema from Schema Registry subject `topic1-value`
- Serializes messages using Avro
- Uses message ID as key

### Consumer

- Consumes messages from topic `NRDP.topic1`
- Gets schema from Schema Registry subject `topic1-value`
- Deserializes messages using Avro
- **Key feature**: `enable.auto.commit=False`, does not commit offset
- Consumes from beginning each time (`auto.offset.reset=earliest`)

### Why Doesn't Consumer Change Offset?

Consumer is configured with:

```python
consumer_config = {
    'enable.auto.commit': False,  # Do not auto-commit offset
    'auto.offset.reset': 'earliest',  # Start from earliest message
}
```

This allows:
- Running consumer multiple times to view the same messages
- Testing and debugging without affecting message data
- Simulating read-only query scenarios

## Notes

1. **Name Mismatch**: This is a special scenario, normally you should keep topic name and schema subject name consistent
2. **Schema Registry Authentication**: Uses BASIC authentication (admin/admin123)
3. **Kafka No Authentication**: Kafka broker does not require authentication
4. **Repeated Consumption**: Consumer will re-read all messages each time

## Prerequisites

- Docker environment is running
- Kafka and Schema Registry containers are running
- Python 3 is installed
- Dependencies installed: `confluent-kafka` and `requests`

## Troubleshooting

### Connection Failed

If you encounter connection issues, check:
1. Whether Docker containers are running: `docker ps`
2. Whether Kafka port 9092 is accessible
3. Whether Schema Registry port 8081 is accessible

### Schema Not Found

If producer/consumer reports schema not found:
```bash
./manage.sh register
```

### Topic Does Not Exist

If reporting topic does not exist:
```bash
./manage.sh create-topic
```

### Clean Up and Start Over

```bash
./manage.sh cleanup
./manage.sh setup
```
