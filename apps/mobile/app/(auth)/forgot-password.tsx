import { useState } from 'react';
import { Link } from 'expo-router';
import {
  Alert,
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
import axios from 'axios';
import { theme } from '../../src/theme';
import { mobileApi } from '../../src/lib/http';

const t = theme;

export default function ForgotPasswordScreen(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Enter the email tied to your account.');
      return;
    }
    setLoading(true);
    try {
      await mobileApi.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
      Alert.alert('Check your inbox', 'If an account exists, a reset link has been sent.');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Could not request password reset.';
      Alert.alert('Reset failed', message);
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
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: t.spacing.lg,
            paddingVertical: t.spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: t.spacing.xl }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: t.colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: t.spacing.md,
                }}
              >
                <Ionicons name="key-outline" size={32} color={t.colors.primaryDark} />
              </View>
              <Text
                style={{ ...t.typography.h2, color: t.colors.textPrimary, textAlign: 'center' }}
              >
                Reset password
              </Text>
              <Text
                style={{
                  ...t.typography.body,
                  color: t.colors.textSecondary,
                  marginTop: t.spacing.xs,
                  textAlign: 'center',
                }}
              >
                We will send a secure reset link if the account exists.
              </Text>
            </View>

            {sent ? (
              <View
                style={{
                  borderRadius: t.borderRadius.card,
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  backgroundColor: '#F0FDF4',
                  padding: t.spacing.lg,
                }}
              >
                <Text style={{ ...t.typography.caption, color: t.colors.textPrimary }}>
                  Check your inbox and spam folder. The link expires in 30 minutes.
                </Text>
              </View>
            ) : (
              <View>
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
                <Pressable
                  onPress={() => void handleSubmit()}
                  disabled={loading}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: t.borderRadius.pill,
                    backgroundColor: loading ? t.colors.border : t.colors.primary,
                    paddingVertical: 18,
                    marginTop: t.spacing.lg,
                    minHeight: t.minTouchTarget,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ ...t.typography.body, fontWeight: '700', color: '#FFFFFF' }}>
                    {loading ? 'Sending...' : 'Send reset link'}
                  </Text>
                </Pressable>
              </View>
            )}

            <Link href="/(auth)/login" asChild>
              <Pressable style={{ alignItems: 'center', marginTop: t.spacing.xl }} hitSlop={8}>
                <Text
                  style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.primary }}
                >
                  Back to sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
