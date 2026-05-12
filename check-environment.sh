#!/bin/bash

# SkillGap AI - Environment Setup Helper
# Run this to verify and set up your development environment

echo "🔧 SkillGap AI Development Environment Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 found: $($1 --version 2>&1 | head -n1)"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        return 1
    fi
}

# Check macOS
echo -e "${YELLOW}System Information:${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${GREEN}✓${NC} macOS detected"
    sw_vers
else
    echo -e "${YELLOW}!${NC} Not running on macOS - iOS development will not be available"
fi
echo ""

# Check Essential Tools
echo -e "${YELLOW}Essential Tools:${NC}"
check_command "node"
NODE_OK=$?
check_command "pnpm"
PNPM_OK=$?
check_command "git"
echo ""

# Check Python (sometimes needed for native modules)
echo -e "${YELLOW}Optional Dependencies:${NC}"
check_command "python3"
echo ""

# Check iOS Development Tools (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}iOS Development Tools:${NC}"
    check_command "xcode-select"
    
    if xcode-select -p &> /dev/null; then
        echo -e "${GREEN}✓${NC} Xcode installation: $(xcode-select -p)"
    fi
    
    if command -v pod &> /dev/null; then
        echo -e "${GREEN}✓${NC} CocoaPods: $(pod --version)"
    else
        echo -e "${YELLOW}!${NC} CocoaPods not found - Install with: sudo gem install cocoapods"
    fi
    echo ""
fi

# Check Android Development Tools
echo -e "${YELLOW}Android Development Tools:${NC}"

if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
        echo -e "${YELLOW}!${NC} Setting ANDROID_HOME to: $ANDROID_HOME"
    fi
fi

if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✓${NC} ANDROID_HOME: $ANDROID_HOME"
    
    if command -v adb &> /dev/null; then
        echo -e "${GREEN}✓${NC} adb (Android Debug Bridge) found"
    else
        echo -e "${YELLOW}!${NC} adb not found - Add to PATH or install Android Studio"
    fi
    
    if command -v emulator &> /dev/null; then
        echo -e "${GREEN}✓${NC} emulator found"
        EMULATOR_COUNT=$(emulator -list-avds 2>/dev/null | grep -c '.')
        echo -e "${GREEN}  •${NC} Emulators available: $EMULATOR_COUNT"
    fi
else
    echo -e "${RED}✗${NC} ANDROID_HOME not set - Install Android Studio or set manually"
    echo "   Set: export ANDROID_HOME=\$HOME/Library/Android/sdk"
fi
echo ""

# Environment Variables
echo -e "${YELLOW}Environment Variables:${NC}"

if [ -n "$NODE_PATH" ]; then
    echo -e "${GREEN}✓${NC} NODE_PATH set"
else
    echo -e "${YELLOW}!${NC} NODE_PATH not set (optional)"
fi

if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✓${NC} ANDROID_HOME set"
else
    echo -e "${RED}✗${NC} ANDROID_HOME not set (required for Android)"
fi

echo ""

# Workspace Check
echo -e "${YELLOW}Workspace Status:${NC}"

WORKSPACE_PATH="/Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI"
if [ -d "$WORKSPACE_PATH" ]; then
    echo -e "${GREEN}✓${NC} Workspace found: $WORKSPACE_PATH"
    
    if [ -f "$WORKSPACE_PATH/pnpm-workspace.yaml" ]; then
        echo -e "${GREEN}✓${NC} pnpm workspace configured"
    fi
    
    if [ -f "$WORKSPACE_PATH/apps/mobile/package.json" ]; then
        echo -e "${GREEN}✓${NC} Mobile app found"
    fi
    
    if [ -f "$WORKSPACE_PATH/apps/mobile/.env" ]; then
        echo -e "${GREEN}✓${NC} .env file exists"
    else
        echo -e "${YELLOW}!${NC} .env file not found - Run: cp .env.example .env"
    fi
else
    echo -e "${RED}✗${NC} Workspace not found at: $WORKSPACE_PATH"
fi
echo ""

# Recommendations
echo -e "${YELLOW}Recommendations:${NC}"

if [ $NODE_OK -ne 0 ]; then
    echo "1. Install Node.js 18+: https://nodejs.org/"
fi

if [ $PNPM_OK -ne 0 ]; then
    echo "2. Install pnpm: npm install -g pnpm"
fi

if ! command -v pod &> /dev/null && [[ "$OSTYPE" == "darwin"* ]]; then
    echo "3. Install CocoaPods: sudo gem install cocoapods"
fi

if [ -z "$ANDROID_HOME" ]; then
    echo "4. Install Android Studio: https://developer.android.com/studio"
    echo "   Then set: export ANDROID_HOME=\$HOME/Library/Android/sdk"
fi

echo ""

# Setup Instructions
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Install dependencies: cd $WORKSPACE_PATH && pnpm install"
echo "2. Create .env file: cd apps/mobile && cp .env.example .env"
echo "3. Start dev server: pnpm dev"
echo "4. Run on platform: pnpm ios  (or  pnpm android)"
echo ""

# Final Status
echo -e "${YELLOW}Summary:${NC}"

READY=true
if [ $NODE_OK -ne 0 ] || [ $PNPM_OK -ne 0 ]; then
    READY=false
fi

if [ -z "$ANDROID_HOME" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${YELLOW}!${NC} Android not configured - iOS development only"
    fi
fi

if [ "$READY" = true ]; then
    echo -e "${GREEN}✓ Your development environment is ready!${NC}"
else
    echo -e "${RED}✗ Please install missing dependencies above${NC}"
fi

echo ""
echo "For detailed setup instructions, see: SETUP_IOS_ANDROID.md"
echo "For quick start, see: QUICKSTART_IOS_ANDROID.md"
