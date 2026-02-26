# Kafka Simple

A minimal standalone Kafka development environment with Docker. This directory contains everything needed to run a basic Kafka cluster independently.

## Quick Start

```bash
# Install dependencies
./simple-kafka.sh install-deps

# Start Kafka environment
./simple-kafka.sh start

# Send test messages
./simple-kafka.sh produce

# View messages
./simple-kafka.sh consume

# Stop environment
./simple-kafka.sh stop
```

## Directory Structure

```
kafka-simple/
├── README.md                    # This file
├── docker-compose-simple.yml    # Docker Compose config
├── simple-kafka.sh              # Management script
├── producer-simple.py           # Python producer
└── consumer-simple.py           # Python consumer
```

## Available Commands

| Command | Description |
|---------|-------------|
| `start` | Start Kafka environment |
| `stop` | Stop Kafka environment |
| `restart` | Restart Kafka environment |
| `clean` | Clean up environment and data |
| `status` | View container status |
| `logs` | View Kafka logs |
| `topic` | View topic information |
| `produce` | Run producer script |
| `consume` | Run consumer script |
| `interactive` | Interactive producer: create/enter topic, send messages line by line, Ctrl+D to exit |
| `browse` | Browse topic messages: list all topics, select one, read all messages (without updating offset) |
| `install-deps` | Install Python dependencies |
| `help` | Show help message |

## Environment Details

**Services:**
- Kafka Broker: localhost:9092
- Zookeeper: localhost:2181

**Pre-configured Topics:**
- `simple-topic` - 5 partitions
- `tp1.test1` - 3 partitions
- `TP1.TEST1` - 3 partitions

## Python Scripts

**producer-simple.py** - Sends test messages to all topics (3 messages per partition)

**consumer-simple.py** - Reads all messages from topics using a temporary consumer group

## Requirements

- Docker and Docker Compose
- Python 3.x
- kafka-python library

## Troubleshooting

Check if ports are in use:
```bash
sudo lsof -i :9092
sudo lsof -i :2181
```

View logs:
```bash
./simple-kafka.sh logs
```

Start fresh (clean all data):
```bash
./simple-kafka.sh clean && ./simple-kafka.sh start
```
