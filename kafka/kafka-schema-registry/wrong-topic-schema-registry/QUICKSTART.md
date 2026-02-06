## Wrong Topic Schema Registry Special Scenario Quick Start Guide

### Scenario Description

This directory demonstrates a special test scenario:
- **Kafka Topic Name**: `NRDP.topic1`
- **Schema Registry Subject**: `topic1-value`
- Topic name and Schema Subject name **do not match**

### Quick Start

```bash
cd wrong-topic-schema-registry

# Method 1: One-click setup + interactive demo
./demo.sh

# Method 2: Use management script
./manage.sh setup     # Setup environment
./manage.sh produce   # Produce messages
./manage.sh consume   # Consume messages
```

### Main Features

1. **Topic Creation**: Create Kafka topic named `NRDP.topic1`
2. **Schema Registration**: Register in Schema Registry as `topic1-value` (name mismatch)
3. **Producer**: Produce messages to topic using Avro format
4. **Consumer**: Consume messages but **does not change offset** (repeatable consumption)

### Available Commands

```bash
./manage.sh setup        # Complete setup
./manage.sh produce      # Produce messages
./manage.sh consume      # Consume messages
./manage.sh status       # View status
./manage.sh cleanup      # Clean up environment
```

For detailed documentation, see `wrong-topic-schema-registry/README.md`
