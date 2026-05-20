import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { clearMobileAuthTokens, mobileApi } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

const menuItems = [
  { icon: 'wifi-outline' as const, label: 'Network Check', route: '/network' as const },
  { icon: 'chatbubbles-outline' as const, label: 'Contact Support', route: '/contact' as const },
  { icon: 'settings-outline' as const, label: 'Account Settings' },
  { icon: 'notifications-outline' as const, label: 'Notifications' },
  { icon: 'lock-closed-outline' as const, label: 'Privacy & Security' },
];

interface UserProfile {
  name: string;
  email: string;
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  title?: string;
  location?: string;
  avatar?: string;
  skills?: string[];
  emailVerified?: boolean;
}

interface ApplicationSummary {
  status: string;
  matchScore?: number;
}

interface CompanyProfile {
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  description?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  verificationBadge?: string | null;
}

interface CompanyJobSummary {
  id: string;
}

interface VerificationDocument {
  id: string;
  type: string;
  originalName: string;
  createdAt: string;
}

interface CompanyVerification {
  id: string;
  status: string;
  region: 'INDIA' | 'GLOBAL';
  countryCode: string;
  rejectionReason?: string | null;
  documents: VerificationDocument[];
}

const documentLabels: Record<string, string> = {
  GST_CERTIFICATE: 'GST certificate',
  PAN: 'PAN',
  CIN: 'CIN',
  CERTIFICATE_OF_INCORPORATION: 'Certificate of incorporation',
  ADDRESS_PROOF: 'Address proof',
  BUSINESS_REGISTRATION: 'Business registration',
  TAX_DOCUMENT: 'Tax document',
  BUSINESS_LICENSE: 'Business license',
};

function initialsFor(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'SG'
  );
}

function averageMatch(applications: ApplicationSummary[]): number | null {
  const scores = applications
    .map((app) => app.matchScore)
    .filter((score): score is number => typeof score === 'number');
  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Mobile profile screen with avatar, user info, skills tags, and settings menu.
 */
export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const setSession = useMobileAuthStore((s) => s.setSession);
  const clearSession = useMobileAuthStore((s) => s.clear);
  const fallbackName = useMobileAuthStore((s) => s.userName);
  const storedRole = useMobileAuthStore((s) => s.role);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [verification, setVerification] = useState<CompanyVerification | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [companyJobs, setCompanyJobs] = useState<CompanyJobSummary[]>([]);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    await clearMobileAuthTokens();
    clearSession();
    router.replace('/(auth)/login');
  };

  const handleResendVerification = async (): Promise<void> => {
    try {
      await mobileApi.post('/auth/email-verification/send');
      Alert.alert('Verification sent', 'Check your inbox for the verification email.');
    } catch {
      Alert.alert('Could not send email', 'Please try again in a moment.');
    }
  };

  const loadProfile = useCallback(async () => {
    const meRes = await mobileApi.get<{ user: UserProfile }>('/auth/me');
    setProfile(meRes.data.user);
    setSession(meRes.data.user.name, meRes.data.user.role);

    const isCompany = meRes.data.user.role === 'COMPANY' || meRes.data.user.role === 'ADMIN';
    const [appsRes, companyRes, jobsRes, verificationRes] = await Promise.allSettled([
      mobileApi.get<{ applications: ApplicationSummary[] }>('/applications'),
      isCompany
        ? mobileApi.get<{ company: CompanyProfile }>('/companies/me')
        : Promise.resolve(null),
      isCompany
        ? mobileApi.get<{ jobs: CompanyJobSummary[] }>('/jobs/company/mine')
        : Promise.resolve(null),
      isCompany
        ? mobileApi.get<{ verification: CompanyVerification | null; requiredDocuments: string[] }>(
            '/companies/me/verification',
          )
        : Promise.resolve(null),
    ]);
    setApplications(appsRes.status === 'fulfilled' ? appsRes.value.data.applications : []);
    setCompany(companyRes.status === 'fulfilled' ? (companyRes.value?.data.company ?? null) : null);
    setCompanyJobs(jobsRes.status === 'fulfilled' ? (jobsRes.value?.data.jobs ?? []) : []);
    setVerification(
      verificationRes.status === 'fulfilled'
        ? (verificationRes.value?.data.verification ?? null)
        : null,
    );
    setRequiredDocuments(
      verificationRes.status === 'fulfilled'
        ? (verificationRes.value?.data.requiredDocuments ?? [])
        : [],
    );
  }, [setSession]);

  useEffect(() => {
    void loadProfile().catch(() => undefined);
  }, [loadProfile]);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const displayName = profile?.name ?? fallbackName ?? 'SkillGap User';
  const activeRole = profile?.role ?? storedRole;
  const isCompany = activeRole === 'COMPANY' || activeRole === 'ADMIN';
  const profileName = isCompany ? (company?.name ?? displayName) : displayName;
  const displayTitle = isCompany
    ? (company?.industry ?? 'Company workspace')
    : profile?.title?.trim() || 'Candidate';
  const displayLocation = isCompany
    ? (company?.website ?? company?.size ?? profile?.email ?? 'Company profile')
    : profile?.location?.trim() || profile?.email || 'Profile';
  const userSkills = profile?.skills?.length ? profile.skills : [];
  const interviews = applications.filter((app) =>
    ['INTERVIEW_SCHEDULED', 'INTERVIEW_DONE'].includes(app.status),
  ).length;
  const offers = applications.filter((app) =>
    ['OFFER_EXTENDED', 'HIRED'].includes(app.status),
  ).length;
  const match = averageMatch(applications);
  const stats = isCompany
    ? [
        { label: 'Open Jobs', value: String(companyJobs.length) },
        { label: 'Applicants', value: String(applications.length) },
        { label: 'Interviews', value: String(interviews) },
      ]
    : [
        { label: 'Applications', value: String(applications.length) },
        { label: 'Interviews', value: String(interviews) },
        { label: 'Offers', value: String(offers) },
      ];
  const uploadedTypes = new Set(verification?.documents.map((doc) => doc.type) ?? []);
  const verificationStatus =
    company?.isVerified && company.verificationStatus === 'VERIFIED'
      ? 'VERIFIED'
      : (verification?.status ?? company?.verificationStatus ?? 'NOT_STARTED');

  const createVerification = async (region: 'INDIA' | 'GLOBAL'): Promise<void> => {
    setVerificationBusy(true);
    try {
      const res = await mobileApi.post<{
        verification: CompanyVerification;
        requiredDocuments: string[];
      }>('/companies/me/verification', {
        region,
        countryCode: region === 'INDIA' ? 'IN' : 'US',
      });
      setVerification(res.data.verification);
      setRequiredDocuments(res.data.requiredDocuments);
      Alert.alert(
        'Verification started',
        'Upload the required documents and submit for admin review.',
      );
    } catch {
      Alert.alert(
        'Could not start verification',
        'Please try again from the web dashboard if this continues.',
      );
    } finally {
      setVerificationBusy(false);
    }
  };

  const uploadDocument = async (type: string): Promise<void> => {
    if (!verification) {
      Alert.alert(
        'Start verification first',
        'Create a verification profile before uploading documents.',
      );
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }
    const asset = result.assets[0];
    const mimeType =
      asset.mimeType ??
      (asset.name.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : asset.name.toLowerCase().endsWith('.png')
          ? 'image/png'
          : 'image/jpeg');
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(mimeType)) {
      Alert.alert('Unsupported file', 'Upload a PDF, JPG, or PNG document.');
      return;
    }
    const form = new FormData();
    form.append('type', type);
    form.append('verificationId', verification.id);
    form.append('file', {
      uri: asset.uri,
      name:
        asset.name ||
        `${type.toLowerCase()}.${mimeType === 'application/pdf' ? 'pdf' : mimeType === 'image/png' ? 'png' : 'jpg'}`,
      type: mimeType,
    } as unknown as Blob);
    setVerificationBusy(true);
    try {
      await mobileApi.post('/companies/me/verification/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadProfile();
      Alert.alert('Document uploaded', `${documentLabels[type] ?? type} was added.`);
    } catch {
      Alert.alert('Upload failed', 'Upload PDF, JPG, or PNG documents up to 6MB.');
    } finally {
      setVerificationBusy(false);
    }
  };

  const submitVerification = async (): Promise<void> => {
    if (!verification) return;
    const missing = requiredDocuments.filter((type) => !uploadedTypes.has(type));
    if (missing.length > 0) {
      Alert.alert(
        'Missing documents',
        `Upload: ${missing.map((type) => documentLabels[type] ?? type).join(', ')}`,
      );
      return;
    }
    setVerificationBusy(true);
    try {
      const res = await mobileApi.post<{ verification: CompanyVerification }>(
        '/companies/me/verification/submit',
        { verificationId: verification.id },
      );
      setVerification(res.data.verification);
      Alert.alert('Submitted', 'Your verification is now ready for admin review.');
    } catch {
      Alert.alert('Submit failed', 'Please check all required documents and try again.');
    } finally {
      setVerificationBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: t.spacing.xxxl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <View
          style={{
            height: 140,
            backgroundColor: t.colors.primary,
            borderBottomLeftRadius: t.borderRadius.xxl,
            borderBottomRightRadius: t.borderRadius.xxl,
          }}
        />

        {/* Profile info */}
        <View style={{ alignItems: 'center', marginTop: -48, paddingHorizontal: t.spacing.lg }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: t.colors.primaryLight,
              borderWidth: 4,
              borderColor: t.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              ...t.shadows.elevated,
            }}
          >
            {profile?.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={{ width: '100%', height: '100%', borderRadius: 48 }}
              />
            ) : (
              <Text style={{ fontSize: 32, fontWeight: '800', color: t.colors.primaryDark }}>
                {initialsFor(profileName)}
              </Text>
            )}
          </View>
          <Text
            style={{ ...t.typography.h2, color: t.colors.textPrimary, marginTop: t.spacing.md }}
          >
            {profileName}
          </Text>
          <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 }}>
            {displayTitle}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
            <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>
              {displayLocation}
            </Text>
          </View>

          {/* Status badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: t.spacing.md,
              backgroundColor: t.colors.primaryLight,
              borderRadius: t.borderRadius.pill,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Ionicons
              name={isCompany ? 'business' : 'trophy'}
              size={14}
              color={t.colors.primaryDark}
            />
            <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.primaryDark }}>
              {isCompany
                ? `${applications.length} applicants tracked`
                : match == null
                  ? 'No match data yet'
                  : `${match}% avg match`}
            </Text>
          </View>
          {!profile?.emailVerified && (
            <Pressable
              onPress={() => void handleResendVerification()}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: t.spacing.sm,
                borderRadius: t.borderRadius.pill,
                borderWidth: 1,
                borderColor: t.colors.warning,
                paddingHorizontal: 14,
                paddingVertical: 8,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Ionicons name="mail-unread-outline" size={14} color={t.colors.warning} />
              <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.warning }}>
                Resend verification email
              </Text>
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View
          style={{
            marginTop: t.spacing.xl,
            marginHorizontal: t.spacing.lg,
            flexDirection: 'row',
            gap: t.spacing.sm,
          }}
        >
          {stats.map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                borderRadius: t.borderRadius.card,
                backgroundColor: t.colors.surface,
                padding: t.spacing.md,
                alignItems: 'center',
                ...t.shadows.card,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: '800', color: t.colors.primary }}>
                {s.value}
              </Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Role details */}
        <View
          style={{
            marginTop: t.spacing.lg,
            marginHorizontal: t.spacing.lg,
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
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
              {isCompany ? 'Company' : 'Skills'}
            </Text>
            <Ionicons name="create-outline" size={20} color={t.colors.textSecondary} />
          </View>
          {isCompany ? (
            <View style={{ gap: t.spacing.sm }}>
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                {company?.description ||
                  'Company profile details are ready to be completed from the web dashboard.'}
              </Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>
                {company?.industry ?? 'Industry not set'} · {company?.size ?? 'Size not set'}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {userSkills.length === 0 ? (
                <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                  No skills added yet
                </Text>
              ) : (
                userSkills.map((s) => (
                  <View
                    key={s}
                    style={{
                      backgroundColor: t.colors.primaryLight,
                      borderRadius: t.borderRadius.pill,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        ...t.typography.small,
                        fontWeight: '600',
                        color: t.colors.primaryDark,
                      }}
                    >
                      {s}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {isCompany && (
          <View
            style={{
              marginTop: t.spacing.lg,
              marginHorizontal: t.spacing.lg,
              borderRadius: t.borderRadius.card,
              backgroundColor: t.colors.surface,
              padding: t.spacing.lg,
              ...t.shadows.card,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: t.spacing.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
                  Company verification
                </Text>
                <Text
                  style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}
                >
                  Required before posting jobs and reviewing applicants.
                </Text>
              </View>
              <View
                style={{
                  borderRadius: t.borderRadius.pill,
                  backgroundColor: verificationStatus === 'VERIFIED' ? '#ECFDF5' : '#FFFBEB',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    ...t.typography.small,
                    fontWeight: '800',
                    color: verificationStatus === 'VERIFIED' ? t.colors.success : t.colors.warning,
                  }}
                >
                  {verificationStatus.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            {!verification ? (
              <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md }}>
                <Pressable
                  disabled={verificationBusy}
                  onPress={() => void createVerification('INDIA')}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: t.borderRadius.pill,
                    backgroundColor: t.colors.primary,
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: pressed || verificationBusy ? 0.75 : 1,
                  })}
                >
                  <Text style={{ ...t.typography.caption, fontWeight: '800', color: '#FFFFFF' }}>
                    Start India
                  </Text>
                </Pressable>
                <Pressable
                  disabled={verificationBusy}
                  onPress={() => void createVerification('GLOBAL')}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: t.borderRadius.pill,
                    backgroundColor: t.colors.surfaceSecondary,
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: pressed || verificationBusy ? 0.75 : 1,
                  })}
                >
                  <Text
                    style={{
                      ...t.typography.caption,
                      fontWeight: '800',
                      color: t.colors.textPrimary,
                    }}
                  >
                    Start Global
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginTop: t.spacing.md }}>
                {requiredDocuments.map((type) => {
                  const uploaded = uploadedTypes.has(type);
                  return (
                    <Pressable
                      key={type}
                      onPress={() => void uploadDocument(type)}
                      disabled={
                        verificationBusy ||
                        ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED'].includes(verification.status)
                      }
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: t.spacing.sm,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: t.colors.border,
                        opacity: pressed || verificationBusy ? 0.65 : 1,
                      })}
                    >
                      <Ionicons
                        name={uploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
                        size={20}
                        color={uploaded ? t.colors.success : t.colors.textSecondary}
                      />
                      <Text
                        style={{ flex: 1, ...t.typography.caption, color: t.colors.textPrimary }}
                      >
                        {documentLabels[type] ?? type}
                      </Text>
                      <Text
                        style={{
                          ...t.typography.small,
                          fontWeight: '800',
                          color: uploaded ? t.colors.success : t.colors.primary,
                        }}
                      >
                        {uploaded ? 'Uploaded' : 'Upload'}
                      </Text>
                    </Pressable>
                  );
                })}
                {verification.rejectionReason ? (
                  <Text
                    style={{
                      ...t.typography.small,
                      color: t.colors.error,
                      marginTop: t.spacing.md,
                    }}
                  >
                    Rejected: {verification.rejectionReason}
                  </Text>
                ) : null}
                {!['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED'].includes(verification.status) && (
                  <Pressable
                    disabled={verificationBusy}
                    onPress={() => void submitVerification()}
                    style={({ pressed }) => ({
                      marginTop: t.spacing.md,
                      borderRadius: t.borderRadius.pill,
                      backgroundColor: t.colors.primary,
                      minHeight: t.minTouchTarget,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed || verificationBusy ? 0.75 : 1,
                    })}
                  >
                    {verificationBusy ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={{ ...t.typography.body, fontWeight: '800', color: '#FFFFFF' }}>
                        Submit for review
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        {/* Settings menu */}
        <View
          style={{
            marginTop: t.spacing.lg,
            marginHorizontal: t.spacing.lg,
            borderRadius: t.borderRadius.card,
            backgroundColor: t.colors.surface,
            overflow: 'hidden',
            ...t.shadows.card,
          }}
        >
          {menuItems.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => {
                if ('route' in item) {
                  router.push(item.route);
                }
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.spacing.md,
                paddingHorizontal: t.spacing.lg,
                paddingVertical: t.spacing.md,
                minHeight: t.minTouchTarget,
                backgroundColor: pressed ? t.colors.surfaceSecondary : 'transparent',
                borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: t.colors.border,
              })}
            >
              <Ionicons name={item.icon} size={22} color={t.colors.textSecondary} />
              <Text style={{ ...t.typography.body, color: t.colors.textPrimary, flex: 1 }}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={t.colors.border} />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => void handleSignOut()}
          style={({ pressed }) => ({
            marginTop: t.spacing.xl,
            marginHorizontal: t.spacing.lg,
            borderRadius: t.borderRadius.pill,
            borderWidth: 1,
            borderColor: t.colors.error,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: t.spacing.sm,
            minHeight: t.minTouchTarget,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={20} color={t.colors.error} />
          <Text style={{ ...t.typography.body, fontWeight: '600', color: t.colors.error }}>
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
