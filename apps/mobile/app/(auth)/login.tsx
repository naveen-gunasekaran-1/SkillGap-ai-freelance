import { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { getMobileApiErrorMessage, mobileApi, setMobileAuthTokens } from '../../src/lib/http';
import { getApiUrl } from '../../src/lib/api';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;
const OAUTH_CALLBACK_URL = 'skillgapai://oauth/callback';

WebBrowser.maybeCompleteAuthSession();

/**
 * Mobile login screen with email/password wired to the SkillGap API.
 */
export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<'google' | 'linkedin' | null>(null);
  const [slowRequest, setSlowRequest] = useState(false);
  const router = useRouter();
  const setSession = useMobileAuthStore((s) => s.setSession);

  useEffect(() => {
    if (!loading) {
      setSlowRequest(false);
      return undefined;
    }
    const id = setTimeout(() => setSlowRequest(true), 8000);
    return () => clearTimeout(id);
  }, [loading]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await mobileApi.post<{
        user: { name: string; role: 'CANDIDATE' | 'COMPANY' | 'ADMIN' };
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        rememberMe: true,
      });
      await setMobileAuthTokens(res.data.accessToken, res.data.refreshToken);
      setSession(res.data.user.name, res.data.user.role);
      router.replace('/(tabs)');
    } catch (error) {
      const message = getMobileApiErrorMessage(error);
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  };

  const startOAuthLogin = async (provider: 'google' | 'linkedin') => {
    const url = `${getApiUrl()}/auth/oauth/${provider}/start?client=mobile&returnTo=${encodeURIComponent('/dashboard')}`;
    setOauthProvider(provider);
    try {
      const availability = await fetch(url, { redirect: 'manual' });
      const contentType = availability.headers.get('content-type') ?? '';
      if (availability.status >= 400 && contentType.includes('application/json')) {
        const body = (await availability.json()) as { message?: string };
        Alert.alert(
          'Social sign in unavailable',
          body.message ?? 'This provider is not ready yet.',
        );
        return;
      }
    } catch {
      // If the preflight cannot complete, still try the browser flow below.
    }

    try {
      const result = await WebBrowser.openAuthSessionAsync(url, OAUTH_CALLBACK_URL);
      if (result.type !== 'success' || !result.url) return;

      const callback = new URL(result.url);
      const code = callback.searchParams.get('code');
      const error = callback.searchParams.get('error');
      const returnTo = callback.searchParams.get('returnTo');
      router.replace({
        pathname: '/oauth/callback',
        params: {
          ...(code ? { code } : {}),
          ...(error ? { error } : {}),
          ...(returnTo ? { returnTo } : {}),
        },
      });
    } catch (error) {
      Alert.alert(
        'Social sign in failed',
        error instanceof Error ? error.message : 'Could not open the sign in browser.',
      );
    } finally {
      setOauthProvider(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: t.spacing.lg,
            paddingVertical: t.spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
            <View style={{ marginBottom: t.spacing.xl, alignItems: 'center' }}>
              <Image
                source={require('../../assets/brand/icon-blue.png')}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  marginBottom: t.spacing.md,
                }}
                resizeMode="contain"
              />
              <Text
                style={{ ...t.typography.h1, color: t.colors.textPrimary, textAlign: 'center' }}
              >
                Welcome Back
              </Text>
              <Text
                style={{
                  ...t.typography.body,
                  color: t.colors.textSecondary,
                  marginTop: t.spacing.xs,
                  textAlign: 'center',
                }}
              >
                Sign in to SkillGap AI
              </Text>
            </View>

            <View style={{ marginBottom: t.spacing.md }}>
              <Text
                style={{
                  ...t.typography.caption,
                  fontWeight: '600',
                  color: t.colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Email address
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: t.colors.surface,
                  borderRadius: t.borderRadius.card,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  paddingHorizontal: t.spacing.md,
                }}
              >
                <Ionicons name="mail-outline" size={20} color={t.colors.textSecondary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={t.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    paddingLeft: t.spacing.sm,
                    ...t.typography.body,
                    color: t.colors.textPrimary,
                    minHeight: t.minTouchTarget,
                  }}
                />
              </View>
            </View>

            <View style={{ marginBottom: t.spacing.md }}>
              <Text
                style={{
                  ...t.typography.caption,
                  fontWeight: '600',
                  color: t.colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: t.colors.surface,
                  borderRadius: t.borderRadius.card,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  paddingHorizontal: t.spacing.md,
                }}
              >
                <Ionicons name="lock-closed-outline" size={20} color={t.colors.textSecondary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={t.colors.textSecondary}
                  secureTextEntry={!showPw}
                  autoComplete="password"
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    paddingLeft: t.spacing.sm,
                    ...t.typography.body,
                    color: t.colors.textPrimary,
                    minHeight: t.minTouchTarget,
                  }}
                />
                <Pressable
                  onPress={() => setShowPw(!showPw)}
                  style={{ padding: t.spacing.xs }}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPw ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={t.colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end', marginBottom: t.spacing.sm }}>
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable hitSlop={8}>
                  <Text
                    style={{
                      ...t.typography.caption,
                      fontWeight: '700',
                      color: t.colors.primary,
                    }}
                  >
                    Forgot password?
                  </Text>
                </Pressable>
              </Link>
            </View>

            <Pressable
              onPress={() => void handleLogin()}
              disabled={loading}
              style={({ pressed }) => ({
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.borderRadius.pill,
                backgroundColor: loading ? t.colors.border : t.colors.primary,
                paddingVertical: 18,
                marginTop: t.spacing.sm,
                minHeight: t.minTouchTarget,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                ...t.shadows.card,
              })}
            >
              <Text style={{ color: '#FFFFFF', ...t.typography.body, fontWeight: '700' }}>
                {loading ? (slowRequest ? 'Waking secure server…' : 'Signing in…') : 'Sign in'}
              </Text>
            </Pressable>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.spacing.sm,
                marginVertical: t.spacing.lg,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
            </View>

            <View style={{ gap: t.spacing.sm }}>
              <Pressable
                onPress={() => void startOAuthLogin('google')}
                disabled={loading || oauthProvider !== null}
                style={({ pressed }) => ({
                  minHeight: t.minTouchTarget,
                  borderRadius: t.borderRadius.pill,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: t.spacing.sm,
                  opacity: pressed && oauthProvider === null ? 0.85 : 1,
                })}
              >
                <Ionicons name="logo-google" size={20} color={t.colors.textPrimary} />
                <Text
                  style={{ ...t.typography.body, color: t.colors.textPrimary, fontWeight: '700' }}
                >
                  {oauthProvider === 'google' ? 'Opening Google...' : 'Continue with Google'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void startOAuthLogin('linkedin')}
                disabled={loading || oauthProvider !== null}
                style={({ pressed }) => ({
                  minHeight: t.minTouchTarget,
                  borderRadius: t.borderRadius.pill,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: t.spacing.sm,
                  opacity: pressed && oauthProvider === null ? 0.85 : 1,
                })}
              >
                <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                <Text
                  style={{ ...t.typography.body, color: t.colors.textPrimary, fontWeight: '700' }}
                >
                  {oauthProvider === 'linkedin'
                    ? 'Opening LinkedIn...'
                    : 'Continue with LinkedIn'}
                </Text>
              </Pressable>
            </View>

            <View style={{ alignItems: 'center', marginTop: t.spacing.md }}>
              <Link href="/(auth)/register" asChild>
                <Pressable hitSlop={8}>
                  <Text
                    style={{
                      ...t.typography.caption,
                      color: t.colors.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    Hiring with SkillGap AI?{' '}
                    <Text style={{ fontWeight: '800', color: t.colors.primary }}>
                      Create a company account
                    </Text>
                  </Text>
                </Pressable>
              </Link>
            </View>

            {loading && slowRequest ? (
              <Text
                style={{
                  ...t.typography.small,
                  color: t.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: t.spacing.sm,
                }}
              >
                First request can take up to a minute on Render free tier.
              </Text>
            ) : null}

            <Text
              style={{
                ...t.typography.small,
                color: t.colors.textSecondary,
                textAlign: 'center',
                marginTop: t.spacing.md,
              }}
            >
              Demo: demo@skillgap.ai / SkillGapDemo1!
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: t.spacing.xl,
                gap: 6,
              }}
            >
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                Don&apos;t have an account?
              </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable hitSlop={8}>
                  <Text
                    style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.primary }}
                  >
                    Create one
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
