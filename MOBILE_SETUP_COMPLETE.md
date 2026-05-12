## 🎯 SkillGap AI Mobile App - iOS & Android Deployment Guide

Your React Native app is now fully configured to run on both iOS and Android platforms! Here's everything you need to know.

---

## 📋 What Was Set Up

✅ **Expo Configuration** - Both iOS and Android platforms configured  
✅ **Native Build Files** - Android gradle build system ready  
✅ **TypeScript Support** - Full type checking across both platforms  
✅ **Package Scripts** - Convenient commands for development  
✅ **Environment Configuration** - API endpoint configuration ready  
✅ **Documentation** - Comprehensive guides and troubleshooting  

---

## 🚀 Quick Start (2 Minutes)

### 1. Verify Your Environment
```bash
./check-environment.sh
```
This checks all prerequisites and shows what's missing.

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment
```bash
cd apps/mobile
cp .env.example .env
# Edit .env if needed (API URL, etc.)
```

### 4. Run on Your Platform

**iOS**:
```bash
pnpm dev              # Terminal 1
pnpm ios              # Terminal 2 (when ready)
```

**Android**:
```bash
pnpm dev              # Terminal 1
pnpm android          # Terminal 2 (when ready)
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **QUICKSTART_IOS_ANDROID.md** | ⚡ Start here! Quick setup guide |
| **SETUP_IOS_ANDROID.md** | 📖 Detailed platform setup & troubleshooting |
| **MOBILE_DEVELOPMENT_TIPS.md** | 💡 Best practices & advanced tips |
| **check-environment.sh** | 🔧 Verify your development environment |
| **setup-mobile.sh** | 🤖 Automated initial setup |
| **test-mobile-config.sh** | ✅ Test your configuration |

**👉 Start with: [QUICKSTART_IOS_ANDROID.md](QUICKSTART_IOS_ANDROID.md)**

---

## 🔧 System Requirements

### All Platforms
- ✅ Node.js 18+
- ✅ pnpm 8+
- ✅ Git

### iOS (macOS only)
- ✅ Xcode 14+
- ✅ CocoaPods (`sudo gem install cocoapods`)
- ✅ iOS SDK 16.0+

### Android
- ✅ Android Studio with SDK 34
- ✅ JDK 11+
- ✅ Android NDK 26.1.10909125

**Check what you have:**
```bash
./check-environment.sh
```

---

## 📱 Platform-Specific Info

### iOS Features
- ✅ iPad support enabled
- ✅ Full permission handling
- ✅ Camera & photo library access
- ✅ iOS 16.0+ support
- 📦 Bundle ID: `com.anonymous.skillgapai`

### Android Features
- ✅ Material Design ready
- ✅ Camera & storage permissions
- ✅ Hardware acceleration support
- ✅ Android 6.0+ support (API 23+)
- 📦 Package: `com.anonymous.skillgapai`

---

## 🎮 Development Workflow

### Basic Workflow
```bash
# Terminal 1: Start Metro dev server
cd apps/mobile
pnpm dev

# Terminal 2: Launch on iOS
pnpm ios

# OR Terminal 2: Launch on Android
pnpm android
```

### Testing Both Simultaneously
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm ios

# Terminal 3
pnpm android
```

All changes hot-reload automatically! 🔄

### Key Commands
```bash
pnpm dev              # Start development server
pnpm ios              # Build & run on iOS
pnpm android          # Build & run on Android
pnpm typecheck        # Check TypeScript errors
pnpm prebuild:ios     # Generate iOS native project
pnpm prebuild:android # Generate Android native project
pnpm dev --reset-cache # Clear Metro cache
```

---

## ✨ Key Features Configured

### Routing
- Expo Router v3 with file-based routing
- Deep linking support
- Native stack navigation

### Styling
- TailwindCSS via NativeWind
- Responsive design
- Platform-specific optimizations

### State Management
- Zustand for global state
- Axios for API calls
- React Hook Form for forms

### Security
- Secure storage with Expo SecureStore
- Environment variable protection
- CORS-ready API integration

---

## 🐛 Troubleshooting Quick Reference

### App won't start
```bash
# Clear everything and rebuild
rm -rf node_modules .pnpm-store ios android dist
pnpm install
pnpm dev --reset-cache
pnpm ios  # or pnpm android
```

### iOS issues
```bash
# Pod problems
cd apps/mobile/ios
pod install --repo-update
cd ..
pnpm ios
```

### Android issues
```bash
# Gradle problems
cd apps/mobile/android
./gradlew clean
cd ..
pnpm android
```

**For detailed troubleshooting:**
→ [SETUP_IOS_ANDROID.md#troubleshooting](SETUP_IOS_ANDROID.md#troubleshooting)

---

## 📖 Development Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Native Directory](https://reactnativeapi.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind (TailwindCSS RN)](https://www.nativewind.dev/)
- [Zustand](https://github.com/pmndrs/zustand)

---

## 🏗️ App Architecture

```
apps/mobile/
├── app/                    # Expo Router pages (file-based routing)
│   ├── _layout.tsx        # Root navigation layout
│   ├── index.tsx          # Home screen
│   ├── (auth)/            # Auth screens group
│   └── (tabs)/            # Tab-based screens group
├── src/
│   ├── theme.ts           # Design tokens
│   └── lib/
│       └── api.ts         # API client
├── app.config.ts          # Expo configuration ← UPDATED FOR BOTH PLATFORMS
├── package.json           # ← Added iOS/Android scripts
├── tailwind.config.js     # ← Updated for both platforms
└── metro.config.js        # Metro bundler config
```

---

## 🔐 Configuration

### Environment Variables (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3001  # Your backend URL
```

### App Config (app.config.ts)
- Platform-specific permissions
- Deep linking configuration
- Native module configuration
- Version management

---

## 📊 Next Steps

1. ✅ **Verify environment**: `./check-environment.sh`
2. 📦 **Install deps**: `pnpm install`
3. ⚙️ **Configure env**: `cp .env.example .env`
4. 🚀 **Start dev**: `pnpm dev`
5. 📱 **Run app**: `pnpm ios` or `pnpm android`
6. 🔨 **Development**: Edit files, watch hot reload
7. 🎯 **Deploy**: Follow platform-specific deployment guides

---

## 🎓 Learning Paths

### New to Mobile Development?
1. Start with [QUICKSTART_IOS_ANDROID.md](QUICKSTART_IOS_ANDROID.md)
2. Read [SETUP_IOS_ANDROID.md](SETUP_IOS_ANDROID.md#development-commands)
3. Explore [MOBILE_DEVELOPMENT_TIPS.md](MOBILE_DEVELOPMENT_TIPS.md#debugging)

### Advanced Development?
1. Check [MOBILE_DEVELOPMENT_TIPS.md](MOBILE_DEVELOPMENT_TIPS.md#platform-specific-development)
2. Learn about [debugging techniques](MOBILE_DEVELOPMENT_TIPS.md#debugging)
3. Review [performance optimization](MOBILE_DEVELOPMENT_TIPS.md#performance-optimization)

### Deployment Ready?
1. Study the deployment sections in [SETUP_IOS_ANDROID.md](SETUP_IOS_ANDROID.md#building-for-production)
2. Review [DEPLOYMENT.md](docs/DEPLOYMENT.md) for backend integration

---

## 💡 Pro Tips

- 🔄 **Hot Reload**: Changes apply instantly during `pnpm dev`
- 📱 **Multiple Devices**: Run `pnpm ios` and `pnpm android` simultaneously
- 🎯 **Real Device Testing**: Connect via USB for native performance testing
- 🧪 **Type Safety**: Run `pnpm typecheck` regularly to catch errors early
- 📊 **Performance**: Use DevTools (Cmd+D on iOS, Shake on Android)

---

## 🚨 Common Gotchas

- **Emulator/Simulator not starting?** → Run from Android Studio/Xcode directly
- **Metro bundler crashes?** → `pnpm dev --reset-cache`
- **API calls failing?** → Check `.env` file and network configuration
- **TypeScript errors?** → Run `pnpm typecheck` for full error list

---

## 📞 Getting Help

1. **Check logs**: Look in Terminal where `pnpm dev` is running
2. **Run diagnostic**: `./check-environment.sh`
3. **Test config**: `./test-mobile-config.sh`
4. **Read docs**: Check relevant troubleshooting section
5. **Search issues**: Expo & React Native have extensive docs

---

## ✅ Verification Checklist

- [ ] Environment check passed: `./check-environment.sh`
- [ ] Dependencies installed: `pnpm install`
- [ ] .env file created and configured
- [ ] Dev server starts: `pnpm dev`
- [ ] iOS simulator launches: `pnpm ios`
- [ ] Android emulator launches: `pnpm android`
- [ ] Hot reload works (make a file change)
- [ ] API calls work (check network tab)

---

## 📝 Next Actions

1. **First Time Setup**: 
   ```bash
   ./check-environment.sh
   pnpm install
   cd apps/mobile && cp .env.example .env
   ```

2. **Start Development**:
   ```bash
   cd apps/mobile
   pnpm dev
   # In another terminal
   pnpm ios    # or pnpm android
   ```

3. **Start Coding**: Edit files in `apps/mobile/app/` and watch changes appear!

---

**🎉 Your app is ready to run on iOS and Android!**

Need help? See [QUICKSTART_IOS_ANDROID.md](QUICKSTART_IOS_ANDROID.md)
