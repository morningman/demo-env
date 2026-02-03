# Kafka with Kerberos + Schema Registry + Avro - Docker Environment

A complete Kafka + Kerberos authentication + Schema Registry + Avro Docker single-node environment for quickly validating enterprise-grade Kafka capabilities.

## Architecture Components

| Component | Hostname | Ports | IP | Description |
|------|--------|------|----|----|
| **KDC** | kdc.example.com | 88, 749 | 172.25.0.10 | Kerberos Authentication Center |
| **Zookeeper** | zookeeper.example.com | 2181 | 172.25.0.20 | Kafka Coordination Service |
| **Kafka Broker** | kafka.example.com | 9092 | 172.25.0.30 | Kafka Message Broker |
| **Schema Registry** | schema-registry.example.com | 8081 | 172.25.0.40 | Schema Registry Center |

## Features

- ✅ **Kerberos (GSSAPI) Authentication**: Enterprise-grade security authentication
- ✅ **Schema Registry**: Centralized Schema management with BASIC_AUTH authentication support
- ✅ **Avro Serialization**: Efficient binary serialization format
- ✅ **Multi-partition Topics**: Support for horizontal scaling and parallel processing
- ✅ **Complete Example Code**: Shell and Python producers/consumers

## Quick Start

### 1. Start Environment

```bash
./start.sh
```

The startup script will automatically complete the following operations:
1. Add host entries to /etc/hosts
2. Start Docker containers (KDC, Zookeeper, Kafka, Schema Registry)
3. Initialize Kerberos principals and keytabs
4. Create test topic (test-topic)
5. Create Avro topics (users-avro, orders-avro) with multiple partitions
6. Register Avro schemas to Schema Registry

### 2. Verify Environment

```bash
# Check all container status
docker compose ps

# Verify Avro environment
./verify_avro.sh

# List all topics
docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties
```

### 3. Stop Environment

```bash
./stop.sh
```

---

## Kerberos Authentication Configuration

### Realm Information
- **Realm**: EXAMPLE.COM
- **KDC Server**: kdc.example.com
- **Admin Server**: kdc.example.com

### Principals and Passwords

| Principal | Password | Keytab File | Purpose |
|-----------|------|-------------|------|
| `kafka/kafka.example.com@EXAMPLE.COM` | (keytab only) | `keytabs/kafka.keytab` | Kafka Broker |
| `zookeeper/zookeeper.example.com@EXAMPLE.COM` | (keytab only) | `keytabs/zookeeper.keytab` | Zookeeper |
| `producer@EXAMPLE.COM` | producer123 | `keytabs/producer.keytab` | Producer Client |
| `consumer@EXAMPLE.COM` | consumer123 | `keytabs/consumer.keytab` | Consumer Client |
| `admin@EXAMPLE.COM` | admin123 | `keytabs/admin.keytab` | Administrator |

### Test Kerberos Authentication

```bash
# Get ticket using keytab
docker exec -it kafka kinit -kt /etc/kafka/secrets/keytabs/producer.keytab producer@EXAMPLE.COM

# View ticket
docker exec -it kafka klist

# Authenticate with password
docker exec -it kafka kinit producer@EXAMPLE.COM
# Enter password: producer123
```

---

## Schema Registry

### Configuration Information

- **URL**: `http://schema-registry.example.com:8081`
- **Authentication Method**: BASIC Authentication
- **Supported Roles**: admin, developer, user

### User Accounts

| Username | Password | Role | Description |
|--------|------|------|------|
| admin | admin123 | admin | Full access privileges |
| developer | dev123 | developer | Developer privileges |
| schemauser | schema123 | user | Regular user privileges |

### Register Schemas

#### Automatic Registration (Recommended)

```bash
# Use Python script for automatic registration
python3 register_schemas.py
```

#### Manual Registration

```bash
# Register User schema
curl -u admin:admin123 -X POST \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data '{"schema":"{\"type\":\"record\",\"name\":\"User\",\"namespace\":\"com.example.avro\",\"fields\":[{\"name\":\"id\",\"type\":\"long\"},{\"name\":\"username\",\"type\":\"string\"},{\"name\":\"email\",\"type\":\"string\"}]}"}' \
  http://schema-registry.example.com:8081/subjects/users-value/versions

# Register Order schema
curl -u admin:admin123 -X POST \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data @- \
  http://schema-registry.example.com:8081/subjects/orders-value/versions <<'EOF'
{
  "schema": "{\"type\":\"record\",\"name\":\"Order\",\"namespace\":\"com.example.avro\",\"fields\":[{\"name\":\"order_id\",\"type\":\"string\"},{\"name\":\"user_id\",\"type\":\"long\"}]}"
}
EOF
```

### Query Schemas

```bash
# List all subjects
curl -u admin:admin123 http://schema-registry.example.com:8081/subjects

# View latest version of a specific subject
curl -u admin:admin123 \
  http://schema-registry.example.com:8081/subjects/users-value/versions/latest

# Get all versions
curl -u admin:admin123 \
  http://schema-registry.example.com:8081/subjects/users-value/versions

# Get by schema ID
curl -u admin:admin123 \
  http://schema-registry.example.com:8081/schemas/ids/1
```

### Schema Registry API Endpoints

| Endpoint | Method | Description |
|------|------|------|
| `/subjects` | GET | List all subjects |
| `/subjects/{subject}/versions` | GET | Get all versions of a subject |
| `/subjects/{subject}/versions/latest` | GET | Get latest version |
| `/subjects/{subject}/versions/{version}` | GET | Get specific version |
| `/subjects/{subject}/versions` | POST | Register new schema |
| `/schemas/ids/{id}` | GET | Get schema by ID |
| `/subjects/{subject}` | DELETE | Delete subject |

---

## Avro Topics and Schemas

### Topic Configuration

| Topic | Partitions | Schema Subject | Schema File | Description |
|-------|--------|----------------|-------------|------|
| **users-avro** | 3 | users-value | schemas/user.avsc | User data |
| **orders-avro** | 5 | orders-value | schemas/order.avsc | Order data |

### Schema Definitions

#### User Schema (schemas/user.avsc)

```json
{
  "type": "record",
  "name": "User",
  "namespace": "com.example.avro",
  "fields": [
    {"name": "id", "type": "long", "doc": "User ID"},
    {"name": "username", "type": "string", "doc": "Username"},
    {"name": "email", "type": "string", "doc": "Email address"},
    {"name": "age", "type": ["null", "int"], "default": null, "doc": "User age (optional)"},
    {"name": "created_at", "type": "long", "doc": "Creation timestamp in milliseconds"},
    {"name": "is_active", "type": "boolean", "default": true, "doc": "Whether the user is active"},
    {"name": "metadata", "type": {"type": "map", "values": "string"}, "default": {}, "doc": "Additional metadata"}
  ]
}
```

#### Order Schema (schemas/order.avsc)

```json
{
  "type": "record",
  "name": "Order",
  "namespace": "com.example.avro",
  "fields": [
    {"name": "order_id", "type": "string", "doc": "Unique order identifier"},
    {"name": "user_id", "type": "long", "doc": "User ID who placed the order"},
    {"name": "product_name", "type": "string", "doc": "Product name"},
    {"name": "quantity", "type": "int", "doc": "Quantity ordered"},
    {"name": "price", "type": "double", "doc": "Unit price"},
    {"name": "total_amount", "type": "double", "doc": "Total order amount"},
    {"name": "status", "type": {"type": "enum", "name": "OrderStatus",
                                 "symbols": ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]},
     "default": "PENDING", "doc": "Order status"},
    {"name": "order_date", "type": "long", "doc": "Order timestamp in milliseconds"}
  ]
}
```

---

## Using Avro Producer/Consumer

### Install Dependencies

```bash
pip install confluent-kafka requests avro-python3
```

### Avro Producer

```bash
python3 avro-examples/avro_producer.py
```

**Features**:
- Fetch schemas from Schema Registry
- Produce 10 user messages to `users-avro` (distributed across 3 partitions)
- Produce 20 order messages to `orders-avro` (distributed across 5 partitions)
- Connect to Kafka using Kerberos authentication
- Automatic Avro serialization

**Example Output**:
```
=== Kafka Avro Producer with Kerberos ===
Fetching schemas from Schema Registry...
✓ Schemas fetched successfully

=== Producing 10 User messages ===
✓ Message delivered to users-avro [partition 0] at offset 0
✓ Message delivered to users-avro [partition 1] at offset 0
✓ Message delivered to users-avro [partition 2] at offset 0
...
```

### Avro Consumer

```bash
python3 avro-examples/avro_consumer.py
```

**Interactive Selection**:
1. Consume users-avro
2. Consume orders-avro
3. Consume both topics sequentially

**Features**:
- Fetch schemas from Schema Registry
- Automatic Avro deserialization
- Display message details (key, partition, offset, value)
- Use Kerberos authentication

**Example Output**:
```
=== Consuming from topic: users-avro ===

--- Message 1 ---
Key: 1
Partition: 0
Offset: 0
Value: {'id': 1, 'username': 'user1', 'email': 'user1@example.com', ...}
```

---

## Traditional Testing (Non-Avro)

### Shell Script Method

**Start Producer**:
```bash
./producer.sh
```
Enter messages and press Enter to send, Ctrl+C to exit.

**Start Consumer**:
```bash
./consumer.sh
```
Display all received messages, Ctrl+C to exit.

### Python Script Method

Install dependencies:
```bash
pip install kafka-python gssapi
```

**Run Producer**:
```bash
python3 producer.py
```

**Run Consumer**:
```bash
python3 consumer.py
```

---

## Common Management Commands

### Topic Management

```bash
# List all topics
docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties

# View topic details
docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic users-avro \
  --command-config /etc/kafka/secrets/producer.properties

# Create new topic
docker exec kafka kafka-topics --create \
  --bootstrap-server kafka.example.com:9092 \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 1 \
  --command-config /etc/kafka/secrets/producer.properties
```

### Consumer Group Management

```bash
# List all consumer groups
docker exec kafka kafka-consumer-groups --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/consumer.properties

# View consumer group details
docker exec kafka kafka-consumer-groups --describe \
  --bootstrap-server kafka.example.com:9092 \
  --group avro-consumer-group \
  --command-config /etc/kafka/secrets/consumer.properties

# Reset offset to earliest
docker exec kafka kafka-consumer-groups --reset-offsets \
  --bootstrap-server kafka.example.com:9092 \
  --group avro-consumer-group \
  --topic users-avro \
  --to-earliest \
  --execute \
  --command-config /etc/kafka/secrets/consumer.properties
```

### Schema Registry Management

```bash
# Health check
curl -u admin:admin123 http://schema-registry.example.com:8081/

# List all subjects
curl -u admin:admin123 http://schema-registry.example.com:8081/subjects

# Delete subject (soft delete)
curl -u admin:admin123 -X DELETE \
  http://schema-registry.example.com:8081/subjects/users-value

# Permanent delete
curl -u admin:admin123 -X DELETE \
  "http://schema-registry.example.com:8081/subjects/users-value?permanent=true"
```

---

## Directory Structure

```
kafka/
├── docker-compose.yml              # Docker Compose configuration
├── start.sh                        # One-click startup script
├── stop.sh                         # Stop script
├── verify_avro.sh                  # Avro environment verification script
├── README.md                       # This document
│
├── kerberos/                       # Kerberos configuration
│   ├── krb5.conf                   # Kerberos client configuration
│   ├── kdc.conf                    # KDC server configuration
│   └── kadm5.acl                   # Kadmin ACL
│
├── kafka-config/                   # Kafka configuration
│   ├── kafka_server_jaas.conf      # Kafka Broker JAAS
│   ├── zookeeper_jaas.conf         # Zookeeper JAAS
│   ├── producer.properties         # Producer configuration
│   └── consumer.properties         # Consumer configuration
│
├── schema-registry/                # Schema Registry configuration
│   └── password.properties         # BASIC AUTH user configuration
│
├── schemas/                        # Avro Schema definitions
│   ├── user.avsc                   # User schema
│   └── order.avsc                  # Order schema
│
├── avro-examples/                  # Avro example code
│   ├── avro_producer.py            # Avro producer
│   └── avro_consumer.py            # Avro consumer
│
├── scripts/                        # Initialization scripts
│   └── init-kerberos.sh            # Kerberos initialization
│
├── keytabs/                        # Kerberos keytabs (auto-generated)
│   ├── kafka.keytab
│   ├── zookeeper.keytab
│   ├── producer.keytab
│   ├── consumer.keytab
│   └── admin.keytab
│
├── register_schemas.py             # Schema registration script
├── create_avro_topics.sh           # Create Avro topics
│
├── producer.sh                     # Shell Producer (traditional)
├── consumer.sh                     # Shell Consumer (traditional)
├── producer.py                     # Python Producer (traditional)
└── consumer.py                     # Python Consumer (traditional)
```

---

## Troubleshooting

### 1. Container Startup Failure

```bash
# Check port usage
sudo netstat -tlnp | grep -E '88|749|2181|9092|8081'

# View container logs
docker logs kdc
docker logs zookeeper
docker logs kafka
docker logs schema-registry

# Restart
./stop.sh
./start.sh
```

### 2. Kerberos Authentication Failure

```bash
# Check Kafka logs for Kerberos errors
docker logs kafka | grep -i kerberos

# Verify keytab file
docker exec kdc klist -kt /keytabs/producer.keytab

# Manually test authentication
docker exec -it kafka kinit -kt /etc/kafka/secrets/keytabs/producer.keytab producer@EXAMPLE.COM
docker exec -it kafka klist
```

### 3. Schema Registry Connection Issues

```bash
# Check Schema Registry status
docker logs schema-registry

# Test authentication
curl -v -u admin:admin123 http://schema-registry.example.com:8081/subjects

# Test without authentication (should return 401)
curl -v http://schema-registry.example.com:8081/subjects
```

### 4. Avro Producer/Consumer Failure

```bash
# Confirm schemas are registered
curl -u admin:admin123 http://schema-registry.example.com:8081/subjects

# Confirm topics are created
docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties

# Verify Python dependencies
pip list | grep -E "confluent-kafka|avro|requests"

# Run verification script
./verify_avro.sh
```

### 5. Network Connection Issues

```bash
# Confirm hosts entries
cat /etc/hosts | grep example.com

# Test network connectivity
ping kdc.example.com
ping kafka.example.com
ping schema-registry.example.com

# Check container network
docker network inspect kafka_kafka_net
```

---

## Security Considerations

### Production Environment Recommendations

1. **Use SSL/TLS**:
   - Change SASL_PLAINTEXT to SASL_SSL
   - Configure SSL certificates
   - Use HTTPS for Schema Registry

2. **Password Management**:
   - Change all default passwords
   - Use strong password policies
   - Regularly rotate keys and keytabs

3. **Access Control**:
   - Configure Kafka ACLs
   - Restrict Schema Registry role permissions
   - Use network isolation

4. **Keytab Security**:
   - Set appropriate file permissions (600)
   - Regularly rotate keytabs
   - Use secure storage methods

5. **Auditing and Monitoring**:
   - Enable audit logs
   - Monitor authentication failures
   - Set up alerting mechanisms

---

## Performance Optimization Recommendations

### Kafka Configuration Optimization

```properties
# Producer optimization
acks=all                          # Ensure data durability
compression.type=snappy           # Enable compression
batch.size=16384                  # Batch size
linger.ms=10                      # Batch delay

# Consumer optimization
fetch.min.bytes=1024              # Minimum fetch bytes
fetch.max.wait.ms=500             # Maximum wait time
max.partition.fetch.bytes=1048576 # Maximum fetch per partition
```

### Schema Registry Optimization

- Enable caching to reduce network calls
- Use connection pooling
- Set appropriate schema compatibility policies

### Avro Optimization

- Use efficient data types
- Design schema structure rationally
- Consider schema evolution strategies

---

## References

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Kafka Security (SASL/GSSAPI)](https://kafka.apache.org/documentation/#security_sasl_kerberos)
- [Confluent Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html)
- [Apache Avro Specification](https://avro.apache.org/docs/current/spec.html)
- [MIT Kerberos Documentation](https://web.mit.edu/kerberos/)
- [Confluent Kafka Python](https://docs.confluent.io/kafka-clients/python/current/overview.html)

---

## License

This project is for development and testing purposes only.
