#!/bin/bash
# Insert sample data into all Kafka topics
set -eo pipefail

echo "=== Inserting Sample Data into All Topics ==="
echo ""

# 1. Insert data into test-topic (plain text)
echo "Step 1: Inserting sample data into test-topic..."
if [ -f "./insert_sample_data_test_topic.sh" ]; then
    bash ./insert_sample_data_test_topic.sh || {
        echo "✗ Failed to insert data into test-topic"
        exit 1
    }
else
    echo "⚠ Warning: insert_sample_data_test_topic.sh not found, skipping..."
fi

echo ""

# 2. Insert data into Avro topics (users-avro and orders-avro)
echo "Step 2: Inserting sample data into Avro topics..."
if [ -f "./insert_sample_data_avro.py" ]; then
    # Check if required Python packages are installed
    MISSING_PACKAGES=""

    if ! python3 -c "import confluent_kafka" 2>/dev/null; then
        MISSING_PACKAGES="$MISSING_PACKAGES confluent-kafka"
    fi

    if ! python3 -c "from confluent_kafka.schema_registry.avro import AvroSerializer" 2>/dev/null; then
        if ! python3 -c "import fastavro" 2>/dev/null; then
            MISSING_PACKAGES="$MISSING_PACKAGES fastavro"
        fi
    fi

    if [ -n "$MISSING_PACKAGES" ]; then
        echo "⚠ Installing required Python packages:$MISSING_PACKAGES"
        pip3 install confluent-kafka fastavro 2>/dev/null || true
    fi

    # Try to insert Avro data, but don't fail if it doesn't work
    if python3 ./insert_sample_data_avro.py 2>/dev/null; then
        echo "✓ Avro sample data inserted successfully"
    else
        echo "⚠ Warning: Could not insert Avro data using Python script"
        echo "  This is usually due to missing GSSAPI support in confluent-kafka"
        echo ""
        echo "  You can insert sample Avro data manually using:"
        echo "    cd avro-examples"
        echo "    python3 avro_producer.py"
    fi
else
    echo "⚠ Warning: insert_sample_data_avro.py not found, skipping..."
fi

echo ""
echo "=== ✅ Sample Data Insertion Complete ==="
echo ""
echo "You can now consume messages using:"
echo "  - ./consumer.sh - Consume from test-topic"
echo "  - ./avro-examples/avro_consumer.py - Consume from Avro topics"
