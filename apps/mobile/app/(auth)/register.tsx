import { useState } from 'react';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { theme } from '../../src/theme';

const t = theme;
type Role = 'CANDIDATE' | 'COMPANY' | null;

/**
 * Mobile registration screen with step indicator, role selection, form fields,
 * and password strength visual.
 */
export default function RegisterScreen(): React.JSX.Element {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : /[A-Z]/.test(password) && /\d/.test(password) ? 4 : 3;
  const strengthColors = ['#E5E7EB', '#EF4444', '#F59E0B', '#2563EB', '#10B981'];

  const handleRegister = () => console.log('Register:', { role, name, email, password });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.xxl }} keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
          {/* Progress indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: t.spacing.xl }}>
            {[1, 2].map((s) => (
              <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: step >= s ? t.colors.primary : t.colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: step >= s ? '#FFFFFF' : t.colors.textSecondary }}>{step > s ? '✓' : s}</Text>
                </View>
                {s < 2 && <View style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: step > s ? t.colors.primary : t.colors.border }} />}
              </View>
            ))}
          </View>

          {/* Step 1: Role selection */}
          {step === 1 && (
            <View>
              <Text style={{ ...t.typography.h2, color: t.colors.textPrimary }}>Create account</Text>
              <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: t.spacing.xs }}>How will you use SkillGap AI?</Text>
              <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
                {([
                  { r: 'CANDIDATE' as Role, icon: '🎓', title: 'Candidate', desc: 'Find jobs and get gap analysis' },
                  { r: 'COMPANY' as Role, icon: '🏢', title: 'Company', desc: 'Post jobs and hire talent' },
                ] as const).map((opt) => (
                  <Pressable
                    key={opt.r}
                    onPress={() => { setRole(opt.r); setStep(2); }}
                    style={({ pressed }) => ({
                      borderRadius: t.borderRadius.lg,
                      borderWidth: 2,
                      borderColor: role === opt.r ? t.colors.primary : t.colors.border,
                      backgroundColor: role === opt.r ? t.colors.primaryLight : t.colors.surface,
                      padding: t.spacing.lg,
                      opacity: pressed ? 0.9 : 1,
                      ...t.shadows.card,
                    })}
                  >
                    <Text style={{ fontSize: 28 }}>{opt.icon}</Text>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: t.colors.textPrimary, marginTop: t.spacing.sm }}>{opt.title}</Text>
                    <Text style={{ fontSize: 14, color: t.colors.textSecondary, marginTop: 4 }}>{opt.desc}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: User details */}
          {step === 2 && (
            <View>
              <Text style={{ ...t.typography.h2, color: t.colors.textPrimary }}>Your details</Text>
              <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: t.spacing.xs }}>Tell us about yourself</Text>

              <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: t.colors.textPrimary, marginBottom: 6 }}>Full name</Text>
                  <TextInput value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={t.colors.textSecondary} style={{ borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: t.spacing.md, paddingVertical: 14, fontSize: 16, color: t.colors.textPrimary, minHeight: t.minTouchTarget }} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: t.colors.textPrimary, marginBottom: 6 }}>Email address</Text>
                  <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={t.colors.textSecondary} keyboardType="email-address" autoCapitalize="none" style={{ borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: t.spacing.md, paddingVertical: 14, fontSize: 16, color: t.colors.textPrimary, minHeight: t.minTouchTarget }} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: t.colors.textPrimary, marginBottom: 6 }}>Password</Text>
                  <View>
                    <TextInput value={password} onChangeText={setPassword} placeholder="Min 8 characters" placeholderTextColor={t.colors.textSecondary} secureTextEntry={!showPw} style={{ borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: t.spacing.md, paddingVertical: 14, paddingRight: 50, fontSize: 16, color: t.colors.textPrimary, minHeight: t.minTouchTarget }} />
                    <Pressable onPress={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', minWidth: t.minTouchTarget, alignItems: 'center' }} hitSlop={8}>
                      <Text style={{ fontSize: 14, color: t.colors.textSecondary }}>{showPw ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                  {/* Password strength */}
                  {password.length > 0 && (
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= pwStrength ? strengthColors[pwStrength] : t.colors.border }} />
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.xl }}>
                <Pressable onPress={() => setStep(1)} style={({ pressed }) => ({ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingVertical: 16, minHeight: t.minTouchTarget, opacity: pressed ? 0.9 : 1 })}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.textPrimary }}>Back</Text>
                </Pressable>
                <Pressable onPress={handleRegister} style={({ pressed }) => ({ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: t.borderRadius.card, backgroundColor: t.colors.primary, paddingVertical: 16, minHeight: t.minTouchTarget, opacity: pressed ? 0.9 : 1, ...t.shadows.card })}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>Create Account</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Sign in link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: t.spacing.xl, gap: 4 }}>
            <Text style={{ fontSize: 14, color: t.colors.textSecondary }}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable style={{ minHeight: t.minTouchTarget, justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.primary }}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
