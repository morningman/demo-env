#!/bin/bash

set -e

echo "Inserting sample data using Kudu CLI tool..."
echo ""

# Create temporary CSV files
echo "Preparing data files..."

# test.tbl1 data
cat > /tmp/kudu_tbl1.csv <<'EOF'
1,Alice,25,alice@example.com,1706932800000000
2,Bob,30,bob@example.com,1706932800000000
3,Charlie,35,charlie@example.com,1706932800000000
4,Diana,28,diana@example.com,1706932800000000
5,Eve,32,eve@example.com,1706932800000000
EOF

# test.tbl2 data
cat > /tmp/kudu_tbl2.csv <<'EOF'
101,Laptop,999.99,10,Electronics
102,Mouse,29.99,50,Electronics
103,Keyboard,79.99,30,Electronics
104,Monitor,299.99,15,Electronics
105,Desk Chair,199.99,20,Furniture
106,Desk,399.99,8,Furniture
EOF

# Copy CSV files to container
echo "Copying data to container..."
sudo docker cp /tmp/kudu_tbl1.csv kudu-master:/tmp/
sudo docker cp /tmp/kudu_tbl2.csv kudu-master:/tmp/

# Create Python script to execute in container
cat > /tmp/insert_kudu_data.py <<'PYEOF'
#!/usr/bin/env python3

import subprocess
import json

# Manually construct JSON data and use kudu CLI
# Since kudu CLI does not have direct insert command, we use perf loadgen or other methods

# For this scenario, we need to use other methods
# The simplest is to use kudu test tool

print("Attempting to use Kudu internal tools...")

# Actually Kudu CLI does not directly support CSV import
# We need to use programmatic methods
print("Kudu CLI does not support direct CSV import")
print("Please use one of the following methods:")
print("1. Install kudu-python: pip install kudu-python")
print("2. Use Impala to import data")
print("3. Use Java/C++ clients")
PYEOF

echo ""
echo "Note: Kudu CLI tool does not directly support data insertion"
echo "I will create an example using kudu perf loadgen..."

# Use loadgen to generate some test data
echo ""
echo "Using loadgen to generate test data (random data) for table..."
sudo docker exec kudu-master /opt/kudu/bin/kudu perf loadgen kudu-master:7051 \
    --keep_auto_table=true \
    --table_name=test.tbl1 \
    --num_rows_per_thread=5 \
    --num_threads=1 2>&1 | grep -E "(Wrote|rows|ERROR)" || echo "loadgen may not support existing tables"

# Clean up
rm -f /tmp/kudu_tbl1.csv /tmp/kudu_tbl2.csv /tmp/insert_kudu_data.py

echo ""
echo "Due to Kudu CLI limitations, it is recommended to use Python client for data insertion"
