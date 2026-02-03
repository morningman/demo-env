#!/bin/bash

echo "Installing Kudu Python client..."

# Check if already installed
if python3 -c "import kudu" 2>/dev/null; then
    echo "✓ kudu-python is already installed"
    python3 -c "import kudu; print(f'Version: {kudu.__version__}')"
    exit 0
fi

# Install kudu-python
echo "Installing kudu-python..."

# Check if pip3 is available
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed"
    echo "Please install pip3 first: sudo apt-get install python3-pip"
    exit 1
fi

# Install
pip3 install kudu-python

if [ $? -eq 0 ]; then
    echo "✓ kudu-python installed successfully!"
    python3 -c "import kudu; print(f'Version: {kudu.__version__}')"
else
    echo "Installation failed, please run manually: pip3 install kudu-python"
    exit 1
fi
