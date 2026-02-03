#!/bin/bash

# Wait for KDC to start
sleep 5

# Create Kerberos principals
echo "Creating Kerberos principals..."

# Kafka broker principal
kadmin.local -q "addprinc -randkey kafka/kafka.example.com@EXAMPLE.COM"

# Zookeeper principal
kadmin.local -q "addprinc -randkey zookeeper/zookeeper.example.com@EXAMPLE.COM"

# Producer principal
kadmin.local -q "addprinc -pw producer123 producer@EXAMPLE.COM"

# Consumer principal
kadmin.local -q "addprinc -pw consumer123 consumer@EXAMPLE.COM"

# Admin principal
kadmin.local -q "addprinc -pw admin123 admin@EXAMPLE.COM"

# Generate keytabs
echo "Generating keytabs..."

# Kafka keytab
kadmin.local -q "xst -k /keytabs/kafka.keytab kafka/kafka.example.com@EXAMPLE.COM"

# Zookeeper keytab
kadmin.local -q "xst -k /keytabs/zookeeper.keytab zookeeper/zookeeper.example.com@EXAMPLE.COM"

# Producer keytab
kadmin.local -q "xst -k /keytabs/producer.keytab producer@EXAMPLE.COM"

# Consumer keytab
kadmin.local -q "xst -k /keytabs/consumer.keytab consumer@EXAMPLE.COM"

# Admin keytab
kadmin.local -q "xst -k /keytabs/admin.keytab admin@EXAMPLE.COM"

# Set permissions
chmod 644 /keytabs/*.keytab

echo "Principals and keytabs created successfully!"
echo ""
echo "=== Principal Information ==="
echo "Kafka Broker: kafka/kafka.example.com@EXAMPLE.COM"
echo "Zookeeper: zookeeper/zookeeper.example.com@EXAMPLE.COM"
echo "Producer: producer@EXAMPLE.COM (password: producer123)"
echo "Consumer: consumer@EXAMPLE.COM (password: consumer123)"
echo "Admin: admin@EXAMPLE.COM (password: admin123)"
echo ""
echo "Keytabs are located in /keytabs/"

# List all principals
echo ""
echo "=== All Principals ==="
kadmin.local -q "listprincs"
