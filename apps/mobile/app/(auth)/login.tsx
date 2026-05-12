import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

const t = theme;

/**
 * Mobile login screen with email/password, OAuth buttons, show/hide password,
 * and keyboard-aware scrolling.
 */
export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    console.log('Login:', { email, password });
    router.replace('/(tabs)');
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
            {/* Header */}
            <View style={{ marginBottom: t.spacing.xl, alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: t.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: t.spacing.md }}>
                <Ionicons name="log-in-outline" size={32} color={t.colors.primaryDark} />
              </View>
              <Text style={{ ...t.typography.h1, color: t.colors.textPrimary, textAlign: 'center' }}>Welcome Back</Text>
              <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: t.spacing.xs, textAlign: 'center' }}>
                Sign in to continue to SkillGap AI
              </Text>
            </View>

            {/* OAuth buttons */}
            <View style={{ flexDirection: 'row', gap: t.spacing.md, marginBottom: t.spacing.lg }}>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: t.borderRadius.card,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.surface,
                  paddingVertical: 14,
                  minHeight: t.minTouchTarget,
                  opacity: pressed ? 0.7 : 1,
                  ...t.shadows.sm,
                })}
              >
                <Ionicons name="logo-google" size={20} color={t.colors.textPrimary} />
                <Text style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.textPrimary }}>Google</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: t.borderRadius.card,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.surface,
                  paddingVertical: 14,
                  minHeight: t.minTouchTarget,
                  opacity: pressed ? 0.7 : 1,
                  ...t.shadows.sm,
                })}
              >
                <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                <Text style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.textPrimary }}>LinkedIn</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: t.spacing.lg }}>
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
              <Text style={{ paddingHorizontal: t.spacing.sm, ...t.typography.small, color: t.colors.textSecondary, textTransform: 'uppercase' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
            </View>

            {/* Email */}
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

            {/* Password */}
            <View style={{ marginBottom: t.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.textPrimary }}>Password</Text>
                <Pressable hitSlop={8}>
                  <Text style={{ ...t.typography.small, fontWeight: '600', color: t.colors.primary }}>Forgot password?</Text>
                </Pressable>
              </View>
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
                <Pressable
                  onPress={() => setShowPw(!showPw)}
                  style={{ padding: t.spacing.xs }}
                  hitSlop={8}
                >
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={t.colors.textSecondary} />
                </Pressable>
              </View>
            </View>

            {/* Sign in button */}
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => ({
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.borderRadius.pill,
                backgroundColor: t.colors.primary,
                paddingVertical: 18,
                marginTop: t.spacing.sm,
                minHeight: t.minTouchTarget,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                ...t.shadows.card,
              })}
            >
              <Text style={{ color: '#FFFFFF', ...t.typography.body, fontWeight: '700' }}>Sign in</Text>
            </Pressable>

            {/* Register link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: t.spacing.xl, gap: 6 }}>
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>Don't have an account?</Text>
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
