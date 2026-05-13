import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { hasMobileAccessToken } from '../src/lib/http';
import { useMobileAuthStore } from '../src/stores/authStore';

/**
 * Root layout - Simple stack that allows all routes to be accessible
 * Groups (auth) and (tabs) are automatically discovered from folder structure
 * No forced auth redirects - users navigate naturally from home page
 */
export default function RootLayout(): React.JSX.Element {
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const authed = useMobileAuthStore((s) => s.isAuthenticated);
  const setAuthenticated = useMobileAuthStore((s) => s.setAuthenticated);

  useEffect(() => {
    void (async () => {
      const ok = await hasMobileAccessToken();
      setAuthenticated(ok);
      setReady(true);
    })();
  }, [setAuthenticated]);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    if (!authed && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }
    if (authed && inAuth) {
      router.replace('/(tabs)');
    }
  }, [authed, ready, router, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    />
  );
}
