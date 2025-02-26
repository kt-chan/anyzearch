#!/bin/bash

# Get the architecture of the machine
ARCH=$(uname -m)

# Check if the architecture is arm64 (aarch64)
if [ "$ARCH" = "aarch64" ]; then
    echo "Detected ARM64 architecture. Running build-arm64.sh..."
    ./build-arm64.sh
# Check if the architecture is x86_64
elif [ "$ARCH" = "x86_64" ]; then
    echo "Detected x86 architecture. Running build-x86.sh..."
    ./build-x86.sh
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi