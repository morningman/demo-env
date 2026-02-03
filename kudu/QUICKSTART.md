# Kudu Docker Quick Start Guide

## Environment Ready

Kudu Docker environment has been successfully set up and running!

### Current Status

- ✓ Kudu Master running
- ✓ Kudu Tablet Server running
- ✓ Tables created: test.tbl1 and test.tbl2

### Access URLs

- **Master Web UI**: http://localhost:8051
- **TServer Web UI**: http://localhost:18050
- **Master RPC**: localhost:7051 (for client connections)

### View Table Schemas

```bash
sudo docker exec kudu-master /opt/kudu/bin/kudu table describe kudu-master:7051 test.tbl1
sudo docker exec kudu-master /opt/kudu/bin/kudu table describe kudu-master:7051 test.tbl2
```

### Insert Sample Data (Optional)

If you need to insert test data, install kudu-python and run:

```bash
pip install kudu-python
python3 insert-data.py
```

### Connect to Kudu from Host

#### Python Example

```python
import kudu

# Connect to Kudu
client = kudu.connect(host='localhost', port=7051)

# List all tables
tables = client.list_tables()
print(tables)  # ['test.tbl1', 'test.tbl2']

# Query data
table = client.table('test.tbl1')
scanner = table.scanner().open()
for row in scanner:
    print(row)
```

### Common Commands

```bash
# Start environment
./start.sh

# Stop environment
./stop.sh

# Verify environment
./verify.sh

# Recreate tables
./init-kudu-cli.sh

# Insert sample data
python3 insert-data.py

# View container logs
sudo docker compose logs -f kudu-master
sudo docker compose logs -f kudu-tserver

# Complete cleanup (including data)
sudo docker compose down -v
```

### Created Tables

#### test.tbl1 (User Information Table)

| Column | Type | Description |
|--------|------|-------------|
| id | INT32 | Primary key |
| name | STRING | User name |
| age | INT32 | Age |
| email | STRING | Email |
| created_at | UNIXTIME_MICROS | Created timestamp |

#### test.tbl2 (Product Information Table)

| Column | Type | Description |
|--------|------|-------------|
| product_id | INT32 | Primary key |
| product_name | STRING | Product name |
| price | DOUBLE | Price |
| quantity | INT32 | Quantity |
| category | STRING | Category |

### Next Steps

1. Visit Web UI to check cluster status
2. Connect using Python client and manipulate data
3. See README.md for more detailed information

---

**Need help?** Check README.md or run `./verify.sh` to verify the environment.
