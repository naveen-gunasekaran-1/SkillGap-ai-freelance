import Constants from 'expo-constants';
import { Platform } from 'react-native';

function withApiPath(url: string): string {
  const trimmed = url.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function getExpoHostApiUrl(): string | null {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;
  return host ? `http://${host}:3001/api` : null;
}

function getDefaultApiUrl(): string {
  const expoHostApiUrl = getExpoHostApiUrl();
  if (expoHostApiUrl) {
    return expoHostApiUrl;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api';
  }
  return 'http://127.0.0.1:3001/api';
}

/**
 * Base URL for SkillGap API (must include `/api` path).
 */
export function getApiUrl(): string {
  const configured =
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.extra?.apiUrl as string | undefined);
  return configured ? withApiPath(configured) : getDefaultApiUrl();
}
