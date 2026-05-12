import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { theme } from '../../src/theme';

const t = theme;

const filters = ['All', 'Reviewing', 'Interview', 'Rejected'] as const;

const mockApps = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp', status: 'Under Review', key: 'Reviewing', color: t.colors.warning, date: 'May 1' },
  { id: '2', title: 'Full Stack Developer', company: 'StartupXYZ', status: 'Interview', key: 'Interview', color: t.colors.success, date: 'Apr 28' },
  { id: '3', title: 'Backend Engineer', company: 'BigTech', status: 'Rejected', key: 'Rejected', color: t.colors.error, date: 'Apr 20' },
];

/**
 * Mobile applications screen with horizontal filter chips and application cards.
 */
export default function ApplicationsScreen(): React.JSX.Element {
  const [filter, setFilter] = useState<typeof filters[number]>('All');
  const filtered = mockApps.filter((a) => filter === 'All' || a.key === filter);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.xxl, paddingBottom: t.spacing.md, backgroundColor: t.colors.surface, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: t.colors.textPrimary }}>Applications</Text>
        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: t.spacing.sm }}>
          {filters.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{ borderRadius: t.borderRadius.pill, paddingHorizontal: 16, paddingVertical: 8, minHeight: 36, justifyContent: 'center', backgroundColor: filter === f ? t.colors.primary : t.colors.surface, borderWidth: 1, borderColor: filter === f ? t.colors.primary : t.colors.border }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f ? '#FFFFFF' : t.colors.textSecondary }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md }}
        ItemSeparatorComponent={() => <View style={{ height: t.spacing.sm }} />}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => ({ borderRadius: t.borderRadius.card, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, padding: t.spacing.md, opacity: pressed ? 0.95 : 1, ...t.shadows.card })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, flex: 1 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: t.colors.textPrimary }}>{item.title}</Text>
                  <Text style={{ fontSize: 13, color: t.colors.textSecondary, marginTop: 2 }}>{item.company} • {item.date}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: `${item.color}18`, borderRadius: t.borderRadius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: item.color }}>{item.status}</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: t.spacing.xxxl }}>
            <Text style={{ fontSize: 32 }}>📋</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.textPrimary, marginTop: t.spacing.md }}>No applications</Text>
          </View>
        )}
      />
    </View>
  );
}
