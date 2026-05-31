import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { useMobileAuthStore } from '../../src/stores/authStore';
import { mobileApi, getMobileApiErrorMessage } from '../../src/lib/http';

const t = theme;
const colors = ['#10B981', '#2563EB', '#F59E0B', '#7C3AED', '#EF4444', '#06B6D4'];

interface SkillLevel {
  name: string;
  level: string;
}

interface UserProfile {
  name: string;
  email: string;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  title?: string;
  location?: string;
  avatar?: string;
  skills: string[];
  skillLevels: SkillLevel[];
  emailVerified: boolean;
}

interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  description: string;
  isVerified: boolean;
  verificationStatus: string;
}

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  company: {
    name: string;
  };
}

interface Candidate {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
}

interface GapReport {
  overallMatchPercent: number;
  summary: string;
  criticalGaps: Array<{
    skillName: string;
    required: string;
    candidate: string;
    severity: string;
    explanation: string;
  }>;
  strengths: string[];
  recommendations: Array<{
    skillName: string;
    resourceTitle: string;
    platform: string;
    url: string;
    estimatedHours: number;
    isFree: boolean;
    priority: number;
  }>;
}

interface Application {
  id: string;
  status: string;
  matchScore: number;
  appliedAt: string;
  gapReport?: GapReport;
  job?: Job;
  candidate?: Candidate;
}

interface CompanyJob {
  id: string;
  title: string;
  applicantCount: number;
}

const levelToValue = (level: string) => {
  const map: Record<string, number> = {
    BEGINNER: 40,
    INTERMEDIATE: 70,
    ADVANCED: 90,
    EXPERT: 100,
  };
  return map[level.toUpperCase()] ?? 70;
};

export default function DashboardScreen(): React.JSX.Element {
  const router = useRouter();
  const setSession = useMobileAuthStore((s) => s.setSession);
  const fallbackName = useMobileAuthStore((s) => s.userName);
  const storedRole = useMobileAuthStore((s) => s.role);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companyJobs, setCompanyJobs] = useState<CompanyJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const meRes = await mobileApi.get<{ user: UserProfile }>('/auth/me');
      setProfile(meRes.data.user);
      setSession(meRes.data.user.name, meRes.data.user.role);

      const activeRole = meRes.data.user.role;
      const isRecruiter = activeRole === 'COMPANY' || activeRole === 'ADMIN';

      const appsRes = await mobileApi.get<{ applications: Application[] }>('/applications');
      setApplications(appsRes.data.applications);

      if (isRecruiter) {
        const companyRes = await mobileApi.get<{ company: CompanyProfile }>('/companies/me');
        setCompany(companyRes.data.company);

        const jobsRes = await mobileApi.get<{ jobs: CompanyJob[] }>('/jobs/company/mine');
        setCompanyJobs(jobsRes.data.jobs);
      }
    } catch (err) {
      setError(getMobileApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setSession]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadData();
  };

  const activeRole = profile?.role ?? storedRole;
  const isCompany = activeRole === 'COMPANY' || activeRole === 'ADMIN';
  const isAdmin = activeRole === 'ADMIN';
  const display = profile?.name ?? fallbackName ?? 'there';
  const initials = display === 'there' ? 'SG' : display.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 12 }}>
          Loading your dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  // --- Recruiter (Company) View ---
  if (isCompany) {
    const isVerified = Boolean(company?.isVerified && company.verificationStatus === 'VERIFIED');
    const interviewCount = applications.filter(
      (a) => a.status === 'INTERVIEW_SCHEDULED' || a.status === 'INTERVIEW_DONE',
    ).length;
    const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;
    const avgMatch =
      applications.length > 0
        ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
        : 0;

    const stats = [
      { label: 'Active Jobs', value: String(companyJobs.length) },
      { label: 'Applicants', value: String(applications.length) },
      { label: 'Interviews', value: String(interviewCount) },
    ];

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: t.spacing.lg,
            paddingTop: t.spacing.xl,
            paddingBottom: t.spacing.xxxl,
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, flex: 1, marginRight: t.spacing.md }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center', ...t.shadows.card, flexShrink: 0 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }} numberOfLines={1} ellipsizeMode="tail">Good evening, {display}</Text>
                <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }} numberOfLines={1} ellipsizeMode="tail">Your hiring overview</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/profile')}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.surface, alignItems: 'center', justifyContent: 'center', ...t.shadows.sm, flexShrink: 0 }}
            >
              <Ionicons name="business-outline" size={20} color={t.colors.textPrimary} />
            </Pressable>
          </View>

          {/* AI / Verification Banner */}
          {!isVerified ? (
            <View style={{ marginTop: t.spacing.md, borderRadius: t.borderRadius.lg, backgroundColor: '#FEF3C7', padding: t.spacing.lg, borderWidth: 1, borderColor: '#FDE68A', ...t.shadows.card }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, marginBottom: t.spacing.sm }}>
                <Ionicons name="shield-outline" size={18} color={t.colors.warning} />
                <Text style={{ ...t.typography.caption, fontWeight: '700', color: '#B45309' }}>Verification Required</Text>
              </View>
              <Text style={{ ...t.typography.caption, color: '#92400E', lineHeight: 22 }}>
                Please verify your recruiter workspace in the Profile tab to enable applicant review, resume downloads, and full hiring pipeline tools.
              </Text>
              <Pressable
                onPress={() => router.push('/profile')}
                style={({ pressed }) => ({
                  marginTop: t.spacing.md,
                  borderRadius: t.borderRadius.pill,
                  backgroundColor: '#B45309',
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Text style={{ ...t.typography.caption, fontWeight: '800', color: '#FFFFFF' }}>Complete Verification</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ marginTop: t.spacing.md, borderRadius: t.borderRadius.lg, backgroundColor: '#F3E8FF', padding: t.spacing.lg, borderWidth: 1, borderColor: '#E9D5FF', ...t.shadows.card }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, marginBottom: t.spacing.sm }}>
                <Ionicons name="sparkles" size={18} color={t.colors.aiPurple} />
                <Text style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.aiPurple }}>AI Recruiter Insights</Text>
              </View>
              <Text style={{ ...t.typography.caption, color: '#5B21B6', lineHeight: 22 }}>
                {isAdmin
                  ? 'Review company verification submissions, inspect document audit trails, and manage fraud flags.'
                  : 'Review applicant resumes matched by skills to find candidates matching your job criteria.'}
              </Text>
              {isAdmin && (
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
                  <Text style={{ ...t.typography.caption, fontWeight: '800', color: '#FFFFFF' }}>Open Admin Console</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Stats Cards */}
          <View style={{ marginTop: t.spacing.lg, flexDirection: 'row', gap: t.spacing.sm }}>
            {stats.map((s) => (
              <View key={s.label} style={{ flex: 1, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.md, alignItems: 'center', ...t.shadows.card }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: t.colors.primary }}>{s.value}</Text>
                <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Match Score Card */}
          {isVerified && (
            <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: t.colors.border, ...t.shadows.card }}>
              <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Average Applicant Match
              </Text>
              <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: t.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: t.spacing.lg }}>
                <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 10, borderColor: '#E0E7FF', borderTopColor: t.colors.success, borderRightColor: t.colors.success, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surface, transform: [{ rotate: '45deg' }] }}>
                  <View style={{ transform: [{ rotate: '-45deg' }], alignItems: 'center' }}>
                    <Text style={{ fontSize: 28, fontWeight: '800', color: t.colors.textPrimary }}>{avgMatch}%</Text>
                    <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 2 }}>quality</Text>
                  </View>
                </View>
              </View>
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: t.spacing.md }}>
                Overall talent pool compatibility matches
              </Text>
            </View>
          )}

          {/* Recent Applicants */}
          {isVerified && (
            <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, ...t.shadows.card }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
                <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Recent Applicants</Text>
                <Pressable onPress={() => router.push('/applications')}>
                  <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.primary }}>View All</Text>
                </Pressable>
              </View>
              <View style={{ gap: t.spacing.md }}>
                {applications.slice(0, 5).map((app) => (
                  <Pressable
                    key={app.id}
                    onPress={() => router.push({ pathname: '/applications', params: { applicationId: app.id } })}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: t.spacing.sm,
                      borderBottomWidth: 1,
                      borderBottomColor: t.colors.border,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.textPrimary }} numberOfLines={1}>
                        {app.candidate?.name ?? 'Candidate'}
                      </Text>
                      <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                        {app.job?.title ?? 'Job Title'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ backgroundColor: app.status === 'APPLIED' ? '#DBEAFE' : app.status === 'SHORTLISTED' ? '#D1FAE5' : '#F3F4F6', borderRadius: t.borderRadius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: app.status === 'APPLIED' ? '#1E40AF' : app.status === 'SHORTLISTED' ? '#065F46' : '#374151' }}>
                          {app.status === 'APPLIED' ? 'New' : app.status === 'SHORTLISTED' ? 'Shortlisted' : 'Reviewed'}
                        </Text>
                      </View>
                      <Text style={{ ...t.typography.caption, fontWeight: '800', color: t.colors.primary }}>
                        {app.matchScore}%
                      </Text>
                    </View>
                  </Pressable>
                ))}
                {applications.length === 0 && (
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, paddingVertical: 10 }}>
                    No applicant submissions yet.
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, ...t.shadows.card }}>
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, marginBottom: t.spacing.md }}>Quick Actions</Text>
            <View style={{ gap: t.spacing.sm }}>
              <Pressable
                onPress={() => router.push('/jobs')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.spacing.md,
                  padding: t.spacing.md,
                  borderRadius: t.borderRadius.card,
                  backgroundColor: t.colors.surfaceSecondary,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons name="add-circle" size={24} color={t.colors.primary} />
                <View>
                  <Text style={{ ...t.typography.body, fontWeight: '700', color: t.colors.textPrimary }}>Create a Job</Text>
                  <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 2 }}>Post a new opening</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Candidate View ---
  const avgMatch =
    applications.length > 0
      ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
      : 0;
  const interviewsCount = applications.filter((a) =>
    ['INTERVIEW_SCHEDULED', 'INTERVIEW_DONE'].includes(a.status),
  ).length;
  const offersCount = applications.filter((a) =>
    ['OFFER_EXTENDED', 'HIRED'].includes(a.status),
  ).length;

  const candidateStats = [
    { label: 'Applications', value: String(applications.length) },
    { label: 'Interviews', value: String(interviewsCount) },
    { label: 'Offers', value: String(offersCount) },
  ];

  // Find primary gap report (first application having gap report fields)
  const primaryApp = applications.find((a) => a.gapReport);
  const primaryGapReport = primaryApp?.gapReport ?? null;

  const activeSkills = profile?.skills ?? [];
  const activeSkillLevels = profile?.skillLevels ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.xl,
          paddingBottom: t.spacing.xxxl,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, flex: 1, marginRight: t.spacing.md }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.colors.primary, alignItems: 'center', justifyContent: 'center', ...t.shadows.card, flexShrink: 0 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFFFFF' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }} numberOfLines={1} ellipsizeMode="tail">Good evening, {display}</Text>
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }} numberOfLines={1} ellipsizeMode="tail">Your career status</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/profile')}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.surface, alignItems: 'center', justifyContent: 'center', ...t.shadows.sm, flexShrink: 0 }}
          >
            <Ionicons name="person-outline" size={20} color={t.colors.textPrimary} />
          </Pressable>
        </View>

        {/* AI Insights Card */}
        <View style={{ marginTop: t.spacing.md, borderRadius: t.borderRadius.lg, backgroundColor: '#F3E8FF', padding: t.spacing.lg, borderWidth: 1, borderColor: '#E9D5FF', ...t.shadows.card }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, marginBottom: t.spacing.sm }}>
            <Ionicons name="sparkles" size={18} color={t.colors.aiPurple} />
            <Text style={{ ...t.typography.caption, fontWeight: '700', color: t.colors.aiPurple }}>AI Insights</Text>
          </View>
          <Text style={{ ...t.typography.caption, color: '#5B21B6', lineHeight: 22 }}>
            {primaryGapReport?.summary ? (
              primaryGapReport.summary
            ) : (
              <>
                Apply to a job to generate a personalized <Text style={{ fontWeight: '700' }}>AI Gap Report</Text> and receive custom learning recommendations.
              </>
            )}
          </Text>
        </View>

        {/* Match Score Card */}
        <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: t.colors.border, ...t.shadows.card }}>
          <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Overall Match Score
          </Text>
          <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: t.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: t.spacing.lg }}>
            <View style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 12, borderColor: '#E0E7FF', borderTopColor: t.colors.success, borderRightColor: t.colors.success, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surface, transform: [{ rotate: '45deg' }] }}>
              <View style={{ transform: [{ rotate: '-45deg' }], alignItems: 'center' }}>
                <Text style={{ fontSize: 36, fontWeight: '800', color: t.colors.textPrimary }}>{avgMatch}%</Text>
                <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 2 }}>match</Text>
              </View>
            </View>
          </View>
          <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: t.spacing.md }}>
            Avg match across {applications.length} applications
          </Text>
        </View>

        {/* Stats Row */}
        <View style={{ marginTop: t.spacing.lg, flexDirection: 'row', gap: t.spacing.sm }}>
          {candidateStats.map((s) => (
            <View key={s.label} style={{ flex: 1, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.md, alignItems: 'center', ...t.shadows.card }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: t.colors.primary }}>{s.value}</Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Skills Progress */}
        <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, ...t.shadows.card }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Skills Progress</Text>
            <Pressable onPress={() => router.push('/profile')}>
              <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.primary }}>Manage</Text>
            </Pressable>
          </View>

          <View style={{ gap: t.spacing.md }}>
            {activeSkillLevels.slice(0, 4).map((s, idx) => {
              const val = levelToValue(s.level);
              const color = colors[idx % colors.length] || t.colors.primary;
              return (
                <View key={s.name}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.textPrimary }}>{s.name}</Text>
                    <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.primary }}>{val}% ({s.level.toLowerCase()})</Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.surfaceSecondary, overflow: 'hidden' }}>
                    <View style={{ height: '100%', backgroundColor: color, width: `${val}%`, borderRadius: 4 }} />
                  </View>
                </View>
              );
            })}
            {activeSkillLevels.length === 0 &&
              activeSkills.slice(0, 4).map((name, idx) => {
                const val = [92, 78, 65, 85][idx] ?? 70;
                const color = colors[idx % colors.length] || t.colors.primary;
                return (
                  <View key={name}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.textPrimary }}>{name}</Text>
                      <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.primary }}>{val}%</Text>
                    </View>
                    <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.surfaceSecondary, overflow: 'hidden' }}>
                      <View style={{ height: '100%', backgroundColor: color, width: `${val}%`, borderRadius: 4 }} />
                    </View>
                  </View>
                );
              })}
            {activeSkills.length === 0 && activeSkillLevels.length === 0 && (
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                No profile skills listed. Add them in Profile.
              </Text>
            )}
          </View>
        </View>

        {/* Skill gaps */}
        <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.lg, borderWidth: 1, borderColor: t.colors.border, ...t.shadows.card }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm }}>
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Skill Gaps to Fill</Text>
            <Ionicons name="warning" size={20} color={t.colors.warning} />
          </View>

          <View>
            {primaryGapReport?.criticalGaps.slice(0, 3).map((g, idx) => {
              const color = g.severity === 'CRITICAL' ? t.colors.error : g.severity === 'MODERATE' ? t.colors.warning : t.colors.primary;
              return (
                <View key={g.skillName} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: t.spacing.md, borderBottomWidth: idx < 2 ? 1 : 0, borderBottomColor: t.colors.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, flex: 1, marginRight: 8 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...t.typography.caption, fontWeight: '600', color: t.colors.textPrimary }}>{g.skillName}</Text>
                      <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 2 }}>{g.explanation}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: t.colors.surfaceSecondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: t.borderRadius.pill }}>
                    <Text style={{ ...t.typography.small, fontWeight: '600', color: t.colors.primary }}>{g.severity.toLowerCase()}</Text>
                  </View>
                </View>
              );
            })}
            {(!primaryGapReport || primaryGapReport.criticalGaps.length === 0) && (
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, paddingVertical: 10 }}>
                No critical skill gaps identified yet. Gaps will populate from application results.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
