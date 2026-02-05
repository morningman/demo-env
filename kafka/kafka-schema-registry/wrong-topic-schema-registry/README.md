# Wrong Topic Schema Registry - 特殊场景

这个目录包含了一个特殊的测试场景，用于演示 Kafka Topic 名称与 Schema Registry Subject 名称不匹配的情况。

## 场景说明

在这个特殊场景中：

- **Kafka Topic 名称**: `NRDP.topic1`
- **Schema Registry Subject 名称**: `topic1-value`

通常情况下，Schema Registry 的 subject 命名规则是 `<topic-name>-value` 或 `<topic-name>-key`。但在这个场景中，我们故意创建了一个不匹配的情况，topic 名称包含前缀 `NRDP.`，但 schema subject 中没有这个前缀。

## 目录结构

```
wrong-topic-schema-registry/
├── schemas/
│   └── topic1.avsc          # Avro schema 定义
├── create_topic.sh          # 创建 Kafka topic 脚本
├── register_schema.py       # 注册 schema 到 Schema Registry
├── producer.py              # 生产消息脚本
├── consumer.py              # 消费消息脚本（不改变 offset）
├── manage.sh                # 主管理脚本
└── README.md                # 本文件
```

## 快速开始

### 1. 完整设置（推荐）

使用管理脚本一键设置环境：

```bash
cd wrong-topic-schema-registry
chmod +x manage.sh
./manage.sh setup
```

这将自动完成：
- 创建 Kafka topic `NRDP.topic1`
- 在 Schema Registry 中注册 schema subject `topic1-value`

### 2. 生产消息

```bash
./manage.sh produce
```

这将向 `NRDP.topic1` topic 生产 10 条 Avro 格式的消息。

### 3. 消费消息

```bash
./manage.sh consume
```

消费者特性：
- 从 topic `NRDP.topic1` 读取消息
- 使用 Schema Registry 的 `topic1-value` subject 进行反序列化
- **不会提交 offset**（`enable.auto.commit=False`），每次运行都会从头开始消费

## 手动步骤

如果你想一步步执行，可以使用以下命令：

### 1. 创建 Topic

```bash
./manage.sh create-topic
```

或直接运行：

```bash
chmod +x create_topic.sh
./create_topic.sh
```

### 2. 注册 Schema

```bash
./manage.sh register
```

或直接运行：

```bash
chmod +x register_schema.py
./register_schema.py
```

### 3. 运行 Producer

```bash
chmod +x producer.py
./producer.py
```

### 4. 运行 Consumer

```bash
chmod +x consumer.py
./consumer.py
```

## 管理命令

`manage.sh` 提供以下命令：

| 命令 | 说明 |
|------|------|
| `setup` | 完整设置（创建 topic + 注册 schema） |
| `create-topic` | 仅创建 Kafka topic |
| `register` | 仅注册 schema |
| `produce` | 运行 producer 生产消息 |
| `consume` | 运行 consumer 消费消息 |
| `status` | 查看当前状态 |
| `cleanup` | 清理 topic 和 schema |
| `help` | 显示帮助信息 |

### 查看状态

```bash
./manage.sh status
```

### 清理环境

```bash
./manage.sh cleanup
```

这将删除：
- Kafka topic `NRDP.topic1`
- Schema Registry subject `topic1-value`

## Schema 定义

Schema 定义在 `schemas/topic1.avsc`：

```json
{
  "type": "record",
  "name": "Topic1Data",
  "namespace": "com.nrdp.avro",
  "fields": [
    {"name": "id", "type": "long"},
    {"name": "message", "type": "string"},
    {"name": "timestamp", "type": "long"},
    {"name": "status", "type": {"type": "enum", "name": "Status", "symbols": ["ACTIVE", "INACTIVE", "PENDING"]}},
    {"name": "metadata", "type": {"type": "map", "values": "string"}}
  ]
}
```

## 技术要点

### Producer

- 向 topic `NRDP.topic1` 生产消息
- 从 Schema Registry 的 subject `topic1-value` 获取 schema
- 使用 Avro 序列化消息
- 使用消息 ID 作为 key

### Consumer

- 从 topic `NRDP.topic1` 消费消息
- 从 Schema Registry 的 subject `topic1-value` 获取 schema
- 使用 Avro 反序列化消息
- **关键特性**: `enable.auto.commit=False`，不会提交 offset
- 每次运行都从头开始消费（`auto.offset.reset=earliest`）

### 为什么 Consumer 不改变 Offset？

Consumer 配置中设置了：

```python
consumer_config = {
    'enable.auto.commit': False,  # 不自动提交 offset
    'auto.offset.reset': 'earliest',  # 从最早的消息开始
}
```

这样可以：
- 多次运行 consumer 查看相同的消息
- 测试和调试时不影响消息数据
- 模拟只读查询的场景

## 注意事项

1. **名称不匹配**: 这是一个特殊场景，正常使用时应该保持 topic 名称和 schema subject 名称一致
2. **Schema Registry 认证**: 使用 BASIC 认证（admin/admin123）
3. **Kafka 无认证**: Kafka broker 不需要认证
4. **重复消费**: Consumer 每次都会重新读取所有消息

## 前置条件

- Docker 环境已启动
- Kafka 和 Schema Registry 容器正在运行
- Python 3 已安装
- 已安装依赖: `confluent-kafka` 和 `requests`

## 故障排查

### 连接失败

如果遇到连接问题，检查：
1. Docker 容器是否运行: `docker ps`
2. Kafka 端口 9092 是否可访问
3. Schema Registry 端口 8081 是否可访问

### Schema 未找到

如果 producer/consumer 报告找不到 schema：
```bash
./manage.sh register
```

### Topic 不存在

如果报告 topic 不存在：
```bash
./manage.sh create-topic
```

### 清理并重新开始

```bash
./manage.sh cleanup
./manage.sh setup
```
