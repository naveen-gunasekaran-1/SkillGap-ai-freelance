import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const ACCESS_KEY = 'skillgap.accessToken';
const REFRESH_KEY = 'skillgap.refreshToken';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true,
});

function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_KEY);
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(ACCESS_KEY, accessToken);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
  window.localStorage.setItem('skillgap.token', accessToken);
}

export function clearAuthTokens(): void {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem('skillgap.token');
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
        setAuthTokens(res.data.accessToken, res.data.refreshToken);
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
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
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
