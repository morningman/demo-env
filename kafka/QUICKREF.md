# Kafka + Kerberos + Schema Registry + Avro - Quick Reference

## One-Click Startup

```bash
./start.sh
```

## Quick Verification

```bash
# Verify all services
docker compose ps

# Verify Avro environment
./verify_avro.sh
```

## Service Addresses

| Service | Address | Authentication |
|------|------|------|
| Kafka | kafka.example.com:9092 | Kerberos (GSSAPI) |
| Schema Registry | http://schema-registry.example.com:8081 | BASIC (admin/admin123) |
| Zookeeper | zookeeper.example.com:2181 | Kerberos |

## Topics

| Topic | Partitions | Schema | Purpose |
|-------|--------|--------|------|
| test-topic | 1 | None | Traditional testing |
| users-avro | 3 | schemas/user.avsc | Avro user data |
| orders-avro | 5 | schemas/order.avsc | Avro order data |

## Authentication Credentials

### Kerberos Principals
- producer@EXAMPLE.COM (password: producer123)
- consumer@EXAMPLE.COM (password: consumer123)
- admin@EXAMPLE.COM (password: admin123)

### Schema Registry Users
- admin / admin123 (admin role)
- developer / dev123 (developer role)
- schemauser / schema123 (user role)

## Quick Testing

### Traditional Method (Non-Avro)
```bash
# Shell scripts
./producer.sh    # Produce messages
./consumer.sh    # Consume messages

# Python scripts
python3 producer.py
python3 consumer.py
```

### Avro Method
```bash
# Produce Avro messages
python3 avro-examples/avro_producer.py

# Consume Avro messages
python3 avro-examples/avro_consumer.py
```

## Common Commands

### List Topics
```bash
docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties
```

### List Schemas
```bash
curl -u admin:admin123 http://schema-registry.example.com:8081/subjects
```

### List Consumer Groups
```bash
docker exec kafka kafka-consumer-groups --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/consumer.properties
```

## Troubleshooting

```bash
# View logs
docker logs kafka
docker logs schema-registry

# Test Kerberos
docker exec -it kafka kinit -kt /etc/kafka/secrets/keytabs/producer.keytab producer@EXAMPLE.COM
docker exec -it kafka klist

# Test Schema Registry
curl -v -u admin:admin123 http://schema-registry.example.com:8081/
```

## Clean Environment

```bash
./stop.sh
docker compose down -v
rm -rf keytabs/*
```
