#!/bin/bash
# Kafka Consumer using console consumer with Kerberos

export KAFKA_OPTS="-Djava.security.auth.login.config=$(pwd)/kafka-config/consumer_jaas.conf -Djava.security.krb5.conf=$(pwd)/kerberos/krb5.conf"

echo "=== Kafka Console Consumer with Kerberos ==="
echo "Waiting for messages... (Press Ctrl+C to stop)"
echo ""

docker exec -it kafka kafka-console-consumer \
  --bootstrap-server kafka.example.com:9092 \
  --topic test-topic \
  --from-beginning \
  --consumer.config /etc/kafka/secrets/consumer.properties
