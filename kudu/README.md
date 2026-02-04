# Kudu Docker Environment

This is a quick-start Apache Kudu Docker environment with pre-configured tables and sample data.

## Environment Components

- **Kudu Master**: Metadata service and coordinator
- **Kudu Tablet Server**: Data storage service
- **Test Tables**: test.tbl1 and test.tbl2 with sample data

## Port Mappings

- `7051`: Kudu Master RPC (for client connections)
- `8051`: Kudu Master Web UI
- `7050`: Kudu Tablet Server RPC
- `18050`: Kudu Tablet Server Web UI (changed to 18050 to avoid conflicts with Doris)

## Quick Start

### 1. Start Environment

```bash
chmod +x start.sh stop.sh
./start.sh
```

The start script will:
- Start Kudu Master and Tablet Server
- Wait for services to be ready
- Automatically create test.tbl1 and test.tbl2 tables

### 2. Access Web UI

- Master UI: http://localhost:8051
- TServer UI: http://localhost:18050

### 3. Insert Sample Data (Optional)

If you need to insert sample data, install kudu-python and run:

```bash
pip install kudu-python
python3 insert-data.py
```

### 4. Verify Environment

```bash
./verify.sh
```

### 5. Stop Environment

```bash
./stop.sh
```

### 6. Complete Cleanup (Including Data)

```bash
docker-compose down -v
```

## Table Schemas

### test.tbl1 (User Information Table)

| Column | Type | Description |
|--------|------|-------------|
| id | INT32 | Primary key |
| name | STRING | User name |
| age | INT32 | Age |
| email | STRING | Email |
| created_at | UNIXTIME_MICROS | Created timestamp |

### test.tbl2 (Product Information Table)

| Column | Type | Description |
|--------|------|-------------|
| product_id | INT32 | Primary key |
| product_name | STRING | Product name |
| price | DOUBLE | Price |
| quantity | INT32 | Quantity |
| category | STRING | Category |

## Connect from Host

### Python Example

```python
import kudu

# Connect to Kudu
client = kudu.connect(host='localhost', port=7051)

# List all tables
tables = client.list_tables()
print(tables)

# Query table
table = client.table('test.tbl1')
scanner = table.scanner()
scanner.open()

for row in scanner:
    print(row)
```

### Install Python Client (Optional)

For inserting sample data or performing data operations:

```bash
pip install kudu-python
```

## Troubleshooting

### View Container Logs

```bash
docker-compose logs -f kudu-master
docker-compose logs -f kudu-tserver
```

### Check Service Status

```bash
docker-compose ps
```

### Re-initialize Data (Optional)

Create tables:
```bash
./init-kudu-cli.sh
```

Insert sample data (requires kudu-python):
```bash
python3 insert-data.py
```

## Notes

1. TServer Web UI port changed to 18050 to avoid conflicts with Doris port
2. Requires Docker and Docker Compose
3. Python data insertion scripts require kudu-python library (optional): `pip install kudu-python`
4. Data is persisted in Docker volumes, stopping containers will not lose data
5. All Docker commands are run with sudo to avoid permission issues

## Doris Catalog

```sql
CREATE CATALOG kudu PROPERTIES (
    'type' = 'trino-connector',
    'trino.connector.name' = 'kudu',
    'trino.kudu.client.master-addresses' = '172.20.32.136:7051',
    'trino.kudu.authentication.type' = 'NONE',
    'trino.kudu.schema-emulation.enabled' = 'true',
    'trino.kudu.schema-emulation.prefix' = ''
);
```
