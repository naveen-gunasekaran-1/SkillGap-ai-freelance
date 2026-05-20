import Constants from 'expo-constants';

const RENDER_API_URL = 'https://skillgap-ai-freelance.onrender.com/api';

function withApiPath(url: string): string {
  const trimmed = url.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function withoutApiPath(url: string): string {
  return withApiPath(url).replace(/\/api$/, '');
}

/**
 * Base URL for SkillGap API. Defaults to the deployed Render API so production
 * mobile builds do not accidentally target localhost.
 */
export function getApiUrl(): string {
  const configured =
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
    RENDER_API_URL;
  return withApiPath(configured);
}

export function getApiOrigin(): string {
  return withoutApiPath(getApiUrl());
}
