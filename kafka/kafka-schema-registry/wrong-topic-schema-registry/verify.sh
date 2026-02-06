#!/bin/bash
# Verification script - Check if environment is properly configured

echo "=== Environment Verification ==="
echo ""

ERRORS=0

# Check Docker
echo "1. Checking Docker..."
if command -v docker &> /dev/null; then
    echo "   ✓ Docker is installed"
else
    echo "   ✗ Docker is not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check Docker containers
echo ""
echo "2. Checking Kafka container..."
if docker ps | grep -q kafka; then
    echo "   ✓ Kafka container is running"
else
    echo "   ✗ Kafka container is not running"
    echo "   Hint: Please start Kafka container first"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "3. Checking Schema Registry container..."
if docker ps | grep -q schema-registry; then
    echo "   ✓ Schema Registry container is running"
else
    echo "   ✗ Schema Registry container is not running"
    echo "   Hint: Please start Schema Registry container first"
    ERRORS=$((ERRORS + 1))
fi

# Check ports
echo ""
echo "4. Checking Kafka port (9092)..."
if nc -z localhost 9092 2>/dev/null; then
    echo "   ✓ Kafka port 9092 is accessible"
else
    echo "   ⚠ Kafka port 9092 is not accessible"
    echo "   Hint: Check if Kafka is started properly"
fi

echo ""
echo "5. Checking Schema Registry port (8081)..."
if nc -z localhost 8081 2>/dev/null; then
    echo "   ✓ Schema Registry port 8081 is accessible"
else
    echo "   ⚠ Schema Registry port 8081 is not accessible"
    echo "   Hint: Check if Schema Registry is started properly"
fi

# Check Python
echo ""
echo "6. Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✓ $PYTHON_VERSION"
else
    echo "   ✗ Python 3 is not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check Python dependencies
echo ""
echo "7. Checking Python dependencies..."
if python3 -c "import confluent_kafka" 2>/dev/null; then
    echo "   ✓ confluent-kafka is installed"
else
    echo "   ✗ confluent-kafka is not installed"
    echo "   Hint: pip install confluent-kafka"
    ERRORS=$((ERRORS + 1))
fi

if python3 -c "import requests" 2>/dev/null; then
    echo "   ✓ requests is installed"
else
    echo "   ✗ requests is not installed"
    echo "   Hint: pip install requests"
    ERRORS=$((ERRORS + 1))
fi

# Check script permissions
echo ""
echo "8. Checking script execute permissions..."
ALL_EXECUTABLE=true
for script in manage.sh demo.sh create_topic.sh producer.py consumer.py register_schema.py; do
    if [ ! -x "$script" ]; then
        echo "   ✗ $script does not have execute permission"
        ALL_EXECUTABLE=false
    fi
done

if [ "$ALL_EXECUTABLE" = true ]; then
    echo "   ✓ All scripts have execute permissions"
else
    echo "   Hint: chmod +x *.sh *.py"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "================================="
if [ $ERRORS -eq 0 ]; then
    echo "✓ Environment verification passed!"
    echo ""
    echo "You can now start using:"
    echo "  ./manage.sh setup"
else
    echo "✗ Found $ERRORS issue(s)"
    echo "Please resolve the above issues before continuing"
fi
echo "================================="
