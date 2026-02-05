#!/bin/bash
# 快速演示脚本 - 自动运行完整流程

set -eo pipefail

echo "=========================================="
echo "  Kafka Schema Registry 特殊场景演示"
echo "=========================================="
echo ""
echo "场景说明:"
echo "  - Kafka Topic: NRDP.topic1"
echo "  - Schema Subject: topic1-value"
echo "  - 名称不匹配测试"
echo ""
echo "=========================================="
echo ""

read -p "按 Enter 键开始演示..."

echo ""
echo "步骤 1/5: 创建 Kafka Topic (NRDP.topic1)"
echo "=========================================="
./manage.sh create-topic
echo ""
read -p "按 Enter 键继续..."

echo ""
echo "步骤 2/5: 注册 Schema (topic1-value)"
echo "=========================================="
./manage.sh register
echo ""
read -p "按 Enter 键继续..."

echo ""
echo "步骤 3/5: 查看当前状态"
echo "=========================================="
./manage.sh status
echo ""
read -p "按 Enter 键继续..."

echo ""
echo "步骤 4/5: 生产消息到 NRDP.topic1"
echo "=========================================="
./manage.sh produce
echo ""
read -p "按 Enter 键继续..."

echo ""
echo "步骤 5/5: 消费消息（不改变 offset）"
echo "=========================================="
echo "注意: Consumer 配置了 enable.auto.commit=False"
echo "      每次运行都会从头开始读取"
echo ""
# 自动选择消费前 10 条消息
echo "1" | ./consumer.py

echo ""
echo "=========================================="
echo "  演示完成！"
echo "=========================================="
echo ""
echo "你可以:"
echo "  - 再次运行 consumer: ./manage.sh consume"
echo "  - 生产更多消息: ./manage.sh produce"
echo "  - 查看状态: ./manage.sh status"
echo "  - 清理环境: ./manage.sh cleanup"
echo ""
