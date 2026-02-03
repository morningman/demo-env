# Sample Data Documentation

## Overview

The `start.sh` script automatically inserts sample data for all topics. Due to technical limitations, automatic insertion of Avro data may fail.

## Automatically Inserted Data

### 1. test-topic (Plain Text)

Automatically inserts 10 sample messages, including:
- Simple text messages
- JSON-formatted log messages
- JSON-formatted event messages

**View Data:**
```bash
./consumer.sh
```

### 2. users-avro and orders-avro (Avro Format)

Due to the Python `confluent-kafka` library lacking GSSAPI (Kerberos) support in some environments, automatic insertion of Avro data may fail.

## Manual Avro Data Insertion

If automatic insertion fails, please use the following methods to manually insert sample data:

### Method 1: Use Provided Python Script

```bash
cd avro-examples
python3 avro_producer.py
```

This script will insert:
- 5 user records into `users-avro` topic
- 7 order records into `orders-avro` topic

**View Data:**
```bash
cd avro-examples
python3 avro_consumer.py
```

### Method 2: Use Standalone Insertion Script

We provide a standalone `insert_sample_data_avro.py` script that contains more sample data. If your environment supports GSSAPI, you can run directly:

```bash
python3 insert_sample_data_avro.py
```

**Prerequisites:**
- Install necessary Python packages: `pip3 install confluent-kafka fastavro`
- System needs to support GSSAPI (typically requires `libsasl2` and `krb5` libraries)

### Method 3: Insert from Docker Container

If the host environment doesn't support it, try running inside the Kafka container:

```bash
# Enter Kafka container
docker exec -it kafka bash

# Use kafka-avro-console-producer inside container (if available)
# Or use other Confluent-provided tools
```

## Sample Data Details

### Users Data (users-avro)

Inserts 5 user records:
- john_doe (id: 1001, age: 28, Engineering/Senior)
- jane_smith (id: 1002, age: 32, Marketing/Manager)
- bob_wilson (id: 1003, age: null, Sales/Junior)
- alice_brown (id: 1004, age: 45, HR/Director, inactive)
- charlie_davis (id: 1005, age: 26, Engineering/Junior)

### Orders Data (orders-avro)

Inserts 7 order records with different statuses:
- DELIVERED: 2 orders
- SHIPPED: 2 orders
- PROCESSING: 1 order
- PENDING: 1 order
- CANCELLED: 1 order

Products include: Laptop, Mouse, Cable, Keyboard, Monitor, Lamp, Webcam

## Troubleshooting

### Error: GSSAPI provider not found

This indicates the `confluent-kafka` library doesn't have GSSAPI support.

**Solutions:**
1. Use Method 1 (avro_producer.py), which may use a different connection method
2. Recompile `confluent-kafka` with GSSAPI support enabled
3. Use tools inside Docker container

### Error: Module not found

Install missing Python packages:
```bash
pip3 install confluent-kafka fastavro
```

### Error: Connection refused

Ensure Kafka and Schema Registry are running:
```bash
docker ps
```

Check container status and logs:
```bash
docker logs kafka
docker logs schema-registry
```

## Verify Data

### Verify test-topic

```bash
./consumer.sh
# or
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server kafka.example.com:9092 \
  --topic test-topic \
  --from-beginning \
  --max-messages 10 \
  --consumer.config /etc/kafka/secrets/consumer.properties
```

### Verify Avro topics

```bash
cd avro-examples
python3 avro_consumer.py

# Or view specific topic
# Modify TOPIC variable in avro_consumer.py to 'users-avro' or 'orders-avro'
```

### List All Topics

```bash
docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties
```

### View Topic Details

```bash
docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic users-avro \
  --command-config /etc/kafka/secrets/producer.properties
```

## Clean Data

If you need to clean all data and start over:

```bash
./stop.sh
./start.sh
```

This will delete all topics and data, and recreate a fresh environment.
