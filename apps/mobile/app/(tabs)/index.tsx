import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

const skills = [
  { name: 'React', value: 92 },
  { name: 'TypeScript', value: 78 },
  { name: 'Node.js', value: 65 },
  { name: 'CSS', value: 85 },
];

const gaps = [
  { skill: 'Adv. TypeScript', jobs: 8, color: t.colors.error },
  { skill: 'AWS Architecture', jobs: 5, color: t.colors.warning },
  { skill: 'System Design', jobs: 4, color: t.colors.primary },
];

/**
 * Mobile dashboard screen with greeting, match score, skills progress,
 * skill gaps, and AI insights.
 */
export default function DashboardScreen(): React.JSX.Element {
  const router = useRouter();
  const userName = useMobileAuthStore((s) => s.userName);
  const role = useMobileAuthStore((s) => s.role);
  const isCompany = role === 'COMPANY' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const display = userName ?? 'there';
  const initials = display === 'there' ? 'SG' : display.slice(0, 2).toUpperCase();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.xl,
          paddingBottom: t.spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: t.colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: t.colors.primaryDark }}>
                {initials}
              </Text>
            </View>
            <View>
              <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
                Good evening, {display}
              </Text>
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                {isCompany ? 'Your hiring at a glance' : 'Your career at a glance'}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: t.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              ...t.shadows.sm,
            }}
          >
            <Ionicons name="notifications-outline" size={20} color={t.colors.textPrimary} />
            <View
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: t.colors.error,
              }}
            />
          </View>
        </View>

        {/* AI Insights Card - Moved to top for impact */}
        <View
          style={{
            marginTop: t.spacing.md,
            borderRadius: t.borderRadius.lg,
            backgroundColor: '#F3E8FF',
            padding: t.spacing.md,
            ...t.shadows.sm,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.spacing.xs,
              marginBottom: t.spacing.sm,
            }}
          >
            <Ionicons name="sparkles" size={18} color={t.colors.aiPurple} />
            <Text style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.aiPurple }}>
              AI Insights
            </Text>
          </View>
          <Text style={{ ...t.typography.caption, color: '#5B21B6', lineHeight: 22 }}>
            {isAdmin ? (
              'Review company verification submissions, audit logs, and fraud signals from the mobile admin console.'
            ) : isCompany ? (
              'Review applicants by match score and move strong candidates through your hiring pipeline.'
            ) : (
              <>
                Learning <Text style={{ fontWeight: '700' }}>TypeScript generics</Text> could unlock
                5 more job matches. Your React skills are top 10% in your area.
              </>
            )}
          </Text>
          {isAdmin ? (
            <Pressable
              onPress={() => router.push('/admin')}
              style={({ pressed }) => ({
                marginTop: t.spacing.md,
                borderRadius: t.borderRadius.pill,
                backgroundColor: t.colors.aiPurple,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ ...t.typography.caption, fontWeight: '800', color: '#FFFFFF' }}>
                Open admin console
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Match score card */}
        <View
          style={{
            marginTop: t.spacing.lg,
            borderRadius: t.borderRadius.card,
            backgroundColor: t.colors.surface,
            padding: t.spacing.xl,
            alignItems: 'center',
            ...t.shadows.card,
          }}
        >
          <Text
            style={{
              ...t.typography.small,
              fontWeight: '700',
              color: t.colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }}
          >
            {isCompany ? 'Applicant Quality' : 'Overall Match Score'}
          </Text>
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              borderWidth: 12,
              borderColor: t.colors.primaryLight,
              borderTopColor: t.colors.success,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: t.spacing.lg,
              transform: [{ rotate: '45deg' }],
            }}
          >
            <View style={{ transform: [{ rotate: '-45deg' }], alignItems: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: t.colors.textPrimary }}>
                78%
              </Text>
            </View>
          </View>
          <Text
            style={{
              ...t.typography.caption,
              color: t.colors.textSecondary,
              marginTop: t.spacing.md,
            }}
          >
            {isCompany ? (
              'Strong applicants across open roles'
            ) : (
              <>
                Strong match for{' '}
                <Text style={{ fontWeight: '700', color: t.colors.textPrimary }}>12 jobs</Text>
              </>
            )}
          </Text>
        </View>

        {/* Skills progress */}
        <View
          style={{
            marginTop: t.spacing.lg,
            borderRadius: t.borderRadius.card,
            backgroundColor: t.colors.surface,
            padding: t.spacing.lg,
            ...t.shadows.card,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: t.spacing.md,
            }}
          >
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Skills Progress</Text>
            <Ionicons name="chevron-forward" size={20} color={t.colors.textSecondary} />
          </View>

          <View style={{ gap: t.spacing.md }}>
            {skills.map((s) => (
              <View key={s.name}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
                >
                  <Text
                    style={{
                      ...t.typography.caption,
                      fontWeight: '600',
                      color: t.colors.textPrimary,
                    }}
                  >
                    {s.name}
                  </Text>
                  <Text
                    style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.primary }}
                  >
                    {s.value}%
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: t.colors.border,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      backgroundColor: t.colors.primary,
                      width: `${s.value}%`,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Skill gaps */}
        <View
          style={{
            marginTop: t.spacing.lg,
            borderRadius: t.borderRadius.card,
            backgroundColor: t.colors.surface,
            padding: t.spacing.lg,
            ...t.shadows.card,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: t.spacing.sm,
            }}
          >
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
              Skill Gaps to Fill
            </Text>
            <Ionicons name="warning" size={20} color={t.colors.warning} />
          </View>

          <View>
            {gaps.map((g, idx) => (
              <View
                key={g.skill}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: t.spacing.md,
                  borderBottomWidth: idx < gaps.length - 1 ? 1 : 0,
                  borderBottomColor: t.colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                  <View
                    style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: g.color }}
                  />
                  <View>
                    <Text
                      style={{
                        ...t.typography.caption,
                        fontWeight: '600',
                        color: t.colors.textPrimary,
                      }}
                    >
                      {g.skill}
                    </Text>
                    <Text
                      style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 2 }}
                    >
                      Required for {g.jobs} target jobs
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: t.colors.surfaceSecondary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: t.borderRadius.pill,
                  }}
                >
                  <Text
                    style={{ ...t.typography.small, fontWeight: '600', color: t.colors.primary }}
                  >
                    Learn
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
