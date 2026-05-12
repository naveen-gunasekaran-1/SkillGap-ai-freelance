import { Platform } from 'react-native';

function getDefaultApiUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api';
  }
  return 'http://127.0.0.1:3001/api';
}

/**
 * Base URL for SkillGap API (must include `/api` path).
 */
export function getApiUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl();
}
