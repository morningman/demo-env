#!/bin/bash
# 特殊场景管理脚本 - Topic 与 Schema Subject 名称不匹配

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

function show_help() {
    echo "=== 特殊场景管理脚本 ==="
    echo "Topic 名称: NRDP.topic1"
    echo "Schema Subject: topic1-value"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  setup        - 完整设置（创建 topic + 注册 schema）"
    echo "  create-topic - 创建 Kafka topic (NRDP.topic1)"
    echo "  register     - 注册 schema (topic1-value)"
    echo "  produce      - 运行 producer 生产消息"
    echo "  consume      - 运行 consumer 消费消息"
    echo "  cleanup      - 清理 topic 和 schema"
    echo "  status       - 查看状态"
    echo "  help         - 显示帮助信息"
    echo ""
}

function create_topic() {
    echo "=== 创建 Kafka Topic ==="
    echo "Topic 名称: NRDP.topic1"
    echo ""

    # 检查 topic 是否已存在
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        echo "⚠ Topic NRDP.topic1 已存在"
        echo ""
        echo "是否删除并重新创建? (y/N)"
        read -r answer
        if [[ "$answer" =~ ^[Yy]$ ]]; then
            docker exec kafka-sr kafka-topics --delete --bootstrap-server localhost:9092 --topic NRDP.topic1
            echo "✓ 已删除旧 topic"
            sleep 2
        else
            echo "保留现有 topic"
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
    echo "✓ Topic 创建成功!"
}

function register_schema() {
    echo "=== 注册 Schema ==="
    echo "Schema Subject: topic1-value"
    echo ""

    chmod +x register_schema.py
    ./register_schema.py
}

function run_producer() {
    echo "=== 运行 Producer ==="
    echo ""

    chmod +x producer.py
    ./producer.py
}

function run_consumer() {
    echo "=== 运行 Consumer ==="
    echo ""

    chmod +x consumer.py
    ./consumer.py
}

function cleanup() {
    echo "=== 清理环境 ==="
    echo ""

    # 删除 topic
    echo "1. 删除 Kafka topic..."
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        docker exec kafka-sr kafka-topics --delete --bootstrap-server localhost:9092 --topic NRDP.topic1
        echo "✓ Topic 已删除"
    else
        echo "⚠ Topic 不存在"
    fi

    echo ""

    # 删除 schema
    echo "2. 删除 Schema Registry subject..."
    curl -X DELETE \
        -u admin:admin123 \
        http://localhost:8081/subjects/topic1-value 2>/dev/null
    echo ""
    echo "✓ Subject 已删除"

    echo ""
    echo "✓ 清理完成!"
}

function show_status() {
    echo "=== 环境状态 ==="
    echo ""

    # 检查 topic
    echo "1. Kafka Topics:"
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        echo "  ✓ NRDP.topic1 存在"
        docker exec kafka-sr kafka-topics --describe --bootstrap-server localhost:9092 --topic NRDP.topic1 | grep "PartitionCount"
    else
        echo "  ✗ NRDP.topic1 不存在"
    fi

    echo ""

    # 检查 schema
    echo "2. Schema Registry Subjects:"
    subjects=$(curl -s -u admin:admin123 http://localhost:8081/subjects 2>/dev/null)
    if echo "$subjects" | grep -q "topic1-value"; then
        echo "  ✓ topic1-value 存在"
        schema_info=$(curl -s -u admin:admin123 http://localhost:8081/subjects/topic1-value/versions/latest 2>/dev/null)
        echo "  Schema ID: $(echo $schema_info | grep -o '"id":[0-9]*' | cut -d':' -f2)"
        echo "  Version: $(echo $schema_info | grep -o '"version":[0-9]*' | cut -d':' -f2)"
    else
        echo "  ✗ topic1-value 不存在"
    fi

    echo ""

    # 检查消息数量
    echo "3. Topic 消息数量:"
    if docker exec kafka-sr kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null | grep -q "^NRDP.topic1$"; then
        docker exec kafka-sr kafka-run-class kafka.tools.GetOffsetShell \
            --broker-list localhost:9092 \
            --topic NRDP.topic1 \
            --time -1 2>/dev/null | awk -F: '{sum+=$3} END {print "  总消息数: " sum}'
    fi
}

function setup() {
    echo "=== 完整设置 ==="
    echo ""

    create_topic
    echo ""
    sleep 2

    register_schema
    echo ""

    echo "✓ 设置完成!"
    echo ""
    echo "下一步:"
    echo "  运行 producer: $0 produce"
    echo "  运行 consumer: $0 consume"
}

# 主逻辑
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
