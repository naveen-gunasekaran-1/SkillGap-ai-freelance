# iOS and Android Setup Guide for SkillGap AI Mobile App

This guide will help you set up and run the SkillGap AI mobile app on both iOS and Android platforms.

## Prerequisites

### For Both Platforms
- **Node.js**: v18 or higher (check with `node -v`)
- **pnpm**: v8 or higher (check with `pnpm -v`)

### For Android
- **Android Studio**: Latest version (with Android SDK 34, NDK 26.1.10909125)
- **Android SDK**: API level 34 (build tools 34.0.0)
- **JDK**: Java 11+ (included with Android Studio)
- **Environment Variables**:
  ```bash
  export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/platform-tools
  ```

### For iOS
- **Xcode**: Latest version (14.0+)
- **iOS SDK**: 16.0+
- **Cocoapods**: v1.11+ (install with: `sudo gem install cocoapods`)
- **Mac**: Apple Silicon (M1/M2) or Intel processor

## Installation Steps

### 1. Install Project Dependencies

```bash
cd /Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI
pnpm install
```

This installs all workspace dependencies including the mobile app.

### 2. Navigate to Mobile App

```bash
cd apps/mobile
```

### 3. Set Up Environment Variables

Create a `.env` file in the mobile app directory:

```bash
cp .env.example .env
```

Then edit `.env` and set your API URL:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Running on Android

### Option A: Using Expo CLI (Faster for Development)

```bash
# Start the development server
pnpm dev

# In another terminal, run:
pnpm android
```

This will:
- Start the Metro bundler
- Automatically detect connected Android devices or running emulator
- Build and install the APK
- Launch the app

### Option B: Using Android Studio Emulator

1. **Start the Android Emulator**:
   - Open Android Studio
   - Go to Tools → Device Manager
   - Create or select an emulator (API 34 recommended)
   - Click Play to start

2. **Run the app**:
   ```bash
   pnpm android
   ```

### Option C: Using a Physical Device

1. **Enable Developer Mode**: 
   - Go to Settings → About Phone → Tap "Build number" 7 times
   - Go to Settings → Developer Options → Enable USB Debugging

2. **Connect device via USB**:
   ```bash
   adb devices  # Verify device is detected
   ```

3. **Run the app**:
   ```bash
   pnpm android
   ```

## Running on iOS

### Option A: Using Expo CLI (Faster for Development)

```bash
# Start the development server
pnpm dev

# In another terminal, run:
pnpm ios
```

This will:
- Start the Metro bundler
- Build the iOS app
- Launch the iOS Simulator automatically

### Option B: Using Xcode

1. **Generate iOS native project** (first time only):
   ```bash
   pnpm prebuild --clean
   ```

2. **Install Pod dependencies**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Open in Xcode**:
   ```bash
   open ios/SkillgapAi.xcworkspace
   ```

4. **Build and Run**:
   - Select a simulator or device from the top menu
   - Press Cmd + R or click Play button

### Option C: Using Physical Device

1. **Connect iPhone via USB**
2. **Trust the computer** on the device
3. Run:
   ```bash
   pnpm ios
   ```

## Development Commands

```bash
# Start development server (shows QR code)
pnpm dev

# Build and run on Android
pnpm android

# Build and run on iOS
pnpm ios

# Build for web
pnpm web

# Type check the project
pnpm typecheck

# Clean build artifacts
rm -rf ios android dist
pnpm prebuild --clean
```

## Troubleshooting

### Android Issues

**Error: "Android SDK not found"**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
```

**Error: "No emulator running"**
```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd <emulator_name>
```

**Error: "Gradle build failed"**
```bash
cd apps/mobile/android
./gradlew clean
cd ..
pnpm android
```

### iOS Issues

**Error: "Pod install failed"**
```bash
cd ios
pod install --repo-update
cd ..
pnpm ios
```

**Error: "Xcode build settings not found"**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pnpm prebuild --clean
pnpm ios
```

**Error: "No signing certificate"**
- Open Xcode: `open ios/SkillgapAi.xcworkspace`
- Select SkillgapAi project in the sidebar
- Select a target (SkillgapAi)
- Go to Signing & Capabilities
- Select your Apple ID and let Xcode auto-provision

### General Issues

**Clear cache and rebuild**:
```bash
rm -rf node_modules .pnpm-store
pnpm install
pnpm prebuild --clean
pnpm android  # or pnpm ios
```

**Metro cache issues**:
```bash
pnpm dev --reset-cache
```

## Project Configuration

The app is already configured for both platforms in `app.config.ts`:

```typescript
export default {
  expo: {
    name: 'SkillGap AI',
    slug: 'skillgap-ai',
    platforms: ['ios', 'android', 'web'],
    android: {
      package: 'com.anonymous.skillgapai',
    },
    ios: {
      bundleIdentifier: 'com.anonymous.skillgapai',
    },
    // ...
  },
};
```

## Next Steps

1. **Install dependencies**: `pnpm install`
2. **Set environment variables**: Create `.env` file
3. **Start development**: `pnpm dev`
4. **Choose platform**: `pnpm android` or `pnpm ios`
5. **Hot reload**: Changes auto-refresh during development

## Testing Both Platforms

To test on both platforms simultaneously:

**Terminal 1** - Start dev server:
```bash
cd apps/mobile
pnpm dev
```

**Terminal 2** - Run on Android:
```bash
cd apps/mobile
pnpm android
```

**Terminal 3** - Run on iOS:
```bash
cd apps/mobile
pnpm ios
```

The development server supports multiple connected devices/emulators.

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Android Setup Guide](https://reactnative.dev/docs/environment-setup)
- [iOS Setup Guide](https://reactnative.dev/docs/environment-setup)
