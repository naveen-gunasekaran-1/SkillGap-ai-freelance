#!/bin/bash

# SkillGap AI Mobile - Build Release APK Script
# This script handles the Gradle environment properly for release builds

set -e

PROJECT_ROOT="/Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"
ANDROID_DIR="$MOBILE_DIR/android"

echo "🔨 Building SkillGap AI Release APK..."
echo "📍 Working directory: $ANDROID_DIR"

# Ensure Node is in PATH
export PATH="/opt/homebrew/bin:$PATH"
export NODE_PATH="/opt/homebrew/lib/node_modules"

# Navigate to Android directory
cd "$ANDROID_DIR"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release APK
echo "🏗️  Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    APK_SIZE=$(du -h "app/build/outputs/apk/release/app-release.apk" | cut -f1)
    echo "✅ Release APK built successfully!"
    echo "📦 File: $ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
    echo "📊 Size: $APK_SIZE"
else
    echo "❌ Release APK build failed!"
    exit 1
fi
