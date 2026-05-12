#!/bin/bash

# SkillGap AI Mobile - iOS & Android Setup Script

set -e

echo "🚀 SkillGap AI Mobile Setup"
echo "============================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm
fi
echo "✅ pnpm $(pnpm -v)"

if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v xcode-select &> /dev/null; then
        echo "❌ Xcode not found. Please install from App Store"
        exit 1
    fi
    echo "✅ Xcode found"
fi

if ! command -v adb &> /dev/null; then
    echo "⚠️  Android SDK not found in PATH"
    echo "   Set: export ANDROID_HOME=~/Library/Android/sdk"
    echo "   Or install Android Studio"
fi

echo ""
echo "📦 Installing dependencies..."
cd "$(dirname "$0")"

# Install root dependencies
pnpm install

# Install mobile dependencies
cd apps/mobile
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "==========="
echo ""
echo "1. Create .env file:"
echo "   cp .env.example .env"
echo ""
echo "2. Start development server:"
echo "   pnpm dev"
echo ""
echo "3. In another terminal, run:"
echo "   pnpm ios    # For iOS Simulator"
echo "   pnpm android # For Android Emulator"
echo ""
echo "📚 For detailed setup guide, see: SETUP_IOS_ANDROID.md"
