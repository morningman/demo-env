#!/usr/bin/env python3
"""
Kafka Avro Consumer - 特殊场景
Topic 名称: NRDP.topic1
Schema Subject: topic1-value (名称不匹配)
消费时不改变 offset (enable.auto.commit=False)
"""

import os
import json
from confluent_kafka import Consumer
from confluent_kafka.serialization import SerializationContext, MessageField
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroDeserializer

# 清除代理环境变量，避免访问 localhost 问题
for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NO_PROXY']:
    if proxy_var in os.environ:
        del os.environ[proxy_var]

# Kafka 配置
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'
KAFKA_TOPIC = 'NRDP.topic1'  # 实际的 Kafka topic 名称

# Schema Registry 配置
SCHEMA_REGISTRY_URL = 'http://localhost:8081'
SCHEMA_REGISTRY_USER = 'admin'
SCHEMA_REGISTRY_PASSWORD = 'admin123'
SCHEMA_SUBJECT = 'topic1-value'  # Schema subject 名称（与 topic 名称不匹配）

# Kafka consumer 配置
# enable.auto.commit=False: 不自动提交 offset，允许重复消费
consumer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
    'group.id': 'wrong-topic-consumer-group',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False,  # 不自动提交 offset，每次都从头开始读取
}

# Schema Registry 客户端配置
schema_registry_conf = {
    'url': SCHEMA_REGISTRY_URL,
    'basic.auth.user.info': f'{SCHEMA_REGISTRY_USER}:{SCHEMA_REGISTRY_PASSWORD}'
}

def consume_messages(consumer, avro_deserializer, max_messages=None):
    """消费消息"""
    print(f"\n=== 消费来自 topic: {KAFKA_TOPIC} 的消息 ===")
    print(f"Schema Subject: {SCHEMA_SUBJECT}")
    print("⚠ 注意: enable.auto.commit=False，offset 不会改变")
    print()

    message_count = 0

    try:
        while True:
            msg = consumer.poll(timeout=1.0)

            if msg is None:
                if message_count > 0:
                    print(f"\n⏸ 没有更多消息 (已消费 {message_count} 条)")
                    break
                continue

            if msg.error():
                print(f"✗ Consumer 错误: {msg.error()}")
                continue

            # 反序列化消息
            try:
                key = msg.key().decode('utf-8') if msg.key() else None
                value = avro_deserializer(msg.value(), SerializationContext(KAFKA_TOPIC, MessageField.VALUE))

                message_count += 1
                print(f"\n--- 消息 {message_count} ---")
                print(f"Key: {key}")
                print(f"Topic: {msg.topic()}")
                print(f"Partition: {msg.partition()}")
                print(f"Offset: {msg.offset()}")
                print(f"Timestamp: {msg.timestamp()}")
                print(f"Value:")
                print(json.dumps(value, indent=2, ensure_ascii=False, default=str))

                if max_messages and message_count >= max_messages:
                    print(f"\n✓ 达到最大消息数 ({max_messages})")
                    break

            except Exception as e:
                print(f"✗ 反序列化消息失败: {e}")
                print(f"Raw value: {msg.value()}")

    except KeyboardInterrupt:
        print("\n✓ 用户中断消费")
    finally:
        # 注意：我们不调用 commit()，所以 offset 不会改变
        consumer.close()
        print(f"\n✓ 共消费 {message_count} 条消息")
        print("⚠ Offset 未提交，下次运行将从头开始消费")

def main():
    print("=== Kafka Avro Consumer - 特殊场景 ===")
    print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Schema Registry: {SCHEMA_REGISTRY_URL}")
    print()
    print("⚠ 特殊场景说明:")
    print(f"  - Kafka Topic: {KAFKA_TOPIC}")
    print(f"  - Schema Subject: {SCHEMA_SUBJECT}")
    print("  - 名称不匹配的场景测试")
    print("  - 消费时不提交 offset (可重复消费)")
    print()

    # 创建 Schema Registry 客户端
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # 从 Schema Registry 获取 schema
    print("从 Schema Registry 获取 schema...")
    try:
        schema_version = schema_registry_client.get_latest_version(SCHEMA_SUBJECT)
        schema_str = schema_version.schema.schema_str
        print(f"✓ Schema 获取成功 (ID: {schema_version.schema_id}, Version: {schema_version.version})")
    except Exception as e:
        print(f"✗ 获取 schema 失败: {e}")
        print(f"\n请先运行 register_schema.py 注册 schema!")
        return

    # 创建 Avro 反序列化器
    avro_deserializer = AvroDeserializer(
        schema_registry_client,
        schema_str
    )

    # 创建 consumer
    consumer = Consumer(consumer_config)
    consumer.subscribe([KAFKA_TOPIC])

    # 询问用户要消费多少条消息
    print("\n" + "="*60)
    print("选项:")
    print("  1. 消费所有消息")
    print("  2. 消费前 10 条消息")
    print("  3. 消费前 N 条消息 (自定义)")
    print("="*60)

    choice = input("\n请选择 (1-3): ").strip()

    max_messages = None
    if choice == '2':
        max_messages = 10
    elif choice == '3':
        try:
            max_messages = int(input("请输入要消费的消息数量: ").strip())
        except ValueError:
            print("无效输入，将消费所有消息")
            max_messages = None

    # 消费消息
    consume_messages(consumer, avro_deserializer, max_messages=max_messages)

    print("\n✓ 消费完成!")

if __name__ == "__main__":
    main()
