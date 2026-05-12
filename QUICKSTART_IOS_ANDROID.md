# 🚀 Quick Start - iOS & Android

## TL;DR - Get Running in 3 Minutes

### Prerequisites
- macOS (for iOS development)
- [Node.js](https://nodejs.org) 18+ 
- [pnpm](https://pnpm.io): `npm install -g pnpm`
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835) (from App Store)
- [Android Studio](https://developer.android.com/studio) with SDK 34

### Step 1: Install & Setup
```bash
cd /Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI
./setup-mobile.sh
cd apps/mobile
cp .env.example .env
```

### Step 2: Start Development Server
```bash
# Terminal 1
pnpm dev
```

### Step 3: Run on Your Platform
```bash
# Terminal 2 - Choose one:
pnpm ios     # iOS Simulator
pnpm android # Android Emulator
```

That's it! 🎉

---

## Detailed Setup by Platform

### 🍎 iOS Setup (macOS Only)

**Option A: Quickest Way** (Recommended for first-time)
```bash
cd apps/mobile
pnpm ios
# Expo handles everything automatically!
```

**Option B: Manual Setup** (If Option A has issues)
```bash
cd apps/mobile
pnpm prebuild:ios
cd ios
pod install
cd ..
open ios/SkillgapAi.xcworkspace
# Then press Cmd+R to build and run
```

**Launch on Real iPhone**:
1. Connect iPhone via USB
2. Trust the computer
3. Run: `pnpm ios`

---

### 🤖 Android Setup

**Option A: Quickest Way** (Recommended)
```bash
cd apps/mobile
pnpm android
# Expo handles building and launching!
```

**Option B: Using Android Studio Emulator**
1. Open Android Studio
2. Go to **Device Manager** → Create/Start an emulator
3. Run: `pnpm android`

**Launch on Real Device**:
1. Enable USB Debugging:
   - Settings → About Phone → Tap "Build number" 7x
   - Settings → Developer Options → USB Debugging ON
2. Connect via USB
3. Run: `pnpm android`

---

## Available Commands

```bash
# Development
pnpm dev              # Start Metro bundler (required first)
pnpm ios              # Build & run iOS
pnpm android          # Build & run Android
pnpm web              # Run web version

# Build for Production
pnpm prebuild:ios     # Generate iOS native project
pnpm prebuild:android # Generate Android native project
pnpm build:ios        # Build production iOS (requires EAS)
pnpm build:android    # Build production Android (requires EAS)

# Utilities
pnpm typecheck        # Check TypeScript errors
pnpm dev --reset-cache # Clear Metro cache if issues
```

---

## Troubleshooting

### "Cannot find simulator"
```bash
# List available iOS simulators
xcrun simctl list devices

# Start a specific simulator
xcrun simctl boot "iPhone 15"
pnpm ios
```

### "Metro bundler not responding"
```bash
# Kill old process
lsof -ti:8081 | xargs kill -9
# Try again
pnpm dev
```

### "Android build failed"
```bash
cd apps/mobile/android
./gradlew clean
cd ..
pnpm android
```

### "Pod install failed"
```bash
cd apps/mobile/ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
pnpm ios
```

---

## Development Workflow

```
Terminal 1          Terminal 2
┌──────────────┐    ┌──────────────┐
│  pnpm dev    │ ─→ │  pnpm ios    │
│              │    │              │
│  Metro starts│    │ iOS launches │
│  Shows QR    │    │              │
└──────────────┘    └──────────────┘
      ↓
Edit files → Auto-reload in app
Ctrl+C to stop
```

---

## Testing Both Simultaneously

```bash
# Terminal 1: Start server
pnpm dev

# Terminal 2: iOS
pnpm ios

# Terminal 3: Android
pnpm android
```

Both devices will get hot reload updates! 🔄

---

## Hot Reload Tips

- **Edit & Save**: Changes appear instantly
- **Press `R`**: Manual reload
- **Press `I`**: Focus iOS
- **Press `A`**: Focus Android
- **Press `D`**: Developer menu (iOS) / Shake (Android)

---

## Environment Configuration

Create `.env` in `apps/mobile/`:
```bash
# Point to your backend
EXPO_PUBLIC_API_URL=http://localhost:3001
```

For networking:
- **Local development**: `http://localhost:3001` (IP address on Android)
- **Production**: Your actual backend URL

---

## Next Steps

1. ✅ Complete initial setup
2. 📖 Read [SETUP_IOS_ANDROID.md](./SETUP_IOS_ANDROID.md) for detailed guide
3. 💡 Check [MOBILE_DEVELOPMENT_TIPS.md](./MOBILE_DEVELOPMENT_TIPS.md) for best practices
4. 🧪 Run `./test-mobile-config.sh` to verify setup
5. 🚀 Start building!

---

## Documentation

- **Setup Guide**: [SETUP_IOS_ANDROID.md](./SETUP_IOS_ANDROID.md)
- **Development Tips**: [MOBILE_DEVELOPMENT_TIPS.md](./MOBILE_DEVELOPMENT_TIPS.md)
- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/

---

## Getting Help

Run the test script to check your setup:
```bash
./test-mobile-config.sh
```

Check these files for detailed troubleshooting:
1. [SETUP_IOS_ANDROID.md](./SETUP_IOS_ANDROID.md#troubleshooting)
2. [MOBILE_DEVELOPMENT_TIPS.md](./MOBILE_DEVELOPMENT_TIPS.md#common-issues--solutions)

---

**Happy coding! 🎊**

Questions? Check the docs or run `./test-mobile-config.sh` to diagnose issues.
