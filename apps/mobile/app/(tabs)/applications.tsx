import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { mobileApi } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

const filters = ['All', 'Reviewing', 'Interview', 'Offer', 'Rejected'] as const;
type StatusFilter = (typeof filters)[number];

interface ApplicationRow {
  id: string;
  title: string;
  company: string;
  status: string;
  filterKey: StatusFilter;
  color: string;
  date: string;
  candidate?: string;
}

function statusToFilter(status: string): StatusFilter {
  if (status === 'APPLIED' || status === 'UNDER_REVIEW' || status === 'SHORTLISTED')
    return 'Reviewing';
  if (status === 'INTERVIEW_SCHEDULED' || status === 'INTERVIEW_DONE') return 'Interview';
  if (status === 'OFFER_EXTENDED' || status === 'HIRED') return 'Offer';
  if (status === 'REJECTED') return 'Rejected';
  return 'All';
}

function statusPresentation(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    APPLIED: { label: 'Applied', color: t.colors.primary },
    UNDER_REVIEW: { label: 'Under Review', color: t.colors.warning },
    SHORTLISTED: { label: 'Shortlisted', color: t.colors.primary },
    INTERVIEW_SCHEDULED: { label: 'Interview', color: t.colors.success },
    INTERVIEW_DONE: { label: 'Interview Done', color: t.colors.success },
    OFFER_EXTENDED: { label: 'Offer', color: t.colors.success },
    HIRED: { label: 'Hired', color: t.colors.success },
    REJECTED: { label: 'Rejected', color: t.colors.error },
  };
  return map[status] ?? { label: status, color: t.colors.textSecondary };
}

/**
 * Mobile applications screen with horizontal filter chips and application cards.
 */
export default function ApplicationsScreen(): React.JSX.Element {
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const role = useMobileAuthStore((s) => s.role);
  const isCompany = role === 'COMPANY' || role === 'ADMIN';

  const load = useCallback(async () => {
    const res = await mobileApi.get<{
      applications: Array<{
        id: string;
        status: string;
        appliedAt: string;
        candidate?: { name: string };
        job?: { title: string; company: { name: string } };
      }>;
    }>('/applications');
    const formatted = res.data.applications.map((app) => {
      const { label, color } = statusPresentation(app.status);
      const appliedAt = new Date(app.appliedAt);
      const date = appliedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const title = app.job?.title ?? 'Role';
      const company = app.job?.company.name ?? 'Company';
      return {
        id: app.id,
        title,
        company,
        status: label,
        filterKey: statusToFilter(app.status),
        color,
        date,
        ...(app.candidate?.name ? { candidate: app.candidate.name } : {}),
      };
    });
    setRows(formatted);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        await load();
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = rows.filter((a) => filter === 'All' || a.filterKey === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.md,
          paddingBottom: t.spacing.md,
          backgroundColor: t.colors.surface,
          ...t.shadows.sm,
          zIndex: 10,
        }}
      >
        <Text
          style={{ ...t.typography.h2, color: t.colors.textPrimary, marginBottom: t.spacing.xs }}
        >
          {isCompany ? 'Applicants' : 'Applications'}
        </Text>

        {/* Filter chips */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: t.spacing.sm, paddingVertical: t.spacing.sm }}
          >
            {filters.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  borderRadius: t.borderRadius.pill,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  justifyContent: 'center',
                  backgroundColor: filter === f ? t.colors.primary : t.colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: filter === f ? t.colors.primary : t.colors.border,
                }}
              >
                <Text
                  style={{
                    ...t.typography.caption,
                    fontWeight: '600',
                    color: filter === f ? '#FFFFFF' : t.colors.textSecondary,
                  }}
                >
                  {f}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ height: t.spacing.md }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/application/${item.id}`)}
            style={({ pressed }) => ({
              borderRadius: t.borderRadius.card,
              borderWidth: 1,
              borderColor: t.colors.border,
              backgroundColor: t.colors.surface,
              padding: t.spacing.lg,
              opacity: pressed ? 0.95 : 1,
              ...t.shadows.card,
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: t.spacing.sm,
              }}
            >
              <View style={{ flex: 1, paddingRight: t.spacing.md }}>
                <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, marginBottom: 4 }}>
                  {item.title}
                </Text>
                {isCompany && item.candidate ? (
                  <Text
                    style={{
                      ...t.typography.caption,
                      color: t.colors.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    {item.candidate}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="business-outline" size={14} color={t.colors.textSecondary} />
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                    {item.company}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: `${item.color}15`,
                  borderRadius: t.borderRadius.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: `${item.color}30`,
                }}
              >
                <Text style={{ ...t.typography.small, fontWeight: '700', color: item.color }}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View
              style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.sm }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="calendar-outline" size={14} color={t.colors.textSecondary} />
                <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>
                  Applied {item.date}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.colors.border} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: t.spacing.xxxl,
              marginTop: t.spacing.xxxl,
            }}
          >
            <Ionicons name="document-text-outline" size={64} color={t.colors.border} />
            <Text
              style={{ ...t.typography.h3, color: t.colors.textPrimary, marginTop: t.spacing.md }}
            >
              {loading ? 'Loading applications' : 'No applications'}
            </Text>
            <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: 8 }}>
              {loading ? 'Fetching your data…' : 'You have not applied to any jobs yet'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
