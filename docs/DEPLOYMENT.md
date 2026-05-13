# Deployment

## Running Mobile On A Physical Device

Your phone cannot reach the API through `127.0.0.1` or Android emulator host `10.0.2.2`.
It must call your PC's LAN IP address while both devices are on the same Wi-Fi.

1. Start the API on your PC:

   ```sh
   pnpm --filter @skillgap/api dev
   ```

2. Find your PC IP address. On macOS Wi-Fi:

   ```sh
   ipconfig getifaddr en0
   ```

3. Start Expo for physical-device testing:

   ```sh
   EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:3001/api pnpm --filter @skillgap/mobile dev
   ```

   Example for the current machine:

   ```sh
   EXPO_PUBLIC_API_URL=http://10.178.13.4:3001/api pnpm --filter @skillgap/mobile dev
   ```

4. Open the app with Expo Go on your phone.

For APK builds, use the same reachable URL at build time:

```sh
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:3001/api pnpm --filter @skillgap/mobile build:android
```

If the phone is not on the same Wi-Fi, or the PC firewall blocks port `3001`, login and API-backed screens will fail. For sharing outside your local network, deploy the API and build the APK with that public HTTPS API URL.
