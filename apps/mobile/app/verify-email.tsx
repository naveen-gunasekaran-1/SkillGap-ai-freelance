import { useEffect, useMemo, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { theme } from '../src/theme';
import { mobileApi } from '../src/lib/http';

const t = theme;

type VerifyState = 'checking' | 'success' | 'error';

export default function VerifyEmailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = useMemo(
    () => (Array.isArray(params.token) ? params.token[0] : params.token) ?? '',
    [params.token],
  );
  const [state, setState] = useState<VerifyState>('checking');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!token) {
        setState('error');
        setMessage('This verification link is missing a token.');
        return;
      }
      try {
        await mobileApi.post('/auth/email-verification/confirm', { token });
        if (cancelled) return;
        setState('success');
        setMessage('Your email has been verified.');
      } catch (error) {
        if (cancelled) return;
        const errorMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : 'Verification failed.';
        setState('error');
        setMessage(errorMessage);
      }
    }
    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: t.colors.background,
        justifyContent: 'center',
        padding: t.spacing.lg,
      }}
    >
      <View
        style={{
          borderRadius: t.borderRadius.lg,
          backgroundColor: t.colors.surface,
          padding: t.spacing.xl,
          alignItems: 'center',
          ...t.shadows.card,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: state === 'error' ? '#FEE2E2' : t.colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={state === 'error' ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={34}
            color={state === 'error' ? t.colors.error : t.colors.primary}
          />
        </View>
        <Text
          style={{
            ...t.typography.h2,
            color: t.colors.textPrimary,
            textAlign: 'center',
            marginTop: t.spacing.md,
          }}
        >
          {state === 'checking'
            ? 'Checking email'
            : state === 'success'
              ? 'Email verified'
              : 'Verification failed'}
        </Text>
        <Text
          style={{
            ...t.typography.body,
            color: t.colors.textSecondary,
            textAlign: 'center',
            marginTop: t.spacing.sm,
          }}
        >
          {message}
        </Text>
        <Link href="/(tabs)" asChild>
          <Pressable
            style={{
              marginTop: t.spacing.xl,
              borderRadius: t.borderRadius.pill,
              backgroundColor: t.colors.primary,
              paddingHorizontal: t.spacing.xl,
              paddingVertical: 14,
            }}
          >
            <Text style={{ ...t.typography.caption, fontWeight: '700', color: '#FFFFFF' }}>
              Go to app
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
