import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, StatusBar as NativeStatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { clearMobileAuthTokens, hasMobileAccessToken, mobileApi } from '../src/lib/http';
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
  const setSession = useMobileAuthStore((s) => s.setSession);
  const clearSession = useMobileAuthStore((s) => s.clear);

  useEffect(() => {
    void (async () => {
      const ok = await hasMobileAccessToken();
      setAuthenticated(ok);
      if (ok) {
        try {
          const res = await mobileApi.get<{
            user: { name: string; role: 'CANDIDATE' | 'COMPANY' | 'ADMIN' };
          }>('/auth/me');
          setSession(res.data.user.name, res.data.user.role);
        } catch {
          await clearMobileAuthTokens();
          clearSession();
        }
      }
      setReady(true);
    })();
  }, [clearSession, setAuthenticated, setSession]);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    const publicRoute =
      segments[0] === 'verify-email' ||
      segments[0] === 'network' ||
      segments[0] === 'contact' ||
      segments[0] === 'oauth';
    if (!authed && !inAuth && !publicRoute) {
      router.replace('/(auth)/login');
      return;
    }
    if (authed && inAuth) {
      router.replace('/(tabs)');
    }
  }, [authed, ready, router, segments]);

  return (
    <SafeAreaProvider>
      <ExpoStatusBar style="dark" backgroundColor="#F9FAFB" translucent={false} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#F9FAFB',
          paddingTop: Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0,
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F9FAFB' },
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}
