## Wrong Topic Schema Registry 特殊场景快速使用指南

### 场景说明

这个目录演示了一个特殊的测试场景：
- **Kafka Topic 名称**: `NRDP.topic1`
- **Schema Registry Subject**: `topic1-value`
- Topic 名称与 Schema Subject 名称**不匹配**

### 快速开始

```bash
cd wrong-topic-schema-registry

# 方式 1: 一键设置 + 交互式演示
./demo.sh

# 方式 2: 使用管理脚本
./manage.sh setup     # 设置环境
./manage.sh produce   # 生产消息
./manage.sh consume   # 消费消息
```

### 主要特性

1. **Topic 创建**: 创建名为 `NRDP.topic1` 的 Kafka topic
2. **Schema 注册**: 在 Schema Registry 中注册为 `topic1-value`（名称不匹配）
3. **Producer**: 使用 Avro 格式向 topic 生产消息
4. **Consumer**: 消费消息但**不改变 offset**（可重复消费）

### 可用命令

```bash
./manage.sh setup        # 完整设置
./manage.sh produce      # 生产消息
./manage.sh consume      # 消费消息
./manage.sh status       # 查看状态
./manage.sh cleanup      # 清理环境
```

详细文档请查看 `wrong-topic-schema-registry/README.md`
