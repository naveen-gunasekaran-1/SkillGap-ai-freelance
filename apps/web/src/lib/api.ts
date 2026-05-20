import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const ACCESS_KEY = 'skillgap.accessToken';
const REFRESH_KEY = 'skillgap.refreshToken';
const PERSISTENCE_KEY = 'skillgap.authPersistence';
type AuthPersistence = 'local' | 'session';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true,
});

export function getApiBaseUrl(): string {
  return String(api.defaults.baseURL ?? 'http://localhost:3001/api').replace(/\/$/, '');
}

function getAccessToken(): string | null {
  return window.sessionStorage.getItem(ACCESS_KEY) ?? window.localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken(): string | null {
  return window.sessionStorage.getItem(REFRESH_KEY) ?? window.localStorage.getItem(REFRESH_KEY);
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}

export function getAuthPersistence(): AuthPersistence | null {
  return (window.localStorage.getItem(PERSISTENCE_KEY) as AuthPersistence | null) ?? null;
}

export function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  persistence: AuthPersistence = 'session',
): void {
  clearAuthTokens();
  const storage = persistence === 'local' ? window.localStorage : window.sessionStorage;
  storage.setItem(ACCESS_KEY, accessToken);
  storage.setItem(REFRESH_KEY, refreshToken);
  storage.setItem('skillgap.token', accessToken);
  if (persistence === 'local') {
    window.localStorage.setItem(PERSISTENCE_KEY, 'local');
  }
}

export function clearAuthTokens(): void {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem('skillgap.token');
  window.localStorage.removeItem(PERSISTENCE_KEY);
  window.sessionStorage.removeItem(ACCESS_KEY);
  window.sessionStorage.removeItem(REFRESH_KEY);
  window.sessionStorage.removeItem('skillgap.token');
}

/**
 * Revokes the current refresh token on the server (best-effort).
 */
export async function revokeRefreshToken(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch {
    // ignore network errors during logout
  }
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<{ accessToken: string; refreshToken: string }>(
        `${api.defaults.baseURL ?? ''}/auth/refresh`,
        { refreshToken },
        { withCredentials: true },
      )
      .then((res) => {
        setAuthTokens(
          res.data.accessToken,
          res.data.refreshToken,
          getAuthPersistence() ?? 'session',
        );
        return res.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
    }

    if (status != null && status >= 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  },
);
