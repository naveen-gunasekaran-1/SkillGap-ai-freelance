import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { clearMobileAuthTokens, mobileApi } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

const menuItems = [
  { icon: 'settings-outline' as const, label: 'Account Settings' },
  { icon: 'notifications-outline' as const, label: 'Notifications' },
  { icon: 'lock-closed-outline' as const, label: 'Privacy & Security' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support' },
];

interface UserProfile {
  name: string;
  email: string;
  role: string;
  title?: string;
  location?: string;
  skills?: string[];
}

interface ApplicationSummary {
  status: string;
  matchScore?: number;
}

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'SG';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    await clearMobileAuthTokens();
    clearSession();
    router.replace('/(auth)/login');
  };

  const loadProfile = useCallback(async () => {
    const [meRes, appsRes] = await Promise.all([
      mobileApi.get<{ user: UserProfile }>('/auth/me'),
      mobileApi.get<{ applications: ApplicationSummary[] }>('/applications'),
    ]);
    setProfile(meRes.data.user);
    setSession(meRes.data.user.name);
    setApplications(appsRes.data.applications);
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
  const displayTitle = profile?.title?.trim() || (profile?.role === 'COMPANY' ? 'Company user' : 'Candidate');
  const displayLocation = profile?.location?.trim() || profile?.email || 'Profile';
  const userSkills = profile?.skills?.length ? profile.skills : [];
  const interviews = applications.filter((app) =>
    ['INTERVIEW_SCHEDULED', 'INTERVIEW_DONE'].includes(app.status),
  ).length;
  const offers = applications.filter((app) => ['OFFER_EXTENDED', 'HIRED'].includes(app.status)).length;
  const match = averageMatch(applications);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: t.spacing.xxxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <View style={{ height: 140, backgroundColor: t.colors.primary, borderBottomLeftRadius: t.borderRadius.xxl, borderBottomRightRadius: t.borderRadius.xxl }} />

        {/* Profile info */}
        <View style={{ alignItems: 'center', marginTop: -48, paddingHorizontal: t.spacing.lg }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: t.colors.primaryLight, borderWidth: 4, borderColor: t.colors.surface, alignItems: 'center', justifyContent: 'center', ...t.shadows.elevated }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: t.colors.primaryDark }}>{initialsFor(displayName)}</Text>
          </View>
          <Text style={{ ...t.typography.h2, color: t.colors.textPrimary, marginTop: t.spacing.md }}>{displayName}</Text>
          <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 }}>{displayTitle}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
            <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>{displayLocation}</Text>
          </View>

          {/* Match score badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: t.spacing.md, backgroundColor: t.colors.primaryLight, borderRadius: t.borderRadius.pill, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Ionicons name="trophy" size={14} color={t.colors.primaryDark} />
            <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.primaryDark }}>
              {match == null ? 'No match data yet' : `${match}% avg match`}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ marginTop: t.spacing.xl, marginHorizontal: t.spacing.lg, flexDirection: 'row', gap: t.spacing.sm }}>
          {[
            { label: 'Applications', value: String(applications.length) },
            { label: 'Interviews', value: String(interviews) },
            { label: 'Offers', value: String(offers) },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.md, alignItems: 'center', ...t.shadows.card }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: t.colors.primary }}>{s.value}</Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={{ marginTop: t.spacing.lg, marginHorizontal: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, padding: t.spacing.lg, ...t.shadows.card }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md }}>
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Skills</Text>
            <Ionicons name="create-outline" size={20} color={t.colors.textSecondary} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {userSkills.length === 0 ? (
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>No skills added yet</Text>
            ) : userSkills.map((s) => (
              <View key={s} style={{ backgroundColor: t.colors.primaryLight, borderRadius: t.borderRadius.pill, paddingHorizontal: 14, paddingVertical: 8 }}>
                <Text style={{ ...t.typography.small, fontWeight: '600', color: t.colors.primaryDark }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings menu */}
        <View style={{ marginTop: t.spacing.lg, marginHorizontal: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, overflow: 'hidden', ...t.shadows.card }}>
          {menuItems.map((item, i) => (
            <Pressable
              key={item.label}
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
              <Text style={{ ...t.typography.body, color: t.colors.textPrimary, flex: 1 }}>{item.label}</Text>
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
          <Text style={{ ...t.typography.body, fontWeight: '600', color: t.colors.error }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
