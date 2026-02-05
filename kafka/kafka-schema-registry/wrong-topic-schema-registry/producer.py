#!/usr/bin/env python3
"""
Kafka Avro Producer - 特殊场景
Topic 名称: NRDP.topic1
Schema Subject: topic1-value (名称不匹配)
"""

import time
import os
from datetime import datetime
from confluent_kafka import Producer
from confluent_kafka.serialization import SerializationContext, MessageField
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

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

# Kafka producer 配置
producer_config = {
    'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
}

# Schema Registry 客户端配置
schema_registry_conf = {
    'url': SCHEMA_REGISTRY_URL,
    'basic.auth.user.info': f'{SCHEMA_REGISTRY_USER}:{SCHEMA_REGISTRY_PASSWORD}'
}

def delivery_report(err, msg):
    """消息投递回调函数"""
    if err is not None:
        print(f'✗ 消息投递失败: {err}')
    else:
        print(f'✓ 消息已投递到 {msg.topic()} [partition {msg.partition()}] offset {msg.offset()}')

def create_sample_data(record_id):
    """创建样例数据"""
    statuses = ['ACTIVE', 'INACTIVE', 'PENDING']

    return {
        'id': record_id,
        'message': f'这是第 {record_id} 条消息 - 测试特殊场景',
        'timestamp': int(time.time() * 1000),
        'status': statuses[record_id % 3],
        'metadata': {
            'source': 'wrong-topic-producer',
            'version': '1.0',
            'scenario': 'topic-schema-mismatch'
        }
    }

def produce_messages(producer, avro_serializer, count=10):
    """生产消息"""
    print(f"\n=== 生产 {count} 条消息 ===")
    print(f"Topic: {KAFKA_TOPIC}")
    print(f"Schema Subject: {SCHEMA_SUBJECT}")
    print()

    for i in range(1, count + 1):
        data = create_sample_data(i)

        try:
            # 注意：这里传递给 SerializationContext 的是实际的 topic 名称
            # 但 schema 是从不同的 subject 获取的
            producer.produce(
                topic=KAFKA_TOPIC,
                key=str(data['id']).encode('utf-8'),
                value=avro_serializer(data, SerializationContext(KAFKA_TOPIC, MessageField.VALUE)),
                on_delivery=delivery_report
            )
            producer.poll(0)
            time.sleep(0.2)
        except Exception as e:
            print(f'✗ 生产消息 {i} 失败: {e}')

    producer.flush()
    print(f"\n✓ 已刷新所有消息到 Kafka")

def main():
    print("=== Kafka Avro Producer - 特殊场景 ===")
    print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Schema Registry: {SCHEMA_REGISTRY_URL}")
    print()
    print("⚠ 特殊场景说明:")
    print(f"  - Kafka Topic: {KAFKA_TOPIC}")
    print(f"  - Schema Subject: {SCHEMA_SUBJECT}")
    print("  - 名称不匹配的场景测试")
    print()

    # 创建 Schema Registry 客户端
    schema_registry_client = SchemaRegistryClient(schema_registry_conf)

    # 创建 producer
    producer = Producer(producer_config)

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

    # 创建 Avro 序列化器
    avro_serializer = AvroSerializer(
        schema_registry_client,
        schema_str
    )

    # 生产消息
    produce_messages(producer, avro_serializer, count=10)

    print("\n✓ 消息生产完成!")

if __name__ == "__main__":
    main()
