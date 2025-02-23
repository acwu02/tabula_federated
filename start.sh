#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    source .env
else
    echo ".env file not found!"
    exit 1
fi

# Define the bootstrap port
bootstrapPort=${BOOTSTRAP_PORT:-8000}

# Define the start and end node ports
startNodePort=${START_NODE_PORT:-8001}
endNodePort=${END_NODE_PORT:-8005}

# Create user nodes
for ((port=startNodePort; port<=endNodePort; port++)); do
    echo "Creating user node on port $port..."
    curl "http://localhost:$bootstrapPort/create_node"
    if [ $? -ne 0 ]; then
        echo "Failed to create user node on port $port."
        exit 1
    fi
done

# Start the relay
echo "Starting the relay..."
go run relay.go