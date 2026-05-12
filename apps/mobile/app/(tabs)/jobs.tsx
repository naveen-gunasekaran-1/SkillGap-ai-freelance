import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Header + Search */}
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, paddingBottom: t.spacing.md, backgroundColor: t.colors.surface, ...t.shadows.sm, zIndex: 10 }}>
        <Text style={{ ...t.typography.h2, color: t.colors.textPrimary, marginBottom: t.spacing.sm }}>Jobs</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.colors.surfaceSecondary, borderRadius: t.borderRadius.lg, paddingHorizontal: t.spacing.md, height: 48, borderWidth: 1, borderColor: t.colors.border }}>
          <Ionicons name="search" size={20} color={t.colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search jobs or companies..."
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
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.lg }}
        ItemSeparatorComponent={() => <View style={{ height: t.spacing.md }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => ({ borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, padding: t.spacing.lg, opacity: pressed ? 0.95 : 1, ...t.shadows.card })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: t.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, flex: 1 }}>{item.title}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: t.spacing.md }}>
                  <Ionicons name="business-outline" size={14} color={t.colors.textSecondary} />
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>{item.company}</Text>
                  <Text style={{ color: t.colors.textSecondary }}>•</Text>
                  <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>{item.location}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: t.spacing.md }}>
                  {item.skills.map((s) => (
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

              {/* Match score */}
              <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: scoreColor(item.score), alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surface }}>
                <Text style={{ ...t.typography.caption, fontWeight: '800', color: t.colors.textPrimary }}>{item.score}%</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: t.spacing.xxxl, marginTop: t.spacing.xxxl }}>
            <Ionicons name="search" size={64} color={t.colors.border} />
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, marginTop: t.spacing.md }}>No jobs found</Text>
            <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: 8 }}>Try adjusting your search criteria</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
