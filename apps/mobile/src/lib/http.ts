import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiUrl } from './api';

const ACCESS_KEY = 'skillgap.accessToken';
const REFRESH_KEY = 'skillgap.refreshToken';

export const mobileApi = axios.create({
  baseURL: getApiUrl(),
  timeout: 20000,
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
      .post<{ accessToken: string; refreshToken: string }>(`${getApiUrl()}/auth/refresh`, { refreshToken })
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
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
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

export async function setMobileAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
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
