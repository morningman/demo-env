#!/bin/bash

set -e

echo "Initializing tables using Kudu CLI..."

# test.tbl1 JSON definition
TBL1_JSON='{
  "table_name": "test.tbl1",
  "schema": {
    "columns": [
      {"column_name": "id", "column_type": "INT32", "is_nullable": false},
      {"column_name": "name", "column_type": "STRING", "is_nullable": true},
      {"column_name": "age", "column_type": "INT32", "is_nullable": true},
      {"column_name": "email", "column_type": "STRING", "is_nullable": true},
      {"column_name": "created_at", "column_type": "UNIXTIME_MICROS", "is_nullable": true}
    ],
    "key_column_names": ["id"]
  },
  "partition": {
    "hash_partitions": [
      {"columns": ["id"], "num_buckets": 3}
    ]
  },
  "num_replicas": 1
}'

# test.tbl2 JSON definition
TBL2_JSON='{
  "table_name": "test.tbl2",
  "schema": {
    "columns": [
      {"column_name": "product_id", "column_type": "INT32", "is_nullable": false},
      {"column_name": "product_name", "column_type": "STRING", "is_nullable": true},
      {"column_name": "price", "column_type": "DOUBLE", "is_nullable": true},
      {"column_name": "quantity", "column_type": "INT32", "is_nullable": true},
      {"column_name": "category", "column_type": "STRING", "is_nullable": true}
    ],
    "key_column_names": ["product_id"]
  },
  "partition": {
    "hash_partitions": [
      {"columns": ["product_id"], "num_buckets": 3}
    ]
  },
  "num_replicas": 1
}'

# Delete old tables (if exist)
echo "Deleting old tables (if exist)..."
sudo docker exec kudu-master /opt/kudu/bin/kudu table delete kudu-master:7051 test.tbl1 2>/dev/null || true
sudo docker exec kudu-master /opt/kudu/bin/kudu table delete kudu-master:7051 test.tbl2 2>/dev/null || true

# Create test.tbl1
echo "Creating table test.tbl1..."
sudo docker exec kudu-master /opt/kudu/bin/kudu table create kudu-master:7051 "$TBL1_JSON"

# Create test.tbl2
echo "Creating table test.tbl2..."
sudo docker exec kudu-master /opt/kudu/bin/kudu table create kudu-master:7051 "$TBL2_JSON"

# List all tables
echo ""
echo "Created tables:"
sudo docker exec kudu-master /opt/kudu/bin/kudu table list kudu-master:7051

echo ""
echo "✓ Table creation complete!"
echo ""
echo "Note: kudu-python is not installed, cannot auto-insert sample data"
echo "You can insert data using one of these methods:"
echo "1. Install kudu-python and run: python3 init-kudu.py"
echo "2. Use other Kudu clients (e.g., Impala) to insert data"
echo "3. Use Kudu client libraries (Java, Python, C++, etc.)"
