#!/bin/bash
# Verify that Kafka Kerberos environment is working properly

echo "=== Kafka Kerberos Environment Verification ==="
echo ""

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}!${NC} $1"
}

# 1. Check container status
echo "1. Checking container status..."
if docker ps | grep -q kdc && docker ps | grep -q zookeeper && docker ps | grep -q kafka; then
    check_pass "All containers are running"
    docker compose ps
else
    check_fail "Some containers are not running"
    docker compose ps
    exit 1
fi
echo ""

# 2. Check /etc/hosts configuration
echo "2. Checking /etc/hosts configuration..."
if grep -q "kdc.example.com" /etc/hosts && grep -q "kafka.example.com" /etc/hosts; then
    check_pass "Hosts entries configured"
else
    check_warn "Hosts entries may be missing"
fi
echo ""

# 3. Check keytab files
echo "3. Checking keytab files..."
if [ -d "keytabs" ]; then
    keytab_count=$(ls keytabs/*.keytab 2>/dev/null | wc -l)
    if [ $keytab_count -ge 5 ]; then
        check_pass "Found $keytab_count keytab files"
        ls -lh keytabs/
    else
        check_fail "Expected 5 keytab files, found $keytab_count"
    fi
else
    check_fail "Keytabs directory not found"
fi
echo ""

# 4. Verify Kerberos principals
echo "4. Verifying Kerberos principals..."
echo "Listing all principals in realm EXAMPLE.COM:"
docker exec kdc kadmin.local -q "listprincs" 2>/dev/null | grep -E "kafka|zookeeper|producer|consumer|admin"
if [ $? -eq 0 ]; then
    check_pass "Principals created successfully"
else
    check_fail "Failed to list principals"
fi
echo ""

# 5. Verify keytab validity
echo "5. Verifying keytab validity..."
echo "Checking producer keytab:"
docker exec kdc klist -kt /keytabs/producer.keytab 2>/dev/null
if [ $? -eq 0 ]; then
    check_pass "Producer keytab is valid"
else
    check_fail "Producer keytab verification failed"
fi
echo ""

# 6. Check Kafka broker connectivity
echo "6. Checking Kafka broker connectivity..."
docker exec kafka kafka-broker-api-versions --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties &>/dev/null
if [ $? -eq 0 ]; then
    check_pass "Successfully connected to Kafka broker with Kerberos"
else
    check_fail "Failed to connect to Kafka broker"
fi
echo ""

# 7. List topics
echo "7. Listing Kafka topics..."
topics=$(docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null)
if [ $? -eq 0 ]; then
    check_pass "Topics retrieved successfully:"
    echo "$topics"
else
    check_fail "Failed to list topics"
fi
echo ""

# 8. Check test-topic details
echo "8. Checking test-topic details..."
docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic test-topic \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null
if [ $? -eq 0 ]; then
    check_pass "test-topic exists and is accessible"
else
    check_warn "test-topic may not exist or is not accessible"
fi
echo ""

# 9. Test message production and consumption
echo "9. Testing message production and consumption..."
test_message="Test message at $(date +%s)"

# Send test message
echo "$test_message" | docker exec -i kafka kafka-console-producer \
  --broker-list kafka.example.com:9092 \
  --topic test-topic \
  --producer.config /etc/kafka/secrets/producer.properties 2>/dev/null

if [ $? -eq 0 ]; then
    check_pass "Successfully produced test message"

    # Wait for message to be written
    sleep 2

    # Try to consume message
    received=$(timeout 5 docker exec kafka kafka-console-consumer \
      --bootstrap-server kafka.example.com:9092 \
      --topic test-topic \
      --from-beginning \
      --max-messages 1 \
      --consumer.config /etc/kafka/secrets/consumer.properties 2>/dev/null | tail -1)

    if [ ! -z "$received" ]; then
        check_pass "Successfully consumed message: $received"
    else
        check_warn "Could not verify message consumption (may need manual check)"
    fi
else
    check_fail "Failed to produce test message"
fi
echo ""

# 10. Summary
echo "==================================="
echo "Verification Summary:"
echo "==================================="
echo ""
echo "If all checks passed, your Kafka Kerberos environment is ready!"
echo ""
echo "Next steps:"
echo "  - Run ./producer.sh to send messages"
echo "  - Run ./consumer.sh to receive messages"
echo "  - Run ./producer.py for Python producer"
echo "  - Run ./consumer.py for Python consumer"
echo ""
echo "Connection Information:"
echo "  Kafka Broker: kafka.example.com:9092"
echo "  Protocol: SASL_PLAINTEXT"
echo "  SASL Mechanism: GSSAPI (Kerberos)"
echo "  Test Topic: test-topic"
echo ""
echo "Principal Credentials:"
echo "  Producer: producer@EXAMPLE.COM (password: producer123)"
echo "  Consumer: consumer@EXAMPLE.COM (password: consumer123)"
echo "  Keytabs: keytabs/*.keytab"
echo ""
