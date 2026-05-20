import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { mobileApi } from '../../src/lib/http';
import { isAxiosError } from 'axios';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

type JobDetail = {
  id: string;
  title: string;
  company: { name: string; isVerified: boolean };
  description: string;
  requirements: string[];
  responsibilities: string[];
  skillsRequired: Array<{ name: string }>;
  location: string;
  type: string;
  matchScore?: number;
  salaryMin?: number;
  salaryMax?: number;
};

function formatSalary(j: JobDetail): string {
  if (j.salaryMin == null || j.salaryMax == null) return 'Competitive';
  if (j.type === 'INTERNSHIP') {
    return `$${j.salaryMin}–${j.salaryMax}/hr`;
  }
  return `$${Math.round(j.salaryMin / 1000)}k – $${Math.round(j.salaryMax / 1000)}k`;
}

/**
 * Job detail from GET /jobs/:id; apply via POST /applications when signed in.
 */
export default function JobDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const router = useRouter();
  const role = useMobileAuthStore((s) => s.role);
  const canManage = role === 'COMPANY' || role === 'ADMIN';
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    try {
      const res = await mobileApi.get<{ job: JobDetail }>(`/jobs/${encodeURIComponent(id)}`);
      setJob(res.data.job);
    } catch {
      setJob(null);
      Alert.alert('Error', 'Could not load this job.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      await mobileApi.post('/applications', { jobId: job.id });
      Alert.alert('Applied', 'Your application was submitted.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/applications') },
      ]);
    } catch (e) {
      if (isAxiosError(e)) {
        const status = e.response?.status;
        const msg =
          typeof e.response?.data === 'object' &&
          e.response.data &&
          'message' in e.response.data &&
          typeof (e.response.data as { message: unknown }).message === 'string'
            ? (e.response.data as { message: string }).message
            : e.message;
        if (status === 401) {
          Alert.alert('Sign in required', 'Log in to apply for jobs.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log in', onPress: () => router.replace('/(auth)/login') },
          ]);
        } else if (status === 409) {
          Alert.alert('Already applied', 'You have already applied to this role.');
        } else {
          Alert.alert('Could not apply', msg);
        }
      } else {
        Alert.alert('Could not apply', 'Something went wrong.');
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading || !job) {
    return (
      <>
        <Stack.Screen options={{ title: 'Job' }} />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: t.colors.background,
          }}
        >
          {loading ? <ActivityIndicator size="large" color={t.colors.primary} /> : null}
        </View>
      </>
    );
  }

  const score = typeof job.matchScore === 'number' ? job.matchScore : null;
  const scoreColor =
    score == null
      ? t.colors.textSecondary
      : score < 40
        ? t.colors.error
        : score <= 70
          ? t.colors.warning
          : t.colors.success;

  return (
    <>
      <Stack.Screen options={{ title: job.title, headerBackTitle: 'Jobs' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: t.colors.background }}
        contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: t.spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: t.spacing.sm }}
        >
          <Ionicons name="business-outline" size={16} color={t.colors.textSecondary} />
          <Text style={{ ...t.typography.body, color: t.colors.textSecondary }}>
            {job.company.name}
          </Text>
          {job.company.isVerified ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <Ionicons name="checkmark-circle" size={14} color={t.colors.primaryDark} />
              <Text
                style={{ ...t.typography.small, fontWeight: '700', color: t.colors.primaryDark }}
              >
                Verified
              </Text>
            </View>
          ) : null}
        </View>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: t.spacing.md }}
        >
          <Ionicons name="location-outline" size={16} color={t.colors.textSecondary} />
          <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
            {job.location}
          </Text>
          <Text style={{ color: t.colors.textSecondary }}>•</Text>
          <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
            {job.type.replace(/_/g, ' ')}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: t.spacing.lg,
          }}
        >
          <Text style={{ ...t.typography.h3, color: t.colors.primary, fontWeight: '800' }}>
            {formatSalary(job)}
          </Text>
          {score != null ? (
            <View
              style={{
                minWidth: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 4,
                borderColor: scoreColor,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: t.colors.surface,
              }}
            >
              <Text
                style={{ ...t.typography.caption, fontWeight: '800', color: t.colors.textPrimary }}
              >
                {score}%
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={{ ...t.typography.h3, color: t.colors.textPrimary, marginBottom: t.spacing.sm }}
        >
          About
        </Text>
        <Text
          style={{
            ...t.typography.body,
            color: t.colors.textSecondary,
            marginBottom: t.spacing.lg,
          }}
        >
          {job.description}
        </Text>

        {job.skillsRequired.length > 0 ? (
          <>
            <Text
              style={{
                ...t.typography.h3,
                color: t.colors.textPrimary,
                marginBottom: t.spacing.sm,
              }}
            >
              Skills
            </Text>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: t.spacing.lg }}
            >
              {job.skillsRequired.map((s, i) => (
                <View
                  key={`${s.name}-${i}`}
                  style={{
                    backgroundColor: t.colors.surfaceSecondary,
                    borderRadius: t.borderRadius.sm,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>
                    {s.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {job.responsibilities.length > 0 ? (
          <>
            <Text
              style={{
                ...t.typography.h3,
                color: t.colors.textPrimary,
                marginBottom: t.spacing.sm,
              }}
            >
              Responsibilities
            </Text>
            {job.responsibilities.map((line, i) => (
              <View key={`r-${i}`} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Text style={{ color: t.colors.primary }}>•</Text>
                <Text style={{ flex: 1, ...t.typography.body, color: t.colors.textSecondary }}>
                  {line}
                </Text>
              </View>
            ))}
            <View style={{ height: t.spacing.md }} />
          </>
        ) : null}

        {job.requirements.length > 0 ? (
          <>
            <Text
              style={{
                ...t.typography.h3,
                color: t.colors.textPrimary,
                marginBottom: t.spacing.sm,
              }}
            >
              Requirements
            </Text>
            {job.requirements.map((line, i) => (
              <View key={`q-${i}`} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Text style={{ color: t.colors.primary }}>•</Text>
                <Text style={{ flex: 1, ...t.typography.body, color: t.colors.textSecondary }}>
                  {line}
                </Text>
              </View>
            ))}
          </>
        ) : null}

        {canManage ? (
          <View style={{ marginTop: t.spacing.xl, gap: t.spacing.sm }}>
            <Pressable
              onPress={() => router.push(`/company/job-form?id=${encodeURIComponent(job.id)}`)}
              style={({ pressed }) => ({
                borderRadius: t.borderRadius.pill,
                backgroundColor: t.colors.primary,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
                ...t.shadows.card,
              })}
            >
              <Text style={{ color: '#FFFFFF', ...t.typography.body, fontWeight: '700' }}>
                Edit job
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/applications')}
              style={({ pressed }) => ({
                borderRadius: t.borderRadius.pill,
                borderWidth: 1,
                borderColor: t.colors.border,
                backgroundColor: t.colors.surface,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{ color: t.colors.textPrimary, ...t.typography.body, fontWeight: '700' }}
              >
                Review applicants
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => void onApply()}
            disabled={applying}
            style={({ pressed }) => ({
              marginTop: t.spacing.xl,
              borderRadius: t.borderRadius.pill,
              backgroundColor: t.colors.primary,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: applying || pressed ? 0.85 : 1,
              ...t.shadows.card,
            })}
          >
            {applying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', ...t.typography.body, fontWeight: '700' }}>
                Apply now
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </>
  );
}
