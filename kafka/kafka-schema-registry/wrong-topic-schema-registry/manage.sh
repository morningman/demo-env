#!/bin/bash
# Special scenario management script - Topic and Schema Subject name mismatch

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

function show_help() {
    echo "=== Special Scenario Management Script ==="
    echo "Topic name: NRDP.topic1"
    echo "Schema Subject: topic1-value"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup        - Complete setup (create topic + register schema)"
    echo "  create-topic - Create Kafka topic (NRDP.topic1)"
    echo "  register     - Register schema (topic1-value)"
    echo "  produce      - Run producer to produce messages"
    echo "  consume      - Run consumer to consume messages"
    echo "  cleanup      - Clean up topic and schema"
    echo "  status       - View status"
    echo "  help         - Display help information"
    echo ""
}

function create_topic() {
    echo "=== Create Kafka Topic ==="
    echo "Topic name: NRDP.topic1"
    echo ""

    # Check if topic already exists
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        echo "⚠ Topic NRDP.topic1 already exists"
        echo ""
        echo "Delete and recreate? (y/N)"
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            docker exec kafka-sr kafka-topics --delete --bootstrap-server localhost:9092 --topic NRDP.topic1
            echo "✓ Deleted old topic"
            sleep 2
        else
            echo "Keeping existing topic"
            return 0
        fi
    fi

    docker exec kafka-sr kafka-topics \
        --create \
        --bootstrap-server localhost:9092 \
        --topic NRDP.topic1 \
        --partitions 3 \
        --replication-factor 1

    echo ""
    echo "✓ Topic created successfully!"
}

function register_schema() {
    echo "=== Register Schema ==="
    echo "Schema Subject: topic1-value"
    echo ""

    chmod +x register_schema.py
    ./register_schema.py
}

function run_producer() {
    echo "=== Run Producer ==="
    echo ""

    chmod +x producer.py
    ./producer.py
}

function run_consumer() {
    echo "=== Run Consumer ==="
    echo ""

    chmod +x consumer.py
    ./consumer.py
}

function cleanup() {
    echo "=== Clean Up Environment ==="
    echo ""

    # Delete topic
    echo "1. Deleting Kafka topic..."
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        docker exec kafka-sr kafka-topics --delete --bootstrap-server localhost:9092 --topic NRDP.topic1
        echo "✓ Topic deleted"
    else
        echo "⚠ Topic does not exist"
    fi

    echo ""

    # Delete schema
    echo "2. Deleting Schema Registry subject..."
    curl -X DELETE \
        -u admin:admin123 \
        http://localhost:8081/subjects/topic1-value 2>/dev/null
    echo ""
    echo "✓ Subject deleted"

    echo ""
    echo "✓ Cleanup completed!"
}

function show_status() {
    echo "=== Environment Status ==="
    echo ""

    # Check topic
    echo "1. Kafka Topics:"
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        echo "  ✓ NRDP.topic1 exists"
        docker exec kafka-sr kafka-topics --describe --bootstrap-server localhost:9092 --topic NRDP.topic1 | grep "PartitionCount"
    else
        echo "  ✗ NRDP.topic1 does not exist"
    fi

    echo ""

    # Check schema
    echo "2. Schema Registry Subjects:"
    subjects=$(curl -s -u admin:admin123 http://localhost:8081/subjects 2>/dev/null)
    if echo "$subjects" | grep -q "topic1-value"; then
        echo "  ✓ topic1-value exists"
        schema_info=$(curl -s -u admin:admin123 http://localhost:8081/subjects/topic1-value/versions/latest 2>/dev/null)
        echo "  Schema ID: $(echo $schema_info | grep -o '"id":[0-9]*' | cut -d':' -f2)"
        echo "  Version: $(echo $schema_info | grep -o '"version":[0-9]*' | cut -d':' -f2)"
    else
        echo "  ✗ topic1-value does not exist"
    fi

    echo ""

    # Check message count
    echo "3. Topic Message Count:"
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        docker exec kafka-sr kafka-run-class kafka.tools.GetOffsetShell \
            --broker-list localhost:9092 \
            --topic NRDP.topic1 \
            --time -1 2>/dev/null | awk -F: '{sum+=$3} END {print "  Total messages: " sum}'
    fi
}

function setup() {
    echo "=== Complete Setup ==="
    echo ""

    create_topic
    echo ""
    sleep 2

    register_schema
    echo ""

    echo "✓ Setup completed!"
    echo ""
    echo "Next steps:"
    echo "  Run producer: $0 produce"
    echo "  Run consumer: $0 consume"
}

# Main logic
case "${1:-help}" in
    setup)
        setup
        ;;
    create-topic)
        create_topic
        ;;
    register)
        register_schema
        ;;
    produce)
        run_producer
        ;;
    consume)
        run_consumer
        ;;
    cleanup)
        cleanup
        ;;
    status)
        show_status
        ;;
    help|*)
        show_help
        ;;
esac
