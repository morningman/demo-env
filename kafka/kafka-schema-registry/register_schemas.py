#!/usr/bin/env python3
"""
Register Avro schemas with Schema Registry (BASIC Auth)
"""

import json
import requests
from requests.auth import HTTPBasicAuth
import sys
import os

# Unset proxy environment variables to avoid localhost access issues
for proxy_var in ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'no_proxy', 'NO_PROXY']:
    if proxy_var in os.environ:
        print(f"⚠ Unsetting {proxy_var} environment variable...")
        del os.environ[proxy_var]

# Schema Registry configuration
SCHEMA_REGISTRY_URL = "http://localhost:8081"
SCHEMA_REGISTRY_USER = "admin"
SCHEMA_REGISTRY_PASSWORD = "admin123"

def register_schema(subject, schema_file):
    """Register a schema with Schema Registry"""
    # Read schema file
    try:
        with open(schema_file, 'r') as f:
            schema_content = json.load(f)
    except FileNotFoundError:
        print(f"✗ Schema file not found: {schema_file}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON in schema file {schema_file}: {e}")
        sys.exit(1)

    # Prepare the request payload
    payload = {
        "schema": json.dumps(schema_content)
    }

    # Register the schema
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
        print(f"✓ Schema registered successfully for subject '{subject}'")
        print(f"  Schema ID: {result['id']}")
        return result['id']
    else:
        print(f"✗ Failed to register schema for subject '{subject}'")
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text}")
        sys.exit(1)

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
        print(f"  Status: {response.status_code}")
        return []

def main():
    print("=== Schema Registry - Schema Registration ===")
    print(f"URL: {SCHEMA_REGISTRY_URL}")
    print(f"User: {SCHEMA_REGISTRY_USER}\n")

    try:
        # Register User schema
        print("1. Registering User schema...")
        user_schema_id = register_schema("users-avro-value", "schemas/user.avsc")

        print()

        # Register Order schema
        print("2. Registering Order schema...")
        order_schema_id = register_schema("orders-avro-value", "schemas/order.avsc")

        print()

        # List all subjects
        print("3. Listing all registered subjects...")
        list_subjects()

        print("\n✓ Schema registration completed!")
        print("\nSchema IDs:")
        print(f"  Users: {user_schema_id}")
        print(f"  Orders: {order_schema_id}")

    except Exception as e:
        print(f"\n✗ Schema registration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
