# SkillGap AI - Mobile App: Run & Build Guide

## 📱 Quick Start

### Prerequisites
- **Node.js** 20+ LTS installed
- **pnpm** package manager: `npm install -g pnpm`
- **Android SDK** installed (via Android Studio)
- **Android Emulator** or physical device with USB debugging enabled
- **Java 17** (already configured in this project)

---

## 🚀 Running the App on Android Emulator

### Step 1: Install Dependencies
```bash
cd /Users/naveengunasekaran/Desktop/PROJECTs/SkillGap-AI
pnpm install
```

### Step 2: Start Android Emulator
Open Android Studio and launch the **Pixel_6_Pro** emulator, or run:
```bash
emulator -avd Pixel_6_Pro &
```

### Step 3: Run the App
```bash
cd apps/mobile
pnpm android
```

This will:
- Build the APK
- Start Metro bundler (JavaScript bundler)
- Install the app on emulator
- Launch the app automatically

### Step 4: Navigate the App
- **Home Screen** → Shows SkillGap AI intro
- **Get Started →** → Go to registration
- **Sign In** → Go to login
- **🧪 Demo - Skip to Dashboard** → Jump to main app (for testing)

Once on dashboard, use bottom tabs:
- 📊 Dashboard - Overview & stats
- 💼 Jobs - Browse jobs with match scores
- 📋 Applications - Track your applications
- 👤 Profile - View your profile & skills

---

## 📦 Building APK (Release Build)

### Option 1: Quick Debug APK (Recommended for Testing)
```bash
cd apps/mobile
pnpm android
# APK is built automatically
```

The APK is located at:
```
apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 2: Release APK (For Distribution)
```bash
cd apps/mobile
./android/gradlew assembleRelease
```

The APK will be at:
```
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

> **Note:** Release APK requires signing configuration. For production, add your keystore to `android/app/build.gradle`.

---

## 📱 Installing APK on Device/Emulator

### Via Command Line
```bash
adb install apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### Via Android Studio
1. Open Android Studio
2. Go to **Build** → **Analyze APK**
3. Select the APK file
4. Click **Install** (if device is connected)

### Via File Manager (on Emulator)
1. Drag and drop the APK into the emulator window
2. Click **Install** when prompted

---

## 🔧 Common Commands

| Command | Description |
|---------|------------|
| `pnpm android` | Build and run app on emulator (dev mode) |
| `pnpm android --reset-cache` | Clean cache and rebuild |
| `./android/gradlew assembleDebug` | Build debug APK only |
| `./android/gradlew assembleRelease` | Build release APK only |
| `./android/gradlew clean` | Clean all build files |
| `adb logcat` | View app logs/errors |
| `adb shell am start -n com.anonymous.skillgapai/.MainActivity` | Launch app |

---

## 🧪 Testing Different Screens

### Demo Mode (No Login Required)
Click **"🧪 Demo - Skip to Dashboard"** on home screen to bypass authentication.

### Test Dashboard
- View overall match score (78%)
- See skills progress bars
- Check skill gaps section
- Read AI insights

### Test Jobs Screen
- Search jobs by title or company
- View match percentage for each job
- See verified badges
- Scroll through job listings

### Test Applications Tracker
- Filter applications by status
- See color-coded status badges
- View company and application dates

### Test Profile Screen
- View user info with avatar
- Check skills tags
- See stats (Applications, Interviews, Offers)
- Access settings menu

---

## 📊 Build Artifacts

After running `pnpm android`, you'll find:

```
apps/mobile/
├── android/app/build/outputs/
│   ├── apk/debug/app-debug.apk          ← Debug APK (for testing)
│   ├── apk/release/app-release.apk      ← Release APK (for store)
│   └── bundle/release/app.aab           ← Android App Bundle
└── build.log                             ← Build logs
```

---

## 🐛 Troubleshooting

### Issue: Build Fails with Java Version Error
**Solution:**
```bash
# Check Java version
java -version

# Should show: openjdk version "17.0.19"
# If not, Java 17 is not set in PATH
```

### Issue: Metro Bundler Fails
**Solution:**
```bash
# Kill existing bundler
lsof -i :8081 -t | xargs kill -9

# Clear cache
cd apps/mobile
rm -rf node_modules/.cache
pnpm android
```

### Issue: Emulator Won't Start
**Solution:**
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_6_Pro
```

### Issue: App Won't Install on Device
**Solution:**
```bash
# Uninstall existing app
adb uninstall com.anonymous.skillgapai

# Try installing again
adb install apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📈 Next Steps

After running the app:

1. **Connect to Backend**
   - Update `apps/mobile/src/lib/api.ts` with your API URL
   - Add real authentication endpoints

2. **Add State Management**
   - Implement Zustand stores for:
     - `authStore` - User login state
     - `jobStore` - Jobs data
     - `applicationStore` - Applications data

3. **Implement Features**
   - Real API integration
   - Photo upload for resume
   - Push notifications
   - Offline support

4. **Build for Production**
   - Generate keystore for signing
   - Run `./android/gradlew assembleRelease`
   - Upload to Google Play Store via Expo EAS

---

## 📚 Useful Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [expo-router Guide](https://docs.expo.dev/routing/introduction/)
- [Android Emulator Docs](https://developer.android.com/studio/run/emulator)
- [Gradle Build Guide](https://docs.gradle.org/)

---

## ✅ Verification Checklist

After building, verify:

- [ ] APK file exists at `android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] APK size is reasonable (~100-150 MB)
- [ ] App launches without crashes
- [ ] All navigation tabs work
- [ ] Demo button successfully navigates to dashboard
- [ ] No red error screens
- [ ] Metro bundler shows "Android Bundled" success message

---

**Generated:** May 12, 2026  
**App:** SkillGap AI Mobile (React Native + Expo)  
**Platform:** Android  
**Status:** Ready for Testing ✅
