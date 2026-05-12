import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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

  const handleLogin = () => console.log('Login:', { email, password });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
          {/* Header */}
          <Text style={{ ...t.typography.h1, color: t.colors.textPrimary }}>Sign in</Text>
          <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: t.spacing.xs }}>
            Welcome back to SkillGap AI
          </Text>

          {/* OAuth buttons */}
          <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.xl }}>
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
                opacity: pressed ? 0.8 : 1,
                ...t.shadows.card,
              })}
            >
              <Text style={{ fontSize: 16 }}>G</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.textPrimary }}>Google</Text>
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
                opacity: pressed ? 0.8 : 1,
                ...t.shadows.card,
              })}
            >
              <Text style={{ fontSize: 16 }}>in</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.textPrimary }}>LinkedIn</Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: t.spacing.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
            <Text style={{ paddingHorizontal: t.spacing.sm, fontSize: 12, color: t.colors.textSecondary, textTransform: 'uppercase' }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
          </View>

          {/* Email */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: t.colors.textPrimary, marginBottom: 6 }}>Email address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={t.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={{
              width: '100%',
              borderRadius: t.borderRadius.card,
              borderWidth: 1,
              borderColor: t.colors.border,
              backgroundColor: t.colors.surface,
              paddingHorizontal: t.spacing.md,
              paddingVertical: 14,
              fontSize: 16,
              color: t.colors.textPrimary,
              minHeight: t.minTouchTarget,
            }}
          />

          {/* Password */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: t.colors.textPrimary, marginTop: t.spacing.md, marginBottom: 6 }}>Password</Text>
          <View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={t.colors.textSecondary}
              secureTextEntry={!showPw}
              autoComplete="password"
              style={{
                width: '100%',
                borderRadius: t.borderRadius.card,
                borderWidth: 1,
                borderColor: t.colors.border,
                backgroundColor: t.colors.surface,
                paddingHorizontal: t.spacing.md,
                paddingVertical: 14,
                paddingRight: 50,
                fontSize: 16,
                color: t.colors.textPrimary,
                minHeight: t.minTouchTarget,
              }}
            />
            <Pressable
              onPress={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', minWidth: t.minTouchTarget, alignItems: 'center' }}
              hitSlop={8}
            >
              <Text style={{ fontSize: 14, color: t.colors.textSecondary }}>{showPw ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          {/* Forgot password */}
          <Pressable style={{ alignSelf: 'flex-end', marginTop: t.spacing.sm, minHeight: t.minTouchTarget, justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.primary }}>Forgot password?</Text>
          </Pressable>

          {/* Sign in button */}
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => ({
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: t.borderRadius.card,
              backgroundColor: t.colors.primary,
              paddingVertical: 16,
              marginTop: t.spacing.lg,
              minHeight: t.minTouchTarget,
              opacity: pressed ? 0.9 : 1,
              ...t.shadows.card,
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Sign in</Text>
          </Pressable>

          {/* Register link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: t.spacing.lg, gap: 4 }}>
            <Text style={{ fontSize: 14, color: t.colors.textSecondary }}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable style={{ minHeight: t.minTouchTarget, justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.primary }}>Create one</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
