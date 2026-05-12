import { ScrollView, Text, View } from 'react-native';
import { theme } from '../../src/theme';

const t = theme;

const skills = [
  { name: 'React', value: 92 },
  { name: 'TypeScript', value: 78 },
  { name: 'Node.js', value: 65 },
  { name: 'CSS', value: 85 },
];

const gaps = [
  { skill: 'Adv. TypeScript', jobs: 8, color: t.colors.error },
  { skill: 'AWS Architecture', jobs: 5, color: t.colors.warning },
  { skill: 'System Design', jobs: 4, color: t.colors.primary },
];

/**
 * Mobile dashboard screen with greeting, match score, skills progress,
 * skill gaps, and AI insights.
 */
export default function DashboardScreen(): React.JSX.Element {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.background }} contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.xxl, paddingBottom: t.spacing.xl }}>
      {/* Greeting */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: t.colors.primaryDark }}>JD</Text>
        </View>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: t.colors.textPrimary }}>Good evening, John 👋</Text>
          <Text style={{ fontSize: 14, color: t.colors.textSecondary }}>Your career at a glance</Text>
        </View>
      </View>

      {/* Match score card */}
      <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.lg, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.lg, alignItems: 'center', ...t.shadows.card }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: t.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Overall Match Score</Text>
        <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: t.colors.success, alignItems: 'center', justifyContent: 'center', marginTop: t.spacing.md }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: t.colors.textPrimary }}>78%</Text>
        </View>
        <Text style={{ fontSize: 14, color: t.colors.textSecondary, marginTop: t.spacing.sm }}>Strong match for 12 jobs</Text>
      </View>

      {/* Skills progress */}
      <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.md, ...t.shadows.card }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.textPrimary, marginBottom: t.spacing.md }}>Skills Progress</Text>
        {skills.map((s) => (
          <View key={s.name} style={{ marginBottom: t.spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: t.colors.textPrimary }}>{s.name}</Text>
              <Text style={{ fontSize: 14, color: t.colors.textSecondary }}>{s.value}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: t.colors.border }}>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: t.colors.primary, width: `${s.value}%` }} />
            </View>
          </View>
        ))}
      </View>

      {/* Skill gaps */}
      <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.md, ...t.shadows.card }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.textPrimary, marginBottom: t.spacing.md }}>Skill Gaps</Text>
        {gaps.map((g) => (
          <View key={g.skill} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: t.spacing.sm, borderBottomWidth: 1, borderBottomColor: t.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: g.color }} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: t.colors.textPrimary }}>{g.skill}</Text>
                <Text style={{ fontSize: 12, color: t.colors.textSecondary }}>Needed for {g.jobs} jobs</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* AI Insights */}
      <View style={{ marginTop: t.spacing.lg, borderRadius: t.borderRadius.lg, backgroundColor: '#F5F0FF', borderWidth: 1, borderColor: '#E8DDFF', padding: t.spacing.md, ...t.shadows.card }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs }}>
          <Text style={{ fontSize: 16 }}>🧠</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.aiPurple }}>AI Insights</Text>
        </View>
        <Text style={{ fontSize: 13, color: t.colors.textSecondary, marginTop: t.spacing.sm, lineHeight: 20 }}>
          Learning TypeScript generics could unlock 5 more job matches. Your React skills are above average.
        </Text>
      </View>
    </ScrollView>
  );
}
