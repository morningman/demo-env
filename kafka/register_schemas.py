#!/usr/bin/env python3
"""
Register Avro schemas with Schema Registry
"""

import json
import requests
import sys

# Schema Registry configuration
SCHEMA_REGISTRY_URL = "http://schema-registry.example.com:8081"

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

def get_schema(subject, version='latest'):
    """Get a schema from Schema Registry"""
    url = f"{SCHEMA_REGISTRY_URL}/subjects/{subject}/versions/{version}"
    try:
        response = requests.get(url, timeout=10)
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to connect to Schema Registry: {e}")
        return None

    if response.status_code == 200:
        return response.json()
    else:
        print(f"✗ Failed to get schema for subject '{subject}'")
        print(f"  Status: {response.status_code}")
        return None

def list_subjects():
    """List all registered subjects"""
    url = f"{SCHEMA_REGISTRY_URL}/subjects"
    try:
        response = requests.get(url, timeout=10)
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
    print("=== Schema Registry - Schema Registration ===\n")

    try:
        # Register User schema
        print("1. Registering User schema...")
        user_schema_id = register_schema("users-value", "schemas/user.avsc")

        print()

        # Register Order schema
        print("2. Registering Order schema...")
        order_schema_id = register_schema("orders-value", "schemas/order.avsc")

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
