import { useMemo, useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetPasswordScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = useMemo(
    () => (Array.isArray(params.token) ? params.token[0] : params.token) ?? '',
    [params.token],
  );
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Invalid link', 'The reset token is missing.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Confirm your new password.');
      return;
    }
    setLoading(true);
    try {
      await mobileApi.post('/auth/reset-password', { token, password });
      Alert.alert('Password updated', 'Sign in with your new password.');
      router.replace('/(auth)/login');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Could not reset password.';
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
                <Ionicons name="shield-checkmark-outline" size={32} color={t.colors.primaryDark} />
              </View>
              <Text
                style={{ ...t.typography.h2, color: t.colors.textPrimary, textAlign: 'center' }}
              >
                New password
              </Text>
              <Text
                style={{
                  ...t.typography.body,
                  color: t.colors.textSecondary,
                  marginTop: t.spacing.xs,
                  textAlign: 'center',
                }}
              >
                Create a strong password for your SkillGap AI account.
              </Text>
            </View>

            {[
              { label: 'New password', value: password, onChange: setPassword },
              { label: 'Confirm password', value: confirm, onChange: setConfirm },
            ].map((field) => (
              <View key={field.label} style={{ marginBottom: t.spacing.md }}>
                <Text
                  style={{
                    ...t.typography.caption,
                    fontWeight: '600',
                    color: t.colors.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  {field.label}
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
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="At least 8 characters"
                    placeholderTextColor={t.colors.textSecondary}
                    secureTextEntry
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
            ))}

            <Pressable
              onPress={() => void handleSubmit()}
              disabled={loading}
              style={({ pressed }) => ({
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.borderRadius.pill,
                backgroundColor: loading ? t.colors.border : t.colors.primary,
                paddingVertical: 18,
                minHeight: t.minTouchTarget,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ ...t.typography.body, fontWeight: '700', color: '#FFFFFF' }}>
                {loading ? 'Updating...' : 'Update password'}
              </Text>
            </Pressable>

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
