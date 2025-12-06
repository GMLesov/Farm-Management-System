#!/bin/bash
# Render Build Script

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Verifying build output..."
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful: dist/index.js found"
    ls -la dist/
else
    echo "❌ Build failed: dist/index.js not found"
    exit 1
fi
