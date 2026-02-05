#!/bin/bash
# 验证脚本 - 检查环境是否正确配置

echo "=== 环境验证检查 ==="
echo ""

ERRORS=0

# 检查 Docker
echo "1. 检查 Docker..."
if command -v docker &> /dev/null; then
    echo "   ✓ Docker 已安装"
else
    echo "   ✗ Docker 未安装"
    ERRORS=$((ERRORS + 1))
fi

# 检查 Docker 容器
echo ""
echo "2. 检查 Kafka 容器..."
if docker ps | grep -q kafka; then
    echo "   ✓ Kafka 容器正在运行"
else
    echo "   ✗ Kafka 容器未运行"
    echo "   提示: 请先启动 Kafka 容器"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "3. 检查 Schema Registry 容器..."
if docker ps | grep -q schema-registry; then
    echo "   ✓ Schema Registry 容器正在运行"
else
    echo "   ✗ Schema Registry 容器未运行"
    echo "   提示: 请先启动 Schema Registry 容器"
    ERRORS=$((ERRORS + 1))
fi

# 检查端口
echo ""
echo "4. 检查 Kafka 端口 (9092)..."
if nc -z localhost 9092 2>/dev/null; then
    echo "   ✓ Kafka 端口 9092 可访问"
else
    echo "   ⚠ Kafka 端口 9092 不可访问"
    echo "   提示: 检查 Kafka 是否正常启动"
fi

echo ""
echo "5. 检查 Schema Registry 端口 (8081)..."
if nc -z localhost 8081 2>/dev/null; then
    echo "   ✓ Schema Registry 端口 8081 可访问"
else
    echo "   ⚠ Schema Registry 端口 8081 不可访问"
    echo "   提示: 检查 Schema Registry 是否正常启动"
fi

# 检查 Python
echo ""
echo "6. 检查 Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✓ $PYTHON_VERSION"
else
    echo "   ✗ Python 3 未安装"
    ERRORS=$((ERRORS + 1))
fi

# 检查 Python 依赖
echo ""
echo "7. 检查 Python 依赖..."
if python3 -c "import confluent_kafka" 2>/dev/null; then
    echo "   ✓ confluent-kafka 已安装"
else
    echo "   ✗ confluent-kafka 未安装"
    echo "   提示: pip install confluent-kafka"
    ERRORS=$((ERRORS + 1))
fi

if python3 -c "import requests" 2>/dev/null; then
    echo "   ✓ requests 已安装"
else
    echo "   ✗ requests 未安装"
    echo "   提示: pip install requests"
    ERRORS=$((ERRORS + 1))
fi

# 检查脚本权限
echo ""
echo "8. 检查脚本执行权限..."
ALL_EXECUTABLE=true
for script in manage.sh demo.sh create_topic.sh producer.py consumer.py register_schema.py; do
    if [ ! -x "$script" ]; then
        echo "   ✗ $script 没有执行权限"
        ALL_EXECUTABLE=false
    fi
done

if [ "$ALL_EXECUTABLE" = true ]; then
    echo "   ✓ 所有脚本都有执行权限"
else
    echo "   提示: chmod +x *.sh *.py"
    ERRORS=$((ERRORS + 1))
fi

# 总结
echo ""
echo "================================="
if [ $ERRORS -eq 0 ]; then
    echo "✓ 环境验证通过！"
    echo ""
    echo "可以开始使用了:"
    echo "  ./manage.sh setup"
else
    echo "✗ 发现 $ERRORS 个问题"
    echo "请解决上述问题后再继续"
fi
echo "================================="
