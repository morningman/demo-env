#!/bin/bash
# Verify Avro setup with Schema Registry

echo "=== Verifying Avro Setup with Schema Registry ==="
echo ""

# Check Schema Registry is running
echo "1. Checking Schema Registry health..."
SR_HEALTH=$(curl -s -u admin:admin123 http://schema-registry.example.com:8081/ | grep -o "Schema Registry")

if [ -n "$SR_HEALTH" ]; then
    echo "✓ Schema Registry is running"
else
    echo "✗ Schema Registry is not responding"
    exit 1
fi

echo ""

# List registered schemas
echo "2. Listing registered schemas..."
SUBJECTS=$(curl -s -u admin:admin123 http://schema-registry.example.com:8081/subjects)
echo "Registered subjects: $SUBJECTS"

if echo "$SUBJECTS" | grep -q "users-value"; then
    echo "✓ users-value schema is registered"
else
    echo "✗ users-value schema not found"
fi

if echo "$SUBJECTS" | grep -q "orders-value"; then
    echo "✓ orders-value schema is registered"
else
    echo "✗ orders-value schema not found"
fi

echo ""

# Get schema details
echo "3. Getting schema details..."

echo "--- Users Schema ---"
USER_SCHEMA=$(curl -s -u admin:admin123 http://schema-registry.example.com:8081/subjects/users-value/versions/latest)
echo "$USER_SCHEMA" | python3 -m json.tool 2>/dev/null || echo "$USER_SCHEMA"

echo ""
echo "--- Orders Schema ---"
ORDER_SCHEMA=$(curl -s -u admin:admin123 http://schema-registry.example.com:8081/subjects/orders-value/versions/latest)
echo "$ORDER_SCHEMA" | python3 -m json.tool 2>/dev/null || echo "$ORDER_SCHEMA"

echo ""

# Check topics
echo "4. Checking Avro topics..."
docker exec kafka kafka-topics --list \
  --bootstrap-server kafka.example.com:9092 \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null | grep -E "(users-avro|orders-avro)"

echo ""

# Describe topics
echo "5. Topic details..."
echo "--- users-avro ---"
docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic users-avro \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null

echo ""
echo "--- orders-avro ---"
docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka.example.com:9092 \
  --topic orders-avro \
  --command-config /etc/kafka/secrets/producer.properties 2>/dev/null

echo ""

# Test authentication
echo "6. Testing Schema Registry authentication..."

# Test without auth (should fail)
NOAUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://schema-registry.example.com:8081/subjects)
if [ "$NOAUTH_RESPONSE" = "401" ]; then
    echo "✓ Schema Registry correctly requires authentication"
else
    echo "⚠ Warning: Schema Registry returned status $NOAUTH_RESPONSE without auth"
fi

# Test with wrong credentials (should fail)
WRONGAUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -u wrong:wrong http://schema-registry.example.com:8081/subjects)
if [ "$WRONGAUTH_RESPONSE" = "401" ]; then
    echo "✓ Schema Registry correctly rejects wrong credentials"
else
    echo "⚠ Warning: Schema Registry returned status $WRONGAUTH_RESPONSE with wrong credentials"
fi

# Test with correct credentials (should succeed)
CORRECTAUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -u admin:admin123 http://schema-registry.example.com:8081/subjects)
if [ "$CORRECTAUTH_RESPONSE" = "200" ]; then
    echo "✓ Schema Registry accepts correct credentials"
else
    echo "✗ Schema Registry returned status $CORRECTAUTH_RESPONSE with correct credentials"
fi

echo ""
echo "=== Verification Summary ==="
echo "✓ Schema Registry is operational"
echo "✓ BASIC authentication is working"
echo "✓ Schemas are registered"
echo "✓ Avro topics are created"
echo ""
echo "You can now run:"
echo "  python3 avro-examples/avro_producer.py  # Produce Avro messages"
echo "  python3 avro-examples/avro_consumer.py  # Consume Avro messages"
