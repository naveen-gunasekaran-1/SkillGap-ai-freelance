import { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
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
import { theme } from '../../src/theme';
import { getMobileApiErrorMessage, mobileApi, setMobileAuthTokens } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;
type Role = 'CANDIDATE' | 'COMPANY' | null;

const skillOptions = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'CSS',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'Next.js',
  'Vue.js',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'Git',
  'Figma',
  'Tailwind CSS',
];

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
  const [skills, setSkills] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
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

  const pwStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 8
          ? 2
          : /[A-Z]/.test(password) && /\d/.test(password)
            ? 4
            : 3;
  const strengthColors = ['#E2E8F0', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  const toggleSkill = (skill: string) =>
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 20
          ? [...prev, skill]
          : prev,
    );

  const handleRegister = async () => {
    if (!role) {
      Alert.alert('Choose a role', 'Select Candidate or Company to continue.');
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Name, email, and password are required.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (role === 'CANDIDATE' && skills.length === 0) {
      Alert.alert('Add skills', 'Pick at least one skill to continue.');
      return;
    }
    if (role === 'COMPANY' && (!companyName.trim() || !industry.trim())) {
      Alert.alert('Company info required', 'Company name and industry are required.');
      return;
    }

    setLoading(true);
    try {
      const payload =
        role === 'CANDIDATE'
          ? {
              role: 'CANDIDATE' as const,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              skills,
            }
          : {
              role: 'COMPANY' as const,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              company: {
                name: companyName.trim(),
                industry: industry.trim(),
                ...(website.trim() ? { website: website.trim() } : {}),
              },
            };

      const res = await mobileApi.post<{
        user: { name: string; role: 'CANDIDATE' | 'COMPANY' | 'ADMIN' };
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', payload);
      await setMobileAuthTokens(res.data.accessToken, res.data.refreshToken);
      setSession(res.data.user.name, res.data.user.role);
      router.replace('/(tabs)');
    } catch (error) {
      const message = getMobileApiErrorMessage(error);
      Alert.alert('Registration failed', message);
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
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
            {/* Header */}
            <View style={{ marginBottom: t.spacing.lg, alignItems: 'center' }}>
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
                <Ionicons name="person-add-outline" size={32} color={t.colors.primaryDark} />
              </View>
            </View>

            {/* Progress indicator */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: t.spacing.xl,
              }}
            >
              {[1, 2, 3].map((s) => (
                <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: step >= s ? t.colors.primary : t.colors.surfaceSecondary,
                      borderWidth: step >= s ? 0 : 1,
                      borderColor: t.colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...t.shadows.sm,
                    }}
                  >
                    {step > s ? (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={{
                          ...t.typography.caption,
                          fontWeight: '700',
                          color: step >= s ? '#FFFFFF' : t.colors.textSecondary,
                        }}
                      >
                        {s}
                      </Text>
                    )}
                  </View>
                  {s < 3 && (
                    <View
                      style={{
                        width: 40,
                        height: 3,
                        borderRadius: 1.5,
                        backgroundColor: step > s ? t.colors.primary : t.colors.border,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>

            {/* Step 1: Role selection */}
            {step === 1 && (
              <View>
                <Text
                  style={{ ...t.typography.h2, color: t.colors.textPrimary, textAlign: 'center' }}
                >
                  Create account
                </Text>
                <Text
                  style={{
                    ...t.typography.body,
                    color: t.colors.textSecondary,
                    marginTop: t.spacing.xs,
                    textAlign: 'center',
                  }}
                >
                  How will you use SkillGap AI?
                </Text>

                <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
                  {(
                    [
                      {
                        r: 'CANDIDATE' as Role,
                        icon: 'school-outline',
                        title: 'Candidate',
                        desc: 'Find jobs and get gap analysis',
                      },
                      {
                        r: 'COMPANY' as Role,
                        icon: 'business-outline',
                        title: 'Company',
                        desc: 'Post jobs and hire talent',
                      },
                    ] as const
                  ).map((opt) => (
                    <Pressable
                      key={opt.r}
                      onPress={() => {
                        setRole(opt.r);
                        setStep(2);
                      }}
                      style={({ pressed }) => ({
                        borderRadius: t.borderRadius.lg,
                        borderWidth: 2,
                        borderColor: role === opt.r ? t.colors.primary : t.colors.border,
                        backgroundColor:
                          role === opt.r ? t.colors.surfaceSecondary : t.colors.surface,
                        padding: t.spacing.lg,
                        opacity: pressed ? 0.9 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: t.spacing.md,
                        ...t.shadows.sm,
                      })}
                    >
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor:
                            role === opt.r ? t.colors.primary : t.colors.surfaceSecondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name={opt.icon as any}
                          size={28}
                          color={role === opt.r ? '#FFFFFF' : t.colors.textPrimary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
                          {opt.title}
                        </Text>
                        <Text
                          style={{
                            ...t.typography.caption,
                            color: t.colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {opt.desc}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={role === opt.r ? t.colors.primary : t.colors.border}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Step 2: User details */}
            {step === 2 && (
              <View>
                <Text
                  style={{ ...t.typography.h2, color: t.colors.textPrimary, textAlign: 'center' }}
                >
                  Your details
                </Text>
                <Text
                  style={{
                    ...t.typography.body,
                    color: t.colors.textSecondary,
                    marginTop: t.spacing.xs,
                    textAlign: 'center',
                  }}
                >
                  Tell us about yourself
                </Text>

                <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
                  <View>
                    <Text
                      style={{
                        ...t.typography.caption,
                        fontWeight: '600',
                        color: t.colors.textPrimary,
                        marginBottom: 8,
                      }}
                    >
                      Full name
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
                      <Ionicons name="person-outline" size={20} color={t.colors.textSecondary} />
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="John Doe"
                        placeholderTextColor={t.colors.textSecondary}
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

                  <View>
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
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={t.colors.textSecondary}
                      />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min 8 characters"
                        placeholderTextColor={t.colors.textSecondary}
                        secureTextEntry={!showPw}
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
                    {/* Password strength */}
                    {password.length > 0 && (
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 6,
                          marginTop: t.spacing.sm,
                          paddingHorizontal: 4,
                        }}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <View
                            key={i}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor:
                                i <= pwStrength ? strengthColors[pwStrength] : strengthColors[0],
                            }}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.xl }}>
                  <Pressable
                    onPress={() => setStep(1)}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: t.borderRadius.pill,
                      borderWidth: 1,
                      borderColor: t.colors.border,
                      backgroundColor: t.colors.surface,
                      paddingVertical: 18,
                      minHeight: t.minTouchTarget,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        ...t.typography.body,
                        fontWeight: '600',
                        color: t.colors.textPrimary,
                      }}
                    >
                      Back
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setStep(3)}
                    style={({ pressed }) => ({
                      flex: 1.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: t.borderRadius.pill,
                      backgroundColor: t.colors.primary,
                      paddingVertical: 18,
                      minHeight: t.minTouchTarget,
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      ...t.shadows.card,
                    })}
                  >
                    <Text style={{ ...t.typography.body, fontWeight: '700', color: '#FFFFFF' }}>
                      Continue
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Step 3: Skills or company info */}
            {step === 3 && (
              <View>
                {role === 'CANDIDATE' ? (
                  <>
                    <Text
                      style={{
                        ...t.typography.h2,
                        color: t.colors.textPrimary,
                        textAlign: 'center',
                      }}
                    >
                      Pick your skills
                    </Text>
                    <Text
                      style={{
                        ...t.typography.body,
                        color: t.colors.textSecondary,
                        marginTop: t.spacing.xs,
                        textAlign: 'center',
                      }}
                    >
                      Select up to 20 skills ({skills.length}/20)
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: t.spacing.xl,
                      }}
                    >
                      {skillOptions.map((skill) => {
                        const active = skills.includes(skill);
                        return (
                          <Pressable
                            key={skill}
                            onPress={() => toggleSkill(skill)}
                            style={({ pressed }) => ({
                              borderRadius: t.borderRadius.pill,
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              backgroundColor: active
                                ? t.colors.primary
                                : t.colors.surfaceSecondary,
                              borderWidth: 1,
                              borderColor: active ? t.colors.primary : t.colors.border,
                              opacity: pressed ? 0.8 : 1,
                            })}
                          >
                            <Text
                              style={{
                                ...t.typography.caption,
                                fontWeight: '600',
                                color: active ? '#FFFFFF' : t.colors.textSecondary,
                              }}
                            >
                              {active ? '✓ ' : ''}
                              {skill}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        ...t.typography.h2,
                        color: t.colors.textPrimary,
                        textAlign: 'center',
                      }}
                    >
                      Company details
                    </Text>
                    <Text
                      style={{
                        ...t.typography.body,
                        color: t.colors.textSecondary,
                        marginTop: t.spacing.xs,
                        textAlign: 'center',
                      }}
                    >
                      Tell us about your organization
                    </Text>
                    <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
                      <View>
                        <Text
                          style={{
                            ...t.typography.caption,
                            fontWeight: '600',
                            color: t.colors.textPrimary,
                            marginBottom: 8,
                          }}
                        >
                          Company name
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
                          <Ionicons
                            name="business-outline"
                            size={20}
                            color={t.colors.textSecondary}
                          />
                          <TextInput
                            value={companyName}
                            onChangeText={setCompanyName}
                            placeholder="Acme Inc"
                            placeholderTextColor={t.colors.textSecondary}
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
                      <View>
                        <Text
                          style={{
                            ...t.typography.caption,
                            fontWeight: '600',
                            color: t.colors.textPrimary,
                            marginBottom: 8,
                          }}
                        >
                          Industry
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
                          <Ionicons
                            name="briefcase-outline"
                            size={20}
                            color={t.colors.textSecondary}
                          />
                          <TextInput
                            value={industry}
                            onChangeText={setIndustry}
                            placeholder="Technology"
                            placeholderTextColor={t.colors.textSecondary}
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
                      <View>
                        <Text
                          style={{
                            ...t.typography.caption,
                            fontWeight: '600',
                            color: t.colors.textPrimary,
                            marginBottom: 8,
                          }}
                        >
                          Website (optional)
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
                          <Ionicons name="globe-outline" size={20} color={t.colors.textSecondary} />
                          <TextInput
                            value={website}
                            onChangeText={setWebsite}
                            placeholder="https://example.com"
                            placeholderTextColor={t.colors.textSecondary}
                            autoCapitalize="none"
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
                    </View>
                  </>
                )}

                <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.xl }}>
                  <Pressable
                    onPress={() => setStep(2)}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: t.borderRadius.pill,
                      borderWidth: 1,
                      borderColor: t.colors.border,
                      backgroundColor: t.colors.surface,
                      paddingVertical: 18,
                      minHeight: t.minTouchTarget,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        ...t.typography.body,
                        fontWeight: '600',
                        color: t.colors.textPrimary,
                      }}
                    >
                      Back
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleRegister()}
                    disabled={loading}
                    style={({ pressed }) => ({
                      flex: 1.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: t.borderRadius.pill,
                      backgroundColor: loading ? t.colors.border : t.colors.primary,
                      paddingVertical: 18,
                      minHeight: t.minTouchTarget,
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      ...t.shadows.card,
                    })}
                  >
                    <Text style={{ ...t.typography.body, fontWeight: '700', color: '#FFFFFF' }}>
                      {loading ? (slowRequest ? 'Waking server…' : 'Creating…') : 'Create Account'}
                    </Text>
                  </Pressable>
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
              </View>
            )}

            {/* Sign in link */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: t.spacing.xl,
                gap: 6,
              }}
            >
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                Already have an account?
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable hitSlop={8}>
                  <Text
                    style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.primary }}
                  >
                    Sign in
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
