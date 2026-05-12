import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { theme } from '../../src/theme';

const t = theme;

const mockJobs = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp', location: 'San Francisco, CA', score: 88, skills: ['React', 'TypeScript', 'Next.js'], salary: '$150k - $200k', verified: true },
  { id: '2', title: 'Full Stack Developer', company: 'StartupXYZ', location: 'Remote', score: 76, skills: ['Node.js', 'React', 'PostgreSQL'], salary: '$120k - $160k', verified: true },
  { id: '3', title: 'Backend Engineer', company: 'BigTech', location: 'Seattle, WA', score: 82, skills: ['Go', 'Kubernetes', 'AWS'], salary: '$160k - $210k', verified: false },
  { id: '4', title: 'React Native Developer', company: 'MobileFirst', location: 'Austin, TX', score: 71, skills: ['React Native', 'TypeScript'], salary: '$110k - $140k', verified: true },
];

/**
 * Mobile jobs listing with search bar, job cards with match scores, skill tags, and verified badges.
 */
export default function JobsScreen(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const filtered = mockJobs.filter((j) => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  const scoreColor = (v: number) => v < 40 ? t.colors.error : v <= 70 ? t.colors.warning : t.colors.success;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Header + Search */}
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.xxl, paddingBottom: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: t.colors.textPrimary }}>Jobs</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="🔍 Search jobs or companies..."
          placeholderTextColor={t.colors.textSecondary}
          style={{ marginTop: t.spacing.sm, borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.background, paddingHorizontal: t.spacing.md, paddingVertical: 12, fontSize: 14, color: t.colors.textPrimary, minHeight: t.minTouchTarget }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md }}
        ItemSeparatorComponent={() => <View style={{ height: t.spacing.sm }} />}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => ({ borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, padding: t.spacing.md, opacity: pressed ? 0.95 : 1, ...t.shadows.card })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.textPrimary, flex: 1 }}>{item.title}</Text>
                  {item.verified && (
                    <View style={{ backgroundColor: t.colors.primaryLight, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: t.colors.primary }}>✓ Verified</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: t.colors.textSecondary, marginTop: 4 }}>{item.company} • {item.location}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: t.spacing.xs, flexWrap: 'wrap' }}>
                  {item.skills.map((s) => (
                    <View key={s} style={{ backgroundColor: t.colors.border, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, color: t.colors.textSecondary }}>{s}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.primary, marginTop: t.spacing.xs }}>{item.salary}</Text>
              </View>
              {/* Match score */}
              <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: scoreColor(item.score), alignItems: 'center', justifyContent: 'center', marginLeft: t.spacing.sm }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: t.colors.textPrimary }}>{item.score}%</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: t.spacing.xxxl }}>
            <Text style={{ fontSize: 32 }}>🔍</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.textPrimary, marginTop: t.spacing.md }}>No jobs found</Text>
            <Text style={{ fontSize: 14, color: t.colors.textSecondary, marginTop: 4 }}>Try a different search</Text>
          </View>
        )}
      />
    </View>
  );
}
