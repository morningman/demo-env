#!/bin/bash

# Kafka Schema Registry environment management script

set -e

# Check and unset proxy environment variables to avoid conflicts with localhost access
if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ]; then
    echo "⚠ Detected http_proxy environment variable, unsetting to avoid localhost access issues..."
    unset http_proxy
    unset HTTP_PROXY
fi

if [ -n "$https_proxy" ] || [ -n "$HTTPS_PROXY" ]; then
    echo "⚠ Detected https_proxy environment variable, unsetting to avoid localhost access issues..."
    unset https_proxy
    unset HTTPS_PROXY
fi

if [ -n "$no_proxy" ] || [ -n "$NO_PROXY" ]; then
    unset no_proxy
    unset NO_PROXY
fi

COMPOSE_FILE="docker-compose.yml"
DOCKER_COMPOSE="sudo docker compose"

function print_header() {
    echo "===================================================================="
    echo "$1"
    echo "===================================================================="
}

function start() {
    print_header "Starting Kafka Schema Registry environment"
    $DOCKER_COMPOSE -f $COMPOSE_FILE up -d
    echo ""
    echo "Waiting for services to start up..."
    sleep 15
    echo ""
    echo "✓ Environment started"
    echo ""
    echo "Services:"
    echo "  - Kafka Broker: localhost:9092"
    echo "  - Schema Registry: http://localhost:8081 (BASIC Auth)"
    echo ""
    echo "Credentials:"
    echo "  - admin/admin123 (admin role)"
    echo "  - developer/dev123 (developer role)"
    echo "  - schemauser/schema123 (user role)"
    echo ""
    echo "Topics:"
    echo "  - users-avro (3 partitions)"
    echo "  - orders-avro (5 partitions)"
    echo ""
    show_status
}

function stop() {
    print_header "Stopping Kafka Schema Registry environment"
    $DOCKER_COMPOSE -f $COMPOSE_FILE down
    echo "✓ Environment stopped"
}

function restart() {
    print_header "Restarting Kafka Schema Registry environment"
    stop
    sleep 2
    start
}

function clean() {
    print_header "Cleaning up environment (including data)"
    $DOCKER_COMPOSE -f $COMPOSE_FILE down -v
    echo "✓ Environment and data cleaned"
}

function show_status() {
    print_header "Container status"
    $DOCKER_COMPOSE -f $COMPOSE_FILE ps
}

function show_logs() {
    service=${1:-kafka-sr}
    print_header "Logs for $service"
    $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f $service
}

function show_topics() {
    print_header "Topic information"
    echo "Topic: users-avro"
    sudo docker exec kafka-sr kafka-topics \
        --bootstrap-server localhost:9092 \
        --describe \
        --topic users-avro
    echo ""
    echo "Topic: orders-avro"
    sudo docker exec kafka-sr kafka-topics \
        --bootstrap-server localhost:9092 \
        --describe \
        --topic orders-avro
}

function register_schemas() {
    print_header "Register schemas to Schema Registry"
    python3 register_schemas.py
}

function produce() {
    print_header "Run Avro producer"
    python3 producer.py
}

function consume() {
    print_header "Run Avro consumer"
    python3 consumer.py
}

function install_deps() {
    print_header "Install Python dependencies"
    pip3 install confluent-kafka requests
    echo "✓ Dependencies installed"
}

function test_schema_registry() {
    print_header "Test Schema Registry"
    echo "Testing without authentication (should fail):"
    curl -s http://localhost:8081/subjects || echo "Failed as expected"
    echo ""
    echo ""
    echo "Testing with authentication (should succeed):"
    curl -s -u admin:admin123 http://localhost:8081/subjects
    echo ""
}

function show_help() {
    cat << EOF
Kafka Schema Registry environment management script

Usage: $0 [command]

Commands:
  start             Start environment
  stop              Stop environment
  restart           Restart environment
  clean             Clean up environment and data
  status            View container status
  logs [service]    View logs (default: kafka-sr)
  topics            View topic information
  register-schemas  Register Avro schemas to Schema Registry
  produce           Run Avro producer (send messages)
  consume           Run Avro consumer (view messages)
  test-sr           Test Schema Registry authentication
  install-deps      Install Python dependencies
  help              Show this help message

Examples:
  $0 start                    # Start environment
  $0 register-schemas         # Register schemas
  $0 produce                  # Send Avro messages
  $0 consume                  # View Avro messages
  $0 logs schema-registry     # View Schema Registry logs
  $0 clean && $0 start        # Start fresh (clear all data)

Workflow:
  1. $0 start                 # Start environment
  2. $0 register-schemas      # Register Avro schemas
  3. $0 produce               # Send test messages
  4. $0 consume               # View messages

EOF
}

# Main logic
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    clean)
        clean
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs ${2:-kafka-sr}
        ;;
    topics)
        show_topics
        ;;
    register-schemas)
        register_schemas
        ;;
    produce)
        produce
        ;;
    consume)
        consume
        ;;
    test-sr)
        test_schema_registry
        ;;
    install-deps)
        install_deps
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
