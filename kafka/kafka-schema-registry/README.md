# Kafka Schema Registry

A standalone Kafka environment with Schema Registry and BASIC authentication for Avro message serialization. This directory contains everything needed to run a complete Kafka cluster with Schema Registry independently.

## Features

- **Kafka Broker** - No authentication, ready for local development
- **Schema Registry** - BASIC authentication enabled
- **Avro Serialization** - Full support for Avro message format
- **Pre-configured Topics** - Ready-to-use topics for users and orders
- **Python Scripts** - Producer, consumer, and schema registration tools

## Quick Start

```bash
# Install dependencies
./manage.sh install-deps

# Start environment
./manage.sh start

# Register Avro schemas
./manage.sh register-schemas

# Send test messages
./manage.sh produce

# View messages
./manage.sh consume

# Stop environment
./manage.sh stop
```

## Directory Structure

```
kafka-schema-registry/
├── README.md                 # This file
├── docker-compose.yml        # Docker Compose config
├── manage.sh                 # Management script
├── register_schemas.py       # Schema registration script
├── producer.py               # Avro producer
├── consumer.py               # Avro consumer
├── config/
│   ├── password.properties   # BASIC auth users
│   └── jaas.conf            # JAAS configuration
└── schemas/
    ├── user.avsc            # User Avro schema
    └── order.avsc           # Order Avro schema
```

## Management Commands

| Command | Description |
|---------|-------------|
| `start` | Start environment |
| `stop` | Stop environment |
| `restart` | Restart environment |
| `clean` | Clean up environment and data |
| `status` | View container status |
| `logs [service]` | View logs (kafka-sr, schema-registry, zookeeper-sr) |
| `topics` | View topic information |
| `register-schemas` | Register Avro schemas to Schema Registry |
| `produce` | Run Avro producer |
| `consume` | Run Avro consumer |
| `test-sr` | Test Schema Registry authentication |
| `install-deps` | Install Python dependencies |
| `help` | Show help message |

## Environment Details

**Services:**
- Kafka Broker: localhost:9092 (no authentication)
- Schema Registry: http://localhost:8081 (BASIC authentication)
- Zookeeper: localhost:2181

**Schema Registry Credentials:**
| Username | Password | Role | Access Level |
|----------|----------|------|-------------|
| admin | admin123 | admin | Full access |
| developer | dev123 | developer | Read/write schemas |
| schemauser | schema123 | user | Read-only access |

**Pre-configured Topics:**
- `users-avro` - 3 partitions
- `orders-avro` - 5 partitions

## Avro Schemas

### User Schema
- **Subject**: users-avro-value
- **Fields**: id, username, email, age, created_at, is_active, metadata

### Order Schema
- **Subject**: orders-avro-value
- **Fields**: order_id, user_id, product_name, quantity, price, total_amount, status, order_date

## Typical Workflow

### 1. Start Environment
```bash
./manage.sh start
```

### 2. Register Schemas
```bash
./manage.sh register-schemas
```

This registers the Avro schemas from `schemas/` directory to Schema Registry:
- users-avro-value
- orders-avro-value

### 3. Produce Messages
```bash
./manage.sh produce
```

Sends 10 user messages and 20 order messages using Avro serialization.

### 4. Consume Messages
```bash
./manage.sh consume
```

Choose which topic to consume:
1. users-avro
2. orders-avro
3. both (sequential)

### 5. View Topics
```bash
./manage.sh topics
```

## Python Scripts

### register_schemas.py
Registers Avro schemas to Schema Registry with BASIC authentication.

```python
# Credentials configured in script
SCHEMA_REGISTRY_USER = "admin"
SCHEMA_REGISTRY_PASSWORD = "admin123"
```

### producer.py
Produces Avro-serialized messages to Kafka topics.
- Connects to Schema Registry with BASIC auth
- Serializes messages using AvroSerializer
- Produces to users-avro and orders-avro topics

### consumer.py
Consumes Avro-serialized messages from Kafka topics.
- Connects to Schema Registry with BASIC auth
- Deserializes messages using AvroDeserializer
- Interactive topic selection

## Requirements

- Docker and Docker Compose
- Python 3.x
- confluent-kafka library
- requests library

Install Python dependencies:
```bash
pip3 install confluent-kafka requests
```

Or use:
```bash
./manage.sh install-deps
```

## Testing Schema Registry Authentication

Test BASIC authentication:
```bash
./manage.sh test-sr
```

Or manually:
```bash
# Without auth (should fail with 401)
curl http://localhost:8081/subjects

# With auth (should succeed)
curl -u admin:admin123 http://localhost:8081/subjects
```

## Troubleshooting

### Port conflicts
Check if ports are in use:
```bash
sudo lsof -i :9092
sudo lsof -i :8081
sudo lsof -i :2181
```

### View logs
```bash
# Kafka logs
./manage.sh logs kafka-sr

# Schema Registry logs
./manage.sh logs schema-registry

# Zookeeper logs
./manage.sh logs zookeeper-sr
```

### Clean restart
```bash
./manage.sh clean && ./manage.sh start
```

### Schema registration fails
1. Ensure Schema Registry is running: `./manage.sh status`
2. Check Schema Registry logs: `./manage.sh logs schema-registry`
3. Verify credentials in `register_schemas.py`
4. Test authentication: `./manage.sh test-sr`

### Producer/Consumer fails
1. Ensure schemas are registered: `./manage.sh register-schemas`
2. Check if topics exist: `./manage.sh topics`
3. Verify Kafka is running: `./manage.sh status`
4. Check credentials in producer.py and consumer.py

## Customization

### Add New Schema
1. Create `.avsc` file in `schemas/` directory
2. Update `register_schemas.py` to register the new schema
3. Update producer/consumer scripts as needed

### Change Credentials
1. Update `config/password.properties`
2. Restart environment: `./manage.sh restart`
3. Update credentials in Python scripts

### Modify Topics
Edit `docker-compose.yml` kafka-init service to add/modify topics.

## Security Notes

1. **Development Only**: This setup is for development/testing
2. **Change Passwords**: Use strong passwords in production
3. **Use HTTPS**: Enable HTTPS for Schema Registry in production
4. **Kafka Auth**: Consider adding authentication to Kafka in production
5. **Network**: Restrict network access in production environments

## Clean Up

Remove all containers and data:
```bash
./manage.sh clean
```

Remove containers but keep data:
```bash
./manage.sh stop
```
