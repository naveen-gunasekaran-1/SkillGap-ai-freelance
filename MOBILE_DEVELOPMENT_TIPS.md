# SkillGap AI Mobile - iOS & Android Development Tips

## Platform-Specific Development

### iOS Development

#### Testing on iOS Simulator
```bash
# Start development server
pnpm dev

# In another terminal
pnpm ios
```

**Keyboard Shortcut in Simulator**:
- `Cmd + D` - Open developer menu
- `Cmd + R` - Reload app
- `Cmd + T` - Toggle slow animations
- `Cmd + 1/2` - Change device size

#### Running on Physical iPhone
1. Connect iPhone via USB
2. Trust the computer
3. Run: `pnpm ios`
4. Install TailwindCSS on device if using web version

#### iPad Support
The app supports iPad with `supportsTabletMode: true`. To test:
```bash
# In Simulator, go to File → Open Simulator → iPad Pro
pnpm ios
```

### Android Development

#### Testing on Android Emulator
```bash
# Start development server
pnpm dev

# In another terminal
pnpm android
```

**Common Emulator Issues**:
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_4_API_34

# Check connected devices
adb devices

# View logs
adb logcat
```

#### Running on Physical Device
1. Enable Developer Mode (tap Build number 7 times)
2. Enable USB Debugging in Developer Options
3. Connect via USB
4. Verify: `adb devices`
5. Run: `pnpm android`

### Hot Reload & Fast Refresh

Both iOS and Android support fast refresh:
- **Edit a file** → Changes appear instantly (in most cases)
- **Press `R`** in Metro bundler terminal to reload
- **Press `I`** for iOS, **`A`** for Android to focus on that platform

## Performance Optimization

### For iOS
- Use `expo run:ios --device <name>` for specific device
- Clear Xcode cache: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
- Update iOS deployment target if needed in Xcode

### For Android
- Use `--device <serial>` to target specific device
- Increase Gradle heap: `org.gradle.jvmargs=-Xmx2048m` (already set)
- Use API 34 emulator for best performance

## Debugging

### React Native Debugger
```bash
# Install globally
npm install -g react-native-debugger

# Open it, then enable in Metro menu (Cmd+D / Shake device)
```

### Hermes Debugger
- Built-in to Expo
- Open Metro menu: Cmd+D (iOS) or Shake gesture (Android)
- Select "Open Debugger"

### Logcat for Android
```bash
adb logcat | grep "SkillGap\|Metro"
```

### Console for iOS
- Open Xcode: `open ios/SkillgapAi.xcworkspace`
- Go to View → Navigators → Show Console
- See console output in real-time

## Building for Production

### iOS Production Build
```bash
# Generate production build
eas build -p ios

# Or locally using Xcode
cd ios
pod install
cd ..
open ios/SkillgapAi.xcworkspace
# Set code signing and build
```

### Android Production Build
```bash
# Generate production APK/AAB
eas build -p android

# Or locally
cd apps/mobile/android
./gradlew bundleRelease
# APK at: app/build/outputs/apk/release/
# AAB at: app/build/outputs/bundle/release/
```

## Testing Best Practices

### Test on Real Devices
- iOS: Test on actual iPhone (at least one model)
- Android: Test on at least 2-3 different Android versions

### Screen Size Testing
- iOS: iPhone 12, iPhone 14 Pro, iPad Pro
- Android: Pixel 3, Pixel 6 Pro, Samsung Galaxy

### Orientation Testing
```javascript
// In your component
import { useWindowDimensions } from 'react-native';

const { width, height } = useWindowDimensions();
```

### Platform-Specific Code
```javascript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}
```

## Common Issues & Solutions

### Metro Bundler Issues
```bash
# Reset Metro cache
pnpm dev --reset-cache

# Kill hanging processes
lsof -ti:8081 | xargs kill -9
```

### Pod Installation (iOS)
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Gradle Issues (Android)
```bash
cd android
./gradlew clean
cd ..
pnpm android
```

### Certificate Issues (iOS)
```bash
# Reset signing
rm -rf ~/Library/Keychains/login.keychain-db
# Xcode will regenerate automatically
```

### Emulator Performance
```bash
# Use hardware acceleration
emulator -avd Pixel_4_API_34 -gpu on

# Increase emulator RAM
# Edit: ~/.android/avd/Pixel_4_API_34/config.ini
# Set: hw.ramSize=4096
```

## Environment Variables

### Required
```bash
# .env file in apps/mobile
EXPO_PUBLIC_API_URL=http://your-api-server:3001
```

### Optional
```bash
# For Expo Build Service
EXPO_TOKEN=your_token_here

# For native builds
ANDROID_HOME=$HOME/Library/Android/sdk
ANDROID_SDK_ROOT=$ANDROID_HOME
```

## Useful Links

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Native Directory](https://reactnativeapi.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [TailwindCSS React Native](https://www.nativewind.dev/)
- [Zod Documentation](https://zod.dev/) (for schema validation)
- [Zustand Docs](https://github.com/pmndrs/zustand) (for state management)

## Development Workflow

1. **Start Server**: `pnpm dev` (shows QR code for scanning)
2. **Choose Platform**: `pnpm ios` or `pnpm android`
3. **Make Changes**: Edit code in your editor
4. **Hot Reload**: Changes appear automatically
5. **Debug**: Use developer menu (Cmd+D or Shake)
6. **Test**: Verify on multiple devices/emulators
7. **Build**: Run production build command when ready

## Tips & Tricks

- **Faster initial build**: Use API 34 Android emulator
- **Test offline**: Use Expo's offline mode
- **Share over network**: Scan QR code with device on same WiFi
- **View logs in real-time**: Use Xcode console or `adb logcat`
- **Reset app state**: Delete and reinstall on device
- **Profile performance**: Use React Native DevTools
