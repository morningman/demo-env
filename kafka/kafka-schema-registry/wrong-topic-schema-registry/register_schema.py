#!/usr/bin/env python3
"""
注册 Avro schema 到 Schema Registry
特殊场景：topic 名称是 "NRDP.topic1"，但 schema subject 使用 "topic1-value"
"""

import json
import requests
from requests.auth import HTTPBasicAuth
import sys
import os

# 清除代理环境变量，避免访问 localhost 问题
for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NO_PROXY']:
    if proxy_var in os.environ:
        print(f"⚠ 清除环境变量 {proxy_var}...")
        del os.environ[proxy_var]

# Schema Registry 配置
SCHEMA_REGISTRY_URL = "http://localhost:8081"
SCHEMA_REGISTRY_USER = "admin"
SCHEMA_REGISTRY_PASSWORD = "admin123"

# Schema 配置
SCHEMA_FILE = "schemas/topic1.avsc"
SUBJECT_NAME = "topic1-value"  # 注意：这里使用 "topic1"，不是 "NRDP.topic1"

def register_schema(subject, schema_file):
    """注册 schema 到 Schema Registry"""
    # 读取 schema 文件
    try:
        with open(schema_file, 'r') as f:
            schema_content = json.load(f)
    except FileNotFoundError:
        print(f"✗ Schema 文件未找到: {schema_file}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"✗ Schema 文件 JSON 格式错误 {schema_file}: {e}")
        sys.exit(1)

    # 准备请求载荷
    payload = {
        "schema": json.dumps(schema_content)
    }

    # 注册 schema
    url = f"{SCHEMA_REGISTRY_URL}/subjects/{subject}/versions"
    try:
        response = requests.post(
            url,
            json=payload,
            auth=HTTPBasicAuth(SCHEMA_REGISTRY_USER, SCHEMA_REGISTRY_PASSWORD),
            headers={'Content-Type': 'application/vnd.schemaregistry.v1+json'},
            timeout=10
        )
    except requests.exceptions.RequestException as e:
        print(f"✗ 连接 Schema Registry 失败: {e}")
        sys.exit(1)

    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✓ Schema 注册成功: '{subject}'")
        print(f"  Schema ID: {result['id']}")
        return result['id']
    else:
        print(f"✗ Schema 注册失败: '{subject}'")
        print(f"  状态码: {response.status_code}")
        print(f"  响应: {response.text}")
        sys.exit(1)

def get_subject_info(subject):
    """获取 subject 的详细信息"""
    url = f"{SCHEMA_REGISTRY_URL}/subjects/{subject}/versions/latest"
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(SCHEMA_REGISTRY_USER, SCHEMA_REGISTRY_PASSWORD),
            timeout=10
        )
    except requests.exceptions.RequestException as e:
        print(f"✗ 获取 subject 信息失败: {e}")
        return None

    if response.status_code == 200:
        return response.json()
    else:
        return None

def list_subjects():
    """列出所有注册的 subjects"""
    url = f"{SCHEMA_REGISTRY_URL}/subjects"
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(SCHEMA_REGISTRY_USER, SCHEMA_REGISTRY_PASSWORD),
            timeout=10
        )
    except requests.exceptions.RequestException as e:
        print(f"✗ 连接 Schema Registry 失败: {e}")
        return []

    if response.status_code == 200:
        subjects = response.json()
        print(f"\n已注册的 subjects ({len(subjects)}):")
        for subject in subjects:
            print(f"  - {subject}")
        return subjects
    else:
        print(f"✗ 列出 subjects 失败")
        print(f"  状态码: {response.status_code}")
        return []

def main():
    print("=== Schema Registry - 特殊场景注册 ===")
    print(f"URL: {SCHEMA_REGISTRY_URL}")
    print(f"User: {SCHEMA_REGISTRY_USER}")
    print()
    print("⚠ 特殊场景说明:")
    print("  - Kafka Topic 名称: NRDP.topic1")
    print(f"  - Schema Subject 名称: {SUBJECT_NAME}")
    print("  - 这将导致名称不匹配的情况")
    print()

    try:
        # 注册 schema
        print(f"1. 注册 Schema 为 subject '{SUBJECT_NAME}'...")
        schema_id = register_schema(SUBJECT_NAME, SCHEMA_FILE)

        print()

        # 获取 subject 详细信息
        print(f"2. 获取 subject '{SUBJECT_NAME}' 的详细信息...")
        info = get_subject_info(SUBJECT_NAME)
        if info:
            print(f"  Schema ID: {info['id']}")
            print(f"  Version: {info['version']}")
            print(f"  Subject: {info['subject']}")

        print()

        # 列出所有 subjects
        print("3. 列出所有已注册的 subjects...")
        list_subjects()

        print("\n✓ Schema 注册完成!")
        print(f"\nSchema ID: {schema_id}")
        print(f"\n⚠ 注意: Schema subject 是 '{SUBJECT_NAME}'，但实际的 topic 是 'NRDP.topic1'")

    except Exception as e:
        print(f"\n✗ Schema 注册失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
