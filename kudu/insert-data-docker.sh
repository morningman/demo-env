#!/bin/bash

set -e

echo "Preparing to insert sample data..."

# Create Dockerfile with insertion script
cat > Dockerfile.insert <<'EOF'
FROM python:3.9-slim

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y gcc g++ libsasl2-dev && \
    rm -rf /var/lib/apt/lists/*

# Install kudu-python
RUN pip install --no-cache-dir Cython==0.29.37 && \
    pip install --no-cache-dir kudu-python || \
    echo "Trying alternative installation..." && \
    pip install --no-cache-dir git+https://github.com/apache/kudu.git@master#subdirectory=python || \
    echo "Using mock data insertion"

WORKDIR /app
COPY insert-data-simple.py /app/

CMD ["python", "insert-data-simple.py"]
EOF

# Create simplified insertion script
cat > insert-data-simple.py <<'PYEOF'
#!/usr/bin/env python3
import kudu
from datetime import datetime
import sys

def insert_data():
    try:
        # Connect to Kudu (using container hostname)
        print("Connecting to Kudu Master...")
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
        print(f"✓ Successfully inserted {len(data1)} records into test.tbl1")

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
        print(f"✓ Successfully inserted {len(data2)} records into test.tbl2")

        # Verify inserted data
        print("\nVerifying data...")
        scanner = table1.scanner().open()
        count1 = sum(1 for _ in scanner)
        print(f"test.tbl1: {count1} records")

        scanner = table2.scanner().open()
        count2 = sum(1 for _ in scanner)
        print(f"test.tbl2: {count2} records")

        print("\n✓ Data insertion complete!")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    insert_data()
PYEOF

# Build image
echo "Building data insertion image..."
sudo docker build -f Dockerfile.insert -t kudu-insert:latest . 2>&1 | tail -20

# Run insertion container
echo ""
echo "Running data insertion..."
sudo docker run --rm --network kudu_kudu-network kudu-insert:latest

# Clean up temporary files
rm -f Dockerfile.insert insert-data-simple.py

echo ""
echo "✓ Data insertion complete!"
