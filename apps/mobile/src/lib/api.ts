import { Platform } from 'react-native';

function getDefaultApiUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://127.0.0.1:3001';
}

export function getApiUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl();
}