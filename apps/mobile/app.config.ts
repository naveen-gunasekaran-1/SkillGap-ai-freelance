export default {
  expo: {
    name: 'SkillGap AI',
    slug: 'skillgap-ai',
    scheme: 'skillgapai',
    version: '0.1.0',
    orientation: 'portrait',
    // icon: './assets/icon.png', // Add this when you create app icon assets
    platforms: ['ios', 'android', 'web'],
    plugins: [
      'expo-router',
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow SkillGap AI to access your photos.',
          cameraPermission: 'Allow SkillGap AI to use your camera.',
          cameraRollPermission: 'Allow SkillGap AI to access your camera roll.',
        },
      ],
      'expo-secure-store',
    ],
    android: {
      package: 'com.anonymous.skillgapai',
      // adaptiveIcon: {
      //   foregroundImage: './assets/icon.png', // Add this when you create app icon assets
      //   backgroundColor: '#FFFFFF',
      // },
      permissions: [
        'android.permission.INTERNET',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
      minSdkVersion: 23,
      targetSdkVersion: 34,
    },
    ios: {
      bundleIdentifier: 'com.anonymous.skillgapai',
      supportsTabletMode: true,
      infoPlist: {
        NSCameraUsageDescription: 'Allow SkillGap AI to use your camera for profile photos',
        NSPhotoLibraryUsageDescription: 'Allow SkillGap AI to access your photo library',
        NSPhotoLibraryAddUsageDescription: 'Allow SkillGap AI to save photos to your library',
      },
    },
    // web: {
    //   favicon: './assets/favicon.png', // Add this when you create favicon asset
    // },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3001',
    },
  },
};
