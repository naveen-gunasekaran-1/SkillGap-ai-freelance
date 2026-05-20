import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMobileApiErrorMessage, mobileApi, setMobileAuthTokens } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';
import { theme } from '../../src/theme';

const t = theme;

function oauthErrorMessage(error: string): string {
  if (error === 'OAUTH_CODE_EXCHANGE_FAILED') {
    return 'The provider rejected the login code. Check the OAuth client secret and callback URL in Render and the provider console.';
  }
  if (error === 'access_denied') {
    return 'Sign in was cancelled or denied.';
  }
  return 'OAuth sign in could not be completed.';
}

export default function OAuthCallbackScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const router = useRouter();
  const setSession = useMobileAuthStore((s) => s.setSession);
  const [message, setMessage] = useState('Completing secure sign in...');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function completeOAuthLogin() {
      if (params.error) {
        setFailed(true);
        setMessage(oauthErrorMessage(params.error));
        return;
      }
      if (!params.code) {
        setFailed(true);
        setMessage('OAuth sign in did not return a login code.');
        return;
      }

      try {
        const res = await mobileApi.post<{
          user: { name: string; role: 'CANDIDATE' | 'COMPANY' | 'ADMIN' };
          accessToken: string;
          refreshToken: string;
        }>('/auth/oauth/session', {
          code: params.code,
          rememberMe: true,
        });
        await setMobileAuthTokens(res.data.accessToken, res.data.refreshToken);
        if (cancelled) return;
        setSession(res.data.user.name, res.data.user.role);
        router.replace('/(tabs)');
      } catch (error) {
        if (cancelled) return;
        setFailed(true);
        setMessage(getMobileApiErrorMessage(error));
      }
    }

    void completeOAuthLogin();

    return () => {
      cancelled = true;
    };
  }, [params.code, params.error, router, setSession]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: t.colors.background,
        justifyContent: 'center',
        padding: t.spacing.lg,
      }}
    >
      <View style={{ alignItems: 'center', gap: t.spacing.md }}>
        {failed ? (
          <Ionicons name="alert-circle-outline" size={42} color={t.colors.error} />
        ) : (
          <ActivityIndicator size="large" color={t.colors.primary} />
        )}
        <Text style={{ ...t.typography.h2, color: t.colors.textPrimary, textAlign: 'center' }}>
          {failed ? 'Sign in failed' : 'Signing you in'}
        </Text>
        <Text style={{ ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center' }}>
          {message}
        </Text>
        {failed ? (
          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            style={{
              minHeight: t.minTouchTarget,
              paddingHorizontal: t.spacing.lg,
              borderRadius: t.borderRadius.pill,
              backgroundColor: t.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ ...t.typography.body, color: '#FFFFFF', fontWeight: '700' }}>
              Back to sign in
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
