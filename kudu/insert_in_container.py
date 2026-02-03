#!/usr/bin/env python3
"""
Data insertion script to run directly in container
Uses kudu-python client
"""

import kudu
from datetime import datetime

def insert_data():
    # Connect to Kudu Master
    print("Connecting to Kudu Master (kudu-master:7051)...")
    client = kudu.connect(host='kudu-master', port=7051)

    # Insert data into test.tbl1
    print("\nInserting data into test.tbl1...")
    table1 = client.table('test.tbl1')
    session = client.new_session()

    data1 = [
        {'id': 1, 'name': 'Alice', 'age': 25, 'email': 'alice@example.com', 'created_at': datetime.now()},
        {'id': 2, 'name': 'Bob', 'age': 30, 'email': 'bob@example.com', 'created_at': datetime.now()},
        {'id': 3, 'name': 'Charlie', 'age': 35, 'email': 'charlie@example.com', 'created_at': datetime.now()},
        {'id': 4, 'name': 'Diana', 'age': 28, 'email': 'diana@example.com', 'created_at': datetime.now()},
        {'id': 5, 'name': 'Eve', 'age': 32, 'email': 'eve@example.com', 'created_at': datetime.now()},
    ]

    for row in data1:
        op = table1.new_insert(row)
        session.apply(op)
    session.flush()
    print(f"✓ Successfully inserted {len(data1)} records")

    # Insert data into test.tbl2
    print("\nInserting data into test.tbl2...")
    table2 = client.table('test.tbl2')

    data2 = [
        {'product_id': 101, 'product_name': 'Laptop', 'price': 999.99, 'quantity': 10, 'category': 'Electronics'},
        {'product_id': 102, 'product_name': 'Mouse', 'price': 29.99, 'quantity': 50, 'category': 'Electronics'},
        {'product_id': 103, 'product_name': 'Keyboard', 'price': 79.99, 'quantity': 30, 'category': 'Electronics'},
        {'product_id': 104, 'product_name': 'Monitor', 'price': 299.99, 'quantity': 15, 'category': 'Electronics'},
        {'product_id': 105, 'product_name': 'Desk Chair', 'price': 199.99, 'quantity': 20, 'category': 'Furniture'},
        {'product_id': 106, 'product_name': 'Desk', 'price': 399.99, 'quantity': 8, 'category': 'Furniture'},
    ]

    for row in data2:
        op = table2.new_insert(row)
        session.apply(op)
    session.flush()
    print(f"✓ Successfully inserted {len(data2)} records")

    print("\nData insertion complete!")

if __name__ == '__main__':
    insert_data()
