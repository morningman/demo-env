#!/bin/bash

echo "======================================"
echo "  Kudu Environment Verification"
echo "======================================"
echo ""

# Check container status
echo "1. Checking container status..."
sudo docker compose ps

echo ""
echo "2. Checking Kudu Master..."
if curl -s http://localhost:8051 > /dev/null 2>&1; then
    echo "✓ Kudu Master is running"
    echo "   Web UI: http://localhost:8051"
else
    echo "✗ Kudu Master is not responding"
fi

echo ""
echo "3. Checking Kudu TServer..."
if curl -s http://localhost:18050 > /dev/null 2>&1; then
    echo "✓ Kudu TServer is running"
    echo "   Web UI: http://localhost:18050"
else
    echo "✗ Kudu TServer is not responding"
fi

echo ""
echo "4. Listing Kudu tables..."
sudo docker exec kudu-master /opt/kudu/bin/kudu table list kudu-master:7051

echo ""
echo "5. Viewing table schemas..."
echo ""
echo "test.tbl1:"
sudo docker exec kudu-master /opt/kudu/bin/kudu table describe kudu-master:7051 test.tbl1

echo ""
echo "test.tbl2:"
sudo docker exec kudu-master /opt/kudu/bin/kudu table describe kudu-master:7051 test.tbl2

echo ""
echo "======================================"
echo "  Verification Complete!"
echo "======================================"
