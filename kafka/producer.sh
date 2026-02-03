#!/bin/bash
# Kafka Producer using console producer with Kerberos

export KAFKA_OPTS="-Djava.security.auth.login.config=$(pwd)/kafka-config/producer_jaas.conf -Djava.security.krb5.conf=$(pwd)/kerberos/krb5.conf"

echo "=== Kafka Console Producer with Kerberos ==="
echo "Type messages and press Enter to send"
echo "Press Ctrl+C to exit"
echo ""

docker exec -it kafka kafka-console-producer \
  --broker-list kafka.example.com:9092 \
  --topic test-topic \
  --producer.config /etc/kafka/secrets/producer.properties
