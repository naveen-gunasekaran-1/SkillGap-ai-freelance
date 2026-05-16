import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { mobileApi } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

interface JobRow {
  id: string;
  title: string;
  company: string;
  location: string;
  score: number;
  skills: string[];
  salary: string;
  verified: boolean;
}

/**
 * Mobile jobs listing backed by the SkillGap API.
 */
export default function JobsScreen(): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const role = useMobileAuthStore((s) => s.role);
  const isCompany = role === 'COMPANY' || role === 'ADMIN';

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    const qs = params.toString();
    const url = isCompany ? '/jobs/company/mine' : (qs ? `/jobs?${qs}` : '/jobs');
    const res = await mobileApi.get<{
      jobs: Array<{
        id: string;
        title: string;
        company: { name: string; isVerified: boolean };
        location: string;
        matchScore?: number;
        skillsRequired: Array<{ name: string }>;
        salaryMin?: number;
        salaryMax?: number;
        type: string;
        applicantCount?: number;
      }>;
    }>(url);

    const rows: JobRow[] = res.data.jobs.map((j) => {
      const skillNames = j.skillsRequired.map((s) => s.name);
      let salary = 'Competitive';
      if (j.salaryMin != null && j.salaryMax != null) {
        if (j.type === 'INTERNSHIP') {
          salary = `$${j.salaryMin}–${j.salaryMax}/hr`;
        } else {
          salary = `$${Math.round(j.salaryMin / 1000)}k – $${Math.round(j.salaryMax / 1000)}k`;
        }
      }
      return {
        id: j.id,
        title: j.title,
        company: j.company.name,
        location: j.location,
        score: typeof j.matchScore === 'number' ? j.matchScore : 0,
        skills: skillNames,
        salary,
        verified: j.company.isVerified,
      };
    });
    setJobs(rows);
  }, [isCompany, search]);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          await load();
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const scoreColor = (v: number) => (v < 40 ? t.colors.error : v <= 70 ? t.colors.warning : t.colors.success);

  const filtered = jobs;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, paddingBottom: t.spacing.md, backgroundColor: t.colors.surface, ...t.shadows.sm, zIndex: 10 }}>
        <Text style={{ ...t.typography.h2, color: t.colors.textPrimary, marginBottom: t.spacing.sm }}>{isCompany ? 'My Jobs' : 'Jobs'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.surfaceSecondary, borderRadius: t.borderRadius.lg, paddingHorizontal: t.spacing.md, height: 48, borderWidth: 1, borderColor: t.colors.border }}>
          <Ionicons name="search" size={20} color={t.colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={isCompany ? 'Search your jobs...' : 'Search jobs or companies...'}
            placeholderTextColor={t.colors.textSecondary}
            style={{ flex: 1, marginLeft: t.spacing.sm, ...t.typography.body, color: t.colors.textPrimary }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={20} color={t.colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ height: t.spacing.md }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: t.spacing.xxxl, marginTop: t.spacing.xxxl }}>
              <Ionicons name="search" size={64} color={t.colors.border} />
              <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, marginTop: t.spacing.md }}>{isCompany ? 'No posted jobs' : 'No jobs found'}</Text>
              <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: 8 }}>Pull to refresh or adjust search</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/job/${item.id}`)}
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: t.spacing.md }}>
                <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, marginBottom: 4 }}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: t.spacing.md }}>
                  <Ionicons name="business-outline" size={14} color={t.colors.textSecondary} />
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>{item.company}</Text>
                  <Text style={{ color: t.colors.textSecondary }}>•</Text>
                  <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>{item.location}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: t.spacing.md }}>
                  {item.skills.slice(0, 4).map((s) => (
                    <View key={s} style={{ backgroundColor: t.colors.surfaceSecondary, borderRadius: t.borderRadius.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>{s}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ ...t.typography.body, fontWeight: '700', color: t.colors.primary }}>{item.salary}</Text>
                  {item.verified && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: t.colors.primaryLight, borderRadius: t.borderRadius.pill, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Ionicons name="checkmark-circle" size={12} color={t.colors.primaryDark} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: t.colors.primaryDark, textTransform: 'uppercase' }}>Verified</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: scoreColor(item.score), alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surface }}>
                <Text style={{ ...t.typography.caption, fontWeight: '800', color: t.colors.textPrimary }}>{item.score}%</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
