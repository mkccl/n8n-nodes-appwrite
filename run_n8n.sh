#!/bin/bash

# Navigate to n8n custom directory
cd ~/.n8n/custom || { echo "Cannot access ~/.n8n/custom"; exit 1; }

# Unlink old packages
npm unlink n8n-nodes-friendgrid 2>/dev/null
npm unlink n8n-nodes-appwrite 2>/dev/null

# Navigate to project directory
cd ~/n8n-nodes-friendgrid || cd "$PWD" || { echo "Cannot access project directory"; exit 1; }

# Clean build artifacts
rm -rf dist

# Build the project
npm run build

# Link the package globally
npm link

# Return to n8n custom directory
cd ~/.n8n/custom || { echo "Cannot access ~/.n8n/custom"; exit 1; }

# Link the new package name
npm link n8n-nodes-appwrite

# Start n8n
n8n start
