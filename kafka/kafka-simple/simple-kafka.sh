#!/bin/bash

# Simple Kafka environment management script

set -e

COMPOSE_FILE="docker-compose-simple.yml"
DOCKER_COMPOSE="sudo docker compose"

function print_header() {
    echo "===================================================================="
    echo "$1"
    echo "===================================================================="
}

function start() {
    print_header "Starting Simple Kafka environment"
    $DOCKER_COMPOSE -f $COMPOSE_FILE up -d
    echo ""
    echo "Waiting for Kafka to start up completely..."
    sleep 10
    echo ""
    echo "✓ Kafka environment started"
    echo ""
    echo "Kafka broker: localhost:9092"
    echo "Topics:"
    echo "  - simple-topic (5 partitions)"
    echo "  - tp1.test1 (3 partitions)"
    echo "  - TP1.TEST1 (3 partitions)"
    echo ""
    show_status
}

function stop() {
    print_header "Stopping Simple Kafka environment"
    $DOCKER_COMPOSE -f $COMPOSE_FILE down
    echo "✓ Kafka environment stopped"
}

function restart() {
    print_header "Restarting Simple Kafka environment"
    stop
    sleep 2
    start
}

function clean() {
    print_header "Cleaning up Simple Kafka environment (including data)"
    $DOCKER_COMPOSE -f $COMPOSE_FILE down -v
    echo "✓ Kafka environment and data cleaned"
}

function show_status() {
    print_header "Kafka container status"
    $DOCKER_COMPOSE -f $COMPOSE_FILE ps
}

function show_logs() {
    print_header "Kafka logs"
    $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f kafka
}

function show_topic() {
    print_header "Topic information"
    echo "Topic: simple-topic"
    sudo docker exec kafka-simple kafka-topics \
        --bootstrap-server localhost:9092 \
        --describe \
        --topic simple-topic
    echo ""
    echo "Topic: tp1.test1"
    sudo docker exec kafka-simple kafka-topics \
        --bootstrap-server localhost:9092 \
        --describe \
        --topic tp1.test1
    echo ""
    echo "Topic: TP1.TEST1"
    sudo docker exec kafka-simple kafka-topics \
        --bootstrap-server localhost:9092 \
        --describe \
        --topic TP1.TEST1
}

function produce() {
    print_header "Send message"
    python3 producer-simple.py
}

function consume() {
    print_header "View messages"
    python3 consumer-simple.py
}

function install_deps() {
    print_header "Install Python dependencies"
    pip3 install kafka-python
    echo "✓ Dependencies installed"
}

function show_help() {
    cat << EOF
Simple Kafka environment management script

Usage: $0 [command]

Commands:
  start         Start Kafka environment
  stop          Stop Kafka environment
  restart       Restart Kafka environment
  clean         Clean up Kafka environment and data
  status        View container status
  logs          View Kafka logs
  topic         View topic information
  produce       Run producer script (send message)
  consume       Run consumer script (view message)
  install-deps  Install Python dependencies
  help          Show this help message

Examples:
  $0 start                # Start environment
  $0 produce              # Send message
  $0 consume              # View message
  $0 clean && $0 start    # Start fresh (clear all data)

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
        show_logs
        ;;
    topic)
        show_topic
        ;;
    produce)
        produce
        ;;
    consume)
        consume
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
