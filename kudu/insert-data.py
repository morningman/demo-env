#!/usr/bin/env python3
"""
Insert sample data into Kudu tables
Requires: pip install kudu-python
"""

import kudu
from datetime import datetime

def insert_data():
    try:
        # Connect to Kudu
        client = kudu.connect(host='localhost', port=7051)

        # Insert data into test.tbl1
        print("Inserting data into test.tbl1...")
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
        print(f"✓ Inserted {len(data1)} records into test.tbl1")

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
        print(f"✓ Inserted {len(data2)} records into test.tbl2")

        # Verify data
        print("\nVerifying data...")
        scanner = table1.scanner().open()
        count1 = sum(1 for _ in scanner)
        print(f"test.tbl1: {count1} records")

        scanner = table2.scanner().open()
        count2 = sum(1 for _ in scanner)
        print(f"test.tbl2: {count2} records")

        print("\n✓ Data insertion complete!")

    except ImportError:
        print("Error: kudu-python is not installed")
        print("Please run: pip install kudu-python")
        exit(1)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == '__main__':
    insert_data()
