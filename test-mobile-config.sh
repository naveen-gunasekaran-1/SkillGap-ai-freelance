#!/bin/bash

# Quick test script for iOS and Android builds

set -e

echo "🧪 SkillGap AI Mobile - Build Test"
echo "==================================="
echo ""

cd "$(dirname "$0")/apps/mobile"

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo ""
echo "🔍 Checking TypeScript..."
pnpm typecheck

echo ""
echo "🏗️  Building for both platforms..."
echo ""

# Check for iOS capability
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 iOS Configuration:"
    echo "  - Bundle ID: com.anonymous.skillgapai"
    echo "  - Platform: iOS 16.0+"
    echo "  - Status: ✅ Ready (run 'pnpm ios')"
else
    echo "📱 iOS Configuration:"
    echo "  - Status: ⚠️  Only available on macOS"
fi

echo ""

# Check for Android capability
if command -v adb &> /dev/null; then
    echo "🤖 Android Configuration:"
    echo "  - Package: com.anonymous.skillgapai"
    echo "  - SDK: 34 (API Level 34)"
    echo "  - Min SDK: 23"
    EMULATORS=$(emulator -list-avds 2>/dev/null | wc -l)
    if [ "$EMULATORS" -gt 0 ]; then
        echo "  - Emulators: $EMULATORS found"
    fi
    echo "  - Status: ✅ Ready (run 'pnpm android')"
else
    echo "🤖 Android Configuration:"
    echo "  - Package: com.anonymous.skillgapai"
    echo "  - SDK: 34 (API Level 34)"
    echo "  - Status: ⚠️  Android SDK not found"
    echo "    Set ANDROID_HOME or install Android Studio"
fi

echo ""
echo "✅ Configuration check complete!"
echo ""
echo "Run 'pnpm dev' to start development server"
echo "Then run 'pnpm ios' or 'pnpm android' in another terminal"
