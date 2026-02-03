# Kafka Kerberos Environment Quick Verification Guide

## Environment Verification Successful!

Your Kafka Kerberos environment has been successfully deployed and verified. Here is a summary of the verification results:

### ✓ Verified Functionality

1. **KDC Service** - Kerberos authentication server running normally
2. **Principal Creation** - All required Kerberos principals created
3. **Keytab Generation** - All keytab files successfully generated
4. **Zookeeper Authentication** - Zookeeper successfully using Kerberos authentication
5. **Kafka Broker Authentication** - Kafka broker successfully using Kerberos authentication
6. **Topic Creation** - test-topic successfully created
7. **Producer Authentication** - Producer successfully authenticated via Kerberos and sent messages
8. **Consumer Authentication** - Consumer successfully authenticated via Kerberos and received messages

## Quick Start Testing

### 1. Send Test Messages

Use shell script to send messages:

```bash
./producer.sh
```

Then enter messages and press Enter. Press Ctrl+C to exit.

### 2. Receive Test Messages

Use shell script to receive messages:

```bash
./consumer.sh
```

Will display all received messages. Press Ctrl+C to exit.

### 3. Quick Test (One-line Command)

Send single message and verify receipt:

```bash
echo "Hello Kerberos Kafka!" | docker exec -i kafka kafka-console-producer \
  --broker-list kafka.example.com:9092 \
  --topic test-topic \
  --producer.config /etc/kafka/secrets/producer.properties 2>/dev/null && \
  echo "Message sent!" && sleep 2 && \
  timeout 5 docker exec kafka kafka-console-consumer \
  --bootstrap-server kafka.example.com:9092 \
  --topic test-topic \
  --from-beginning \
  --max-messages 1 \
  --consumer.config /etc/kafka/secrets/consumer.properties 2>/dev/null
```

## Kerberos Authentication Information

### Realm Information
- **Realm**: EXAMPLE.COM
- **KDC**: kdc.example.com:88
- **Admin Server**: kdc.example.com:749

### Principals and Credentials

| Principal | Password | Keytab File | Purpose |
|-----------|------|-------------|------|
| kafka/kafka.example.com@EXAMPLE.COM | N/A | keytabs/kafka.keytab | Kafka Broker |
| zookeeper/zookeeper.example.com@EXAMPLE.COM | N/A | keytabs/zookeeper.keytab | Zookeeper |
| producer@EXAMPLE.COM | producer123 | keytabs/producer.keytab | Producer Client |
| consumer@EXAMPLE.COM | consumer123 | keytabs/consumer.keytab | Consumer Client |
| admin@EXAMPLE.COM | admin123 | keytabs/admin.keytab | Administrator |

### Kafka Connection Information
- **Broker Address**: kafka.example.com:9092
- **Security Protocol**: SASL_PLAINTEXT
- **SASL Mechanism**: GSSAPI (Kerberos)
- **Service Name**: kafka
- **Test Topic**: test-topic

## Common Management Commands

### View All Principals

```bash
docker exec kdc kadmin.local -q "listprincs"
```

### Verify Keytab

```bash
# View producer keytab
docker exec kdc klist -kt /keytabs/producer.keytab

# View consumer keytab
docker exec kdc klist -kt /keytabs/consumer.keytab
```

### View Kafka Topics

```bash
docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null
```

### View Topic Details

```bash
docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic test-topic \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null
```

### Create New Topic

```bash
docker exec kafka kafka-topics --create \
  --bootstrap-server kafka.example.com:9092 \
  --topic my-new-topic \
  --partitions 1 \
  --replication-factor 1 \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null
```

## Using Python Scripts

### Install Dependencies

```bash
pip install kafka-python gssapi
```

**Note**: On some systems you may need to install system-level Kerberos libraries:

```bash
# Ubuntu/Debian
sudo apt-get install libkrb5-dev python3-gssapi

# CentOS/RHEL
sudo yum install krb5-devel python3-gssapi
```

### Run Python Producer

```bash
chmod +x producer.py
./producer.py
```

### Run Python Consumer

```bash
chmod +x consumer.py
./consumer.py
```

## Container Management

### View Container Status

```bash
docker compose ps
```

### View Container Logs

```bash
# View KDC logs
docker logs kdc

# View Zookeeper logs
docker logs zookeeper

# View Kafka logs
docker logs kafka

# Follow Kafka logs in real-time
docker logs -f kafka
```

### Stop Environment

```bash
./stop.sh
```

### Restart Environment

```bash
./stop.sh
./start.sh
```

## Verification Script

Run complete environment verification:

```bash
./verify.sh
```

This will check:
- Container status
- Hosts configuration
- Keytab files
- Kerberos principals
- Kafka broker connection
- Topics list
- Message production and consumption

## Troubleshooting

### Issue 1: Container Fails to Start

Check port usage:
```bash
sudo netstat -tlnp | grep -E '88|749|2181|9092'
```

Stop conflicting services, or modify port mapping in docker-compose.yml.

### Issue 2: Kerberos Authentication Failure

1. Verify hosts file:
```bash
cat /etc/hosts | grep example.com
```

2. Check keytab files:
```bash
ls -lh keytabs/
docker exec kdc klist -kt /keytabs/kafka.keytab
```

3. View detailed logs:
```bash
docker logs kafka | grep -i kerberos
docker logs zookeeper | grep -i kerberos
```

### Issue 3: Network Connection Issues

Test network connectivity:
```bash
ping kdc.example.com
ping kafka.example.com
telnet kafka.example.com 9092
```

### Issue 4: Python Script Errors

Ensure all dependencies are installed:
```bash
pip list | grep -E "kafka|gssapi"
```

Check Kerberos configuration:
```bash
cat kerberos/krb5.conf
```

## Production Environment Recommendations

If using in production, consider the following recommendations:

1. **Use SSL/TLS**: Change SASL_PLAINTEXT to SASL_SSL
2. **Change Default Passwords**: Modify default passwords for all principals
3. **Use Stronger Encryption**: Configure stronger encryption algorithms
4. **Configure ACLs**: Set appropriate access control lists
5. **Regular Keytab Rotation**: Regularly update keytab files
6. **Monitoring and Alerting**: Set up monitoring and alerting systems
7. **Backup Configuration**: Regularly backup Kerberos database and configuration

## Next Steps

Now you have a fully working Kerberos + Kafka environment, you can:

1. Develop and test your Kafka applications
2. Verify Kerberos authentication flows
3. Learn Kafka security features
4. Integrate into your existing systems

## Reference Materials

- [Apache Kafka Security Documentation](https://kafka.apache.org/documentation/#security)
- [Kafka SASL/GSSAPI (Kerberos)](https://kafka.apache.org/documentation/#security_sasl_kerberos)
- [MIT Kerberos Documentation](https://web.mit.edu/kerberos/)
- [Confluent Platform Security](https://docs.confluent.io/platform/current/security/index.html)

---

**Environment is ready! Start using Kafka with Kerberos authentication!**
