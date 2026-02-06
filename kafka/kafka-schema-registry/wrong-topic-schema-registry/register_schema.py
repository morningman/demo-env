#!/usr/bin/env python3
"""
Register Avro schema to Schema Registry
Special scenario: topic name is "NRDP.topic1", but schema subject uses "topic1-value"
"""

import json
import requests
from requests.auth import HTTPBasicAuth
import sys
import os

# Clear proxy environment variables to avoid localhost access issues
for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NO_PROXY']:
    if proxy_var in os.environ:
        print(f"⚠ Clearing environment variable {proxy_var}...")
        del os.environ[proxy_var]

# Schema Registry configuration
SCHEMA_REGISTRY_URL = "http://localhost:8081"
SCHEMA_REGISTRY_USER = "admin"
SCHEMA_REGISTRY_PASSWORD = "admin123"

# Schema configuration
SCHEMA_FILE = "schemas/topic1.avsc"
SUBJECT_NAME = "topic1-value"  # Note: Using "topic1" here, not "NRDP.topic1"

def register_schema(subject, schema_file):
    """Register schema to Schema Registry"""
    # Read schema file
    try:
        with open(schema_file, 'r') as f:
            schema_content = json.load(f)
    except FileNotFoundError:
        print(f"✗ Schema file not found: {schema_file}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"✗ Schema file JSON format error {schema_file}: {e}")
        sys.exit(1)

    # Prepare request payload
    payload = {
        "schema": json.dumps(schema_content)
    }

    # Register schema
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
        print(f"✗ Failed to connect to Schema Registry: {e}")
        sys.exit(1)

    if response.status_code in [200, 201]:
        result = response.json()
        print(f"✓ Schema registered successfully: '{subject}'")
        print(f"  Schema ID: {result['id']}")
        return result['id']
    else:
        print(f"✗ Schema registration failed: '{subject}'")
        print(f"  Status code: {response.status_code}")
        print(f"  Response: {response.text}")
        sys.exit(1)

def get_subject_info(subject):
    """Get detailed information about a subject"""
    url = f"{SCHEMA_REGISTRY_URL}/subjects/{subject}/versions/latest"
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(SCHEMA_REGISTRY_USER, SCHEMA_REGISTRY_PASSWORD),
            timeout=10
        )
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to get subject info: {e}")
        return None

    if response.status_code == 200:
        return response.json()
    else:
        return None

def list_subjects():
    """List all registered subjects"""
    url = f"{SCHEMA_REGISTRY_URL}/subjects"
    try:
        response = requests.get(
            url,
            auth=HTTPBasicAuth(SCHEMA_REGISTRY_USER, SCHEMA_REGISTRY_PASSWORD),
            timeout=10
        )
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to connect to Schema Registry: {e}")
        return []

    if response.status_code == 200:
        subjects = response.json()
        print(f"\nRegistered subjects ({len(subjects)}):")
        for subject in subjects:
            print(f"  - {subject}")
        return subjects
    else:
        print(f"✗ Failed to list subjects")
        print(f"  Status code: {response.status_code}")
        return []

def main():
    print("=== Schema Registry - Special Scenario Registration ===")
    print(f"URL: {SCHEMA_REGISTRY_URL}")
    print(f"User: {SCHEMA_REGISTRY_USER}")
    print()
    print("⚠ Special scenario description:")
    print("  - Kafka Topic name: NRDP.topic1")
    print(f"  - Schema Subject name: {SUBJECT_NAME}")
    print("  - This will cause a name mismatch")
    print()

    try:
        # Register schema
        print(f"1. Registering schema as subject '{SUBJECT_NAME}'...")
        schema_id = register_schema(SUBJECT_NAME, SCHEMA_FILE)

        print()

        # Get subject details
        print(f"2. Getting detailed info for subject '{SUBJECT_NAME}'...")
        info = get_subject_info(SUBJECT_NAME)
        if info:
            print(f"  Schema ID: {info['id']}")
            print(f"  Version: {info['version']}")
            print(f"  Subject: {info['subject']}")

        print()

        # List all subjects
        print("3. Listing all registered subjects...")
        list_subjects()

        print("\n✓ Schema registration completed!")
        print(f"\nSchema ID: {schema_id}")
        print(f"\n⚠ Note: Schema subject is '{SUBJECT_NAME}', but the actual topic is 'NRDP.topic1'")

    except Exception as e:
        print(f"\n✗ Schema registration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
