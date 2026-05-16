import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, SafeAreaView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { mobileApi, setMobileAuthTokens } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

/**
 * Mobile login screen with email/password wired to the SkillGap API.
 */
export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setSession = useMobileAuthStore((s) => s.setSession);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await mobileApi.post<{ user: { name: string; role: 'CANDIDATE' | 'COMPANY' | 'ADMIN' }; accessToken: string; refreshToken: string }>(
        '/auth/login',
        {
          email: email.trim().toLowerCase(),
          password,
          rememberMe: true,
        },
      );
      await setMobileAuthTokens(res.data.accessToken, res.data.refreshToken);
      setSession(res.data.user.name, res.data.user.role);
      router.replace('/(tabs)');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? error.message
        : 'Check your credentials and API URL (EXPO_PUBLIC_API_URL).';
      Alert.alert('Sign in failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
            <View style={{ marginBottom: t.spacing.xl, alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: t.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: t.spacing.md }}>
                <Ionicons name="log-in-outline" size={32} color={t.colors.primaryDark} />
              </View>
              <Text style={{ ...t.typography.h1, color: t.colors.textPrimary, textAlign: 'center' }}>Welcome Back</Text>
              <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: t.spacing.xs, textAlign: 'center' }}>
                Sign in to SkillGap AI
              </Text>
            </View>

            <View style={{ marginBottom: t.spacing.md }}>
              <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.textPrimary, marginBottom: 8 }}>Email address</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.surface, borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, paddingHorizontal: t.spacing.md }}>
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
              <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.textPrimary, marginBottom: 8 }}>Password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.surface, borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, paddingHorizontal: t.spacing.md }}>
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
                <Pressable onPress={() => setShowPw(!showPw)} style={{ padding: t.spacing.xs }} hitSlop={8}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={t.colors.textSecondary} />
                </Pressable>
              </View>
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
              <Text style={{ color: '#FFFFFF', ...t.typography.body, fontWeight: '700' }}>{loading ? 'Signing in…' : 'Sign in'}</Text>
            </Pressable>

            <Text style={{ ...t.typography.small, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.md }}>
              Demo: demo@skillgap.ai / SkillGapDemo1!
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: t.spacing.xl, gap: 6 }}>
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>Don&apos;t have an account?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable hitSlop={8}>
                  <Text style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.primary }}>Create one</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
