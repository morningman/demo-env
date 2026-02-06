# Usage Examples

## Complete Workflow Example

### Step 1: Verify Environment

```bash
cd wrong-topic-schema-registry
./verify.sh
```

Expected output:
```
=== Environment Verification ===

1. Checking Docker...
   ✓ Docker is installed

2. Checking Kafka container...
   ✓ Kafka container is running

3. Checking Schema Registry container...
   ✓ Schema Registry container is running

...

=================================
✓ Environment verification passed!
=================================
```

### Step 2: Setup Environment

```bash
./manage.sh setup
```

This will:
- Create Kafka topic `NRDP.topic1` (3 partitions, 1 replica)
- Register schema subject `topic1-value` in Schema Registry

### Step 3: View Status

```bash
./manage.sh status
```

Expected output:
```
=== Environment Status ===

1. Kafka Topics:
  ✓ NRDP.topic1 exists
  PartitionCount: 3  ReplicationFactor: 1

2. Schema Registry Subjects:
  ✓ topic1-value exists
  Schema ID: 1
  Version: 1

3. Topic Message Count:
  Total messages: 0
```

### Step 4: Produce Messages

```bash
./manage.sh produce
```

Expected output:
```
=== Kafka Avro Producer - Special Scenario ===
Kafka: localhost:9092
Schema Registry: http://localhost:8081

⚠ Special scenario description:
  - Kafka Topic: NRDP.topic1
  - Schema Subject: topic1-value
  - Name mismatch scenario test

Getting schema from Schema Registry...
✓ Schema retrieved successfully (ID: 1, Version: 1)

=== Producing 10 messages ===
Topic: NRDP.topic1
Schema Subject: topic1-value

✓ Message delivered to NRDP.topic1 [partition 0] offset 0
✓ Message delivered to NRDP.topic1 [partition 1] offset 0
✓ Message delivered to NRDP.topic1 [partition 2] offset 0
...
```

### Step 5: Consume Messages

```bash
./manage.sh consume
```

Choose option 2 (consume first 10 messages), expected output:
```
=== Kafka Avro Consumer - Special Scenario ===
Kafka: localhost:9092
Schema Registry: http://localhost:8081

⚠ Special scenario description:
  - Kafka Topic: NRDP.topic1
  - Schema Subject: topic1-value
  - Name mismatch scenario test
  - Does not commit offset when consuming (repeatable consumption)

Getting schema from Schema Registry...
✓ Schema retrieved successfully (ID: 1, Version: 1)

=== Consuming messages from topic: NRDP.topic1 ===
Schema Subject: topic1-value
⚠ Note: enable.auto.commit=False, offset will not change

--- Message 1 ---
Key: 1
Topic: NRDP.topic1
Partition: 0
Offset: 0
Value:
{
  "id": 1,
  "message": "This is message 1 - testing special scenario",
  "timestamp": 1738872000000,
  "status": "PENDING",
  "metadata": {
    "source": "wrong-topic-producer",
    "version": "1.0",
    "scenario": "topic-schema-mismatch"
  }
}
...
```

### Step 6: Verify Repeated Consumption

Run consumer again:
```bash
./manage.sh consume
```

You will find messages can be read again because offset was not committed.

### Step 7: Clean Up Environment

```bash
./manage.sh cleanup
```

This will delete:
- Kafka topic `NRDP.topic1`
- Schema Registry subject `topic1-value`

## Common Operations

### Create topic only

```bash
./manage.sh create-topic
```

### Register schema only

```bash
./manage.sh register
```

### Manually run producer

```bash
./producer.py
```

### Manually run consumer

```bash
./consumer.py
```

## One-Click Demo

If you want to quickly experience the entire workflow:

```bash
./demo.sh
```

This will automatically execute all steps and pause between each step waiting for you to press Enter to continue.

## Verify Schema Mismatch

Use kafka-console-consumer to try reading messages (without using Schema Registry):

```bash
docker exec -it kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic NRDP.topic1 \
  --from-beginning \
  --max-messages 1
```

You will see binary data because messages are encoded with Avro.

## View Schema in Schema Registry

```bash
curl -u admin:admin123 http://localhost:8081/subjects/topic1-value/versions/latest | python3 -m json.tool
```

## List All Topics

```bash
docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092 | grep NRDP
```

## View Topic Details

```bash
docker exec kafka kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic NRDP.topic1
```
