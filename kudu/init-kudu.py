#!/usr/bin/env python3
"""
Kudu table initialization script
Create test.tbl1 and test.tbl2 with sample data
"""

import kudu
from kudu.client import Partitioning
from datetime import datetime
import time
import os

def wait_for_kudu(master_addr, max_attempts=30):
    """Wait for Kudu service to become available"""
    print(f"Connecting to Kudu Master: {master_addr}")
    for attempt in range(max_attempts):
        try:
            client = kudu.connect(host=master_addr, port=7051)
            client.list_tables()
            print("Successfully connected to Kudu!")
            return client
        except Exception as e:
            if attempt < max_attempts - 1:
                print(f"Waiting for Kudu to be ready... ({attempt + 1}/{max_attempts})")
                time.sleep(2)
            else:
                raise Exception(f"Unable to connect to Kudu: {e}")

def create_table1(client):
    """Create test.tbl1 table"""
    table_name = 'test.tbl1'

    # Check if table already exists
    if client.table_exists(table_name):
        print(f"Table {table_name} already exists, deleting and recreating...")
        client.delete_table(table_name)

    # Define table schema
    schema_builder = kudu.schema_builder()
    schema_builder.add_column('id', kudu.int32, nullable=False)
    schema_builder.add_column('name', kudu.string, nullable=True)
    schema_builder.add_column('age', kudu.int32, nullable=True)
    schema_builder.add_column('email', kudu.string, nullable=True)
    schema_builder.add_column('created_at', kudu.unixtime_micros, nullable=True)
    schema_builder.set_primary_keys(['id'])
    schema = schema_builder.build()

    # Define partitioning strategy - hash partitioning
    partitioning = Partitioning().add_hash_partitions(column_names=['id'], num_buckets=3)

    # Create table
    client.create_table(table_name, schema, partitioning)
    print(f"Table {table_name} created successfully")

    return table_name

def create_table2(client):
    """Create test.tbl2 table"""
    table_name = 'test.tbl2'

    # Check if table already exists
    if client.table_exists(table_name):
        print(f"Table {table_name} already exists, deleting and recreating...")
        client.delete_table(table_name)

    # Define table schema
    schema_builder = kudu.schema_builder()
    schema_builder.add_column('product_id', kudu.int32, nullable=False)
    schema_builder.add_column('product_name', kudu.string, nullable=True)
    schema_builder.add_column('price', kudu.double, nullable=True)
    schema_builder.add_column('quantity', kudu.int32, nullable=True)
    schema_builder.add_column('category', kudu.string, nullable=True)
    schema_builder.set_primary_keys(['product_id'])
    schema = schema_builder.build()

    # Define partitioning strategy - hash partitioning
    partitioning = Partitioning().add_hash_partitions(column_names=['product_id'], num_buckets=3)

    # Create table
    client.create_table(table_name, schema, partitioning)
    print(f"Table {table_name} created successfully")

    return table_name

def insert_data_tbl1(client, table_name):
    """Insert sample data into test.tbl1"""
    table = client.table(table_name)
    session = client.new_session()

    # Sample data
    data = [
        {'id': 1, 'name': 'Alice', 'age': 25, 'email': 'alice@example.com', 'created_at': datetime.now()},
        {'id': 2, 'name': 'Bob', 'age': 30, 'email': 'bob@example.com', 'created_at': datetime.now()},
        {'id': 3, 'name': 'Charlie', 'age': 35, 'email': 'charlie@example.com', 'created_at': datetime.now()},
        {'id': 4, 'name': 'Diana', 'age': 28, 'email': 'diana@example.com', 'created_at': datetime.now()},
        {'id': 5, 'name': 'Eve', 'age': 32, 'email': 'eve@example.com', 'created_at': datetime.now()},
    ]

    # Insert data
    for row in data:
        op = table.new_insert(row)
        session.apply(op)

    session.flush()
    print(f"Inserted {len(data)} records into {table_name}")

def insert_data_tbl2(client, table_name):
    """Insert sample data into test.tbl2"""
    table = client.table(table_name)
    session = client.new_session()

    # Sample data
    data = [
        {'product_id': 101, 'product_name': 'Laptop', 'price': 999.99, 'quantity': 10, 'category': 'Electronics'},
        {'product_id': 102, 'product_name': 'Mouse', 'price': 29.99, 'quantity': 50, 'category': 'Electronics'},
        {'product_id': 103, 'product_name': 'Keyboard', 'price': 79.99, 'quantity': 30, 'category': 'Electronics'},
        {'product_id': 104, 'product_name': 'Monitor', 'price': 299.99, 'quantity': 15, 'category': 'Electronics'},
        {'product_id': 105, 'product_name': 'Desk Chair', 'price': 199.99, 'quantity': 20, 'category': 'Furniture'},
        {'product_id': 106, 'product_name': 'Desk', 'price': 399.99, 'quantity': 8, 'category': 'Furniture'},
    ]

    # Insert data
    for row in data:
        op = table.new_insert(row)
        session.apply(op)

    session.flush()
    print(f"Inserted {len(data)} records into {table_name}")

def verify_data(client, table_name):
    """Verify data in table"""
    table = client.table(table_name)
    scanner = table.scanner()
    scanner.open()

    count = 0
    print(f"\nData in table {table_name}:")
    print("-" * 80)
    for row in scanner:
        print(row)
        count += 1
    print(f"Total: {count} records")
    print("-" * 80)

def main():
    """Main function"""
    try:
        # Read master address from environment variable, default to localhost
        master_host = os.environ.get('KUDU_MASTER', 'localhost')

        # Connect to Kudu
        client = wait_for_kudu(master_host)

        # Create tables
        print("\n=== Creating Tables ===")
        table1 = create_table1(client)
        table2 = create_table2(client)

        # Insert data
        print("\n=== Inserting Data ===")
        insert_data_tbl1(client, table1)
        insert_data_tbl2(client, table2)

        # Verify data
        print("\n=== Verifying Data ===")
        verify_data(client, table1)
        verify_data(client, table2)

        print("\n✓ Initialization complete!")
        print(f"\nAvailable tables:")
        for table in client.list_tables():
            print(f"  - {table}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == '__main__':
    main()
