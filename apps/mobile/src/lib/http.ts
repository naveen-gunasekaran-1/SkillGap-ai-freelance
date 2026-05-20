import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiOrigin, getApiUrl } from './api';

const ACCESS_KEY = 'skillgap.accessToken';
const REFRESH_KEY = 'skillgap.refreshToken';

export const mobileApi = axios.create({
  baseURL: getApiUrl(),
  // Render free instances can cold-start slowly. Keep mobile requests patient
  // enough that wake-up latency does not surface as a false "Network Error".
  timeout: 60000,
});

mobileApi.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<{ accessToken: string; refreshToken: string }>(`${getApiUrl()}/auth/refresh`, {
        refreshToken,
      })
      .then(async (res) => {
        await SecureStore.setItemAsync(ACCESS_KEY, res.data.accessToken);
        await SecureStore.setItemAsync(REFRESH_KEY, res.data.refreshToken);
        return res.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

mobileApi.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const next = await refreshAccessToken();
      if (next) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${next}`;
        return mobileApi(original);
      }
    }
    return Promise.reject(error);
  },
);

export async function setMobileAuthTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearMobileAuthTokens(): Promise<void> {
  await Promise.allSettled([
    SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => undefined),
    SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => undefined),
  ]);
}

export async function hasMobileAccessToken(): Promise<boolean> {
  const t = await SecureStore.getItemAsync(ACCESS_KEY);
  return Boolean(t);
}

export function getMobileApiErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return 'Something went wrong. Please try again.';
  }

  const message =
    typeof error.response?.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof (error.response.data as { message: unknown }).message === 'string'
      ? (error.response.data as { message: string }).message
      : null;

  if (message) return message;

  if (error.code === 'ECONNABORTED') {
    return 'The server is taking longer than expected. Render free services may need up to a minute to wake up.';
  }

  if (!error.response) {
    return 'Could not reach the SkillGap AI server. Check internet, VPN/private DNS, and try the Network Check.';
  }

  return error.message || 'Request failed. Please try again.';
}

export async function checkMobileApiHealth(): Promise<{
  ok: boolean;
  latencyMs: number;
  status?: number;
  message: string;
}> {
  const started = Date.now();
  try {
    const res = await axios.get<{ status: string }>(`${getApiOrigin()}/health`, { timeout: 60000 });
    return {
      ok: res.status >= 200 && res.status < 300 && res.data.status === 'ok',
      latencyMs: Date.now() - started,
      status: res.status,
      message:
        res.data.status === 'ok'
          ? 'API is reachable.'
          : 'API responded, but health status was unexpected.',
    };
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    return {
      ok: false,
      latencyMs: Date.now() - started,
      ...(status ? { status } : {}),
      message: getMobileApiErrorMessage(error),
    };
  }
}
