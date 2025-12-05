#!/bin/bash
# Quick Test Script for Pinata Fix
# Run this to verify photos and videos can upload to Pinata

echo "🚀 Justice Chain - Pinata Upload Fix Test"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo "Please run this script from the backend directory:"
  echo "  cd backend"
  exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "⚠️  Warning: .env file not found"
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo ""
  echo "📝 Please edit .env and add your Pinata API keys:"
  echo "  PINATA_API_KEY=your_key_here"
  echo "  PINATA_SECRET_API_KEY=your_secret_here"
  echo ""
  echo "Get keys from: https://www.pinata.cloud/keys"
  exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Run the Pinata test
echo "🔍 Testing Pinata Connection..."
echo ""
node test-pinata.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Pinata is properly configured!"
  echo ""
  echo "Next steps:"
  echo "1. Start the backend: npm start"
  echo "2. Open FileFIR form in browser"
  echo "3. Upload a photo or video"
  echo "4. Files should save to Pinata IPFS"
  echo ""
else
  echo ""
  echo "❌ Pinata test failed"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check your API keys at https://www.pinata.cloud/keys"
  echo "2. Make sure keys are correct in .env file"
  echo "3. Verify Pinata account is active"
  echo ""
fi
