# 使用示例

## 完整工作流程示例

### 第 1 步: 验证环境

```bash
cd wrong-topic-schema-registry
./verify.sh
```

预期输出：
```
=== 环境验证检查 ===

1. 检查 Docker...
   ✓ Docker 已安装

2. 检查 Kafka 容器...
   ✓ Kafka 容器正在运行

3. 检查 Schema Registry 容器...
   ✓ Schema Registry 容器正在运行

...

=================================
✓ 环境验证通过！
=================================
```

### 第 2 步: 设置环境

```bash
./manage.sh setup
```

这将：
- 创建 Kafka topic `NRDP.topic1`（3 个分区，1 个副本）
- 在 Schema Registry 注册 schema subject `topic1-value`

### 第 3 步: 查看状态

```bash
./manage.sh status
```

预期输出：
```
=== 环境状态 ===

1. Kafka Topics:
  ✓ NRDP.topic1 存在
  PartitionCount: 3  ReplicationFactor: 1

2. Schema Registry Subjects:
  ✓ topic1-value 存在
  Schema ID: 1
  Version: 1

3. Topic 消息数量:
  总消息数: 0
```

### 第 4 步: 生产消息

```bash
./manage.sh produce
```

预期输出：
```
=== Kafka Avro Producer - 特殊场景 ===
Kafka: localhost:9092
Schema Registry: http://localhost:8081

⚠ 特殊场景说明:
  - Kafka Topic: NRDP.topic1
  - Schema Subject: topic1-value
  - 名称不匹配的场景测试

从 Schema Registry 获取 schema...
✓ Schema 获取成功 (ID: 1, Version: 1)

=== 生产 10 条消息 ===
Topic: NRDP.topic1
Schema Subject: topic1-value

✓ 消息已投递到 NRDP.topic1 [partition 0] offset 0
✓ 消息已投递到 NRDP.topic1 [partition 1] offset 0
✓ 消息已投递到 NRDP.topic1 [partition 2] offset 0
...
```

### 第 5 步: 消费消息

```bash
./manage.sh consume
```

选择选项 2（消费前 10 条消息），预期输出：
```
=== Kafka Avro Consumer - 特殊场景 ===
Kafka: localhost:9092
Schema Registry: http://localhost:8081

⚠ 特殊场景说明:
  - Kafka Topic: NRDP.topic1
  - Schema Subject: topic1-value
  - 名称不匹配的场景测试
  - 消费时不提交 offset (可重复消费)

从 Schema Registry 获取 schema...
✓ Schema 获取成功 (ID: 1, Version: 1)

=== 消费来自 topic: NRDP.topic1 的消息 ===
Schema Subject: topic1-value
⚠ 注意: enable.auto.commit=False，offset 不会改变

--- 消息 1 ---
Key: 1
Topic: NRDP.topic1
Partition: 0
Offset: 0
Value:
{
  "id": 1,
  "message": "这是第 1 条消息 - 测试特殊场景",
  "timestamp": 1738872000000,
  "status": "PENDING",
  "metadata": {
    "source": "wrong-topic-producer",
    "version": "1.0",
    "scenario": "topic-schema-mismatch"
  }
}
...
```

### 第 6 步: 重复消费验证

再次运行 consumer：
```bash
./manage.sh consume
```

你会发现消息可以重复读取，因为 offset 没有被提交。

### 第 7 步: 清理环境

```bash
./manage.sh cleanup
```

这将删除：
- Kafka topic `NRDP.topic1`
- Schema Registry subject `topic1-value`

## 常见操作

### 只创建 topic

```bash
./manage.sh create-topic
```

### 只注册 schema

```bash
./manage.sh register
```

### 手动运行 producer

```bash
./producer.py
```

### 手动运行 consumer

```bash
./consumer.py
```

## 一键演示

如果你想快速体验整个流程：

```bash
./demo.sh
```

这将自动执行所有步骤，并在每个步骤之间暂停等待你按 Enter 键继续。

## 验证 Schema 不匹配

使用 kafka-console-consumer 尝试读取消息（不使用 Schema Registry）：

```bash
docker exec -it kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic NRDP.topic1 \
  --from-beginning \
  --max-messages 1
```

你会看到二进制数据，因为消息是用 Avro 编码的。

## 查看 Schema Registry 中的 schema

```bash
curl -u admin:admin123 http://localhost:8081/subjects/topic1-value/versions/latest | python3 -m json.tool
```

## 列出所有 topics

```bash
docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092 | grep NRDP
```

## 查看 topic 详情

```bash
docker exec kafka kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic NRDP.topic1
```
