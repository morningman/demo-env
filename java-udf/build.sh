#!/bin/bash
set -e

# Set MAVEN_OPTS if needed, e.g., for proxy or mirror settings
# export MAVEN_OPTS="-Dhttp.proxyHost=proxy.example.com -Dhttp.proxyPort=8080"

echo "Building Doris Java UDF..."

# Check if mvn is installed
if ! command -v mvn &> /dev/null
then
    echo "mvn command could not be found. Please install Maven first."
    exit 1
fi

# Clean and package using Maven
mvn clean package

if [ $? -eq 0 ]; then
    echo "Build successful! The jar is located at target/doris-java-udf-demo.jar"
else
    echo "Build failed."
    exit 1
fi
