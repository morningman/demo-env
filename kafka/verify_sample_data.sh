#!/bin/bash
# Quick verification script to check if sample data was inserted

echo "=== Verifying Sample Data ==="
echo ""

echo "Checking test-topic..."
echo "Running: kafka-console-consumer (will timeout after 5 seconds)"
echo ""

# Create a temporary consumer properties file with debug disabled
cat > /tmp/consumer_no_debug.properties << EOF
security.protocol=SASL_PLAINTEXT
sasl.mechanism=GSSAPI
sasl.kerberos.service.name=kafka
sasl.jaas.config=com.sun.security.auth.module.Krb5LoginModule required useKeyTab=true storeKey=true keyTab="/etc/kafka/secrets/keytabs/consumer.keytab" principal="consumer@EXAMPLE.COM";
EOF

# Copy to container
sudo docker cp /tmp/consumer_no_debug.properties kafka:/tmp/consumer_no_debug.properties

# Consume messages with timeout
echo "Sample messages from test-topic:"
echo "-----------------------------------"
timeout 5 sudo docker exec -e KAFKA_OPTS="" kafka kafka-console-consumer \
  --bootstrap-server kafka.example.com:9092 \
  --topic test-topic \
  --from-beginning \
  --max-messages 10 \
  --consumer.config /tmp/consumer_no_debug.properties 2>/dev/null || true

echo ""
echo "-----------------------------------"
echo ""
echo "✓ Verification complete"
echo ""
echo "Note: If you see messages above, sample data was successfully inserted!"
echo "      Use ./consumer.sh to interactively consume messages."
