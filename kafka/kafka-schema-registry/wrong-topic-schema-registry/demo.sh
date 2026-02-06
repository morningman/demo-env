#!/bin/bash
# Quick demo script - Automatically run complete workflow

set -eo pipefail

echo "=========================================="
echo "  Kafka Schema Registry Special Scenario Demo"
echo "=========================================="
echo ""
echo "Scenario description:"
echo "  - Kafka Topic: NRDP.topic1"
echo "  - Schema Subject: topic1-value"
echo "  - Name mismatch test"
echo ""
echo "=========================================="
echo ""

read -p "Press Enter to start demo..."

echo ""
echo "Step 1/5: Create Kafka Topic (NRDP.topic1)"
echo "=========================================="
./manage.sh create-topic
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Step 2/5: Register Schema (topic1-value)"
echo "=========================================="
./manage.sh register
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Step 3/5: View current status"
echo "=========================================="
./manage.sh status
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Step 4/5: Produce messages to NRDP.topic1"
echo "=========================================="
./manage.sh produce
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Step 5/5: Consume messages (does not change offset)"
echo "=========================================="
echo "Note: Consumer is configured with enable.auto.commit=False"
echo "      It will read from beginning each time"
echo ""
# Auto-select to consume first 10 messages
echo "1" | ./consumer.py

echo ""
echo "=========================================="
echo "  Demo completed!"
echo "=========================================="
echo ""
echo "You can:"
echo "  - Run consumer again: ./manage.sh consume"
echo "  - Produce more messages: ./manage.sh produce"
echo "  - View status: ./manage.sh status"
echo "  - Clean up environment: ./manage.sh cleanup"
echo ""
