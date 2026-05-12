import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.md, paddingBottom: t.spacing.md, backgroundColor: t.colors.surface, ...t.shadows.sm, zIndex: 10 }}>
        <Text style={{ ...t.typography.h2, color: t.colors.textPrimary, marginBottom: t.spacing.xs }}>Applications</Text>
        
        {/* Filter chips */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing.sm, paddingVertical: t.spacing.sm }}>
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
                  borderColor: filter === f ? t.colors.primary : t.colors.border 
                }}
              >
                <Text style={{ ...t.typography.caption, fontWeight: '600', color: filter === f ? '#FFFFFF' : t.colors.textSecondary }}>{f}</Text>
              </Pressable>
            ))}
          </ScrollView>
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.spacing.sm }}>
              <View style={{ flex: 1, paddingRight: t.spacing.md }}>
                <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, marginBottom: 4 }}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="business-outline" size={14} color={t.colors.textSecondary} />
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>{item.company}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: `${item.color}15`, borderRadius: t.borderRadius.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${item.color}30` }}>
                <Text style={{ ...t.typography.small, fontWeight: '700', color: item.color }}>{item.status}</Text>
              </View>
            </View>
            
            <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.sm }} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="calendar-outline" size={14} color={t.colors.textSecondary} />
                <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>Applied {item.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.colors.border} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: t.spacing.xxxl, marginTop: t.spacing.xxxl }}>
            <Ionicons name="document-text-outline" size={64} color={t.colors.border} />
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary, marginTop: t.spacing.md }}>No applications</Text>
            <Text style={{ ...t.typography.body, color: t.colors.textSecondary, marginTop: 8 }}>You haven't applied to any jobs yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
