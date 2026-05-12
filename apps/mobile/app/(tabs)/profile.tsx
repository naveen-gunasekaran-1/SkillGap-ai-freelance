import { Pressable, ScrollView, Text, View } from 'react-native';
import { theme } from '../../src/theme';

const t = theme;

const skills = ['React', 'TypeScript', 'Node.js', 'CSS', 'Next.js'];

const menuItems = [
  { icon: '⚙️', label: 'Account Settings' },
  { icon: '🔔', label: 'Notifications' },
  { icon: '🔒', label: 'Privacy & Security' },
  { icon: '❓', label: 'Help & Support' },
];

/**
 * Mobile profile screen with avatar, user info, skills tags, and settings menu.
 */
export default function ProfileScreen(): React.JSX.Element {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.background }} contentContainerStyle={{ paddingBottom: t.spacing.xl }}>
      {/* Header gradient */}
      <View style={{ height: 120, backgroundColor: t.colors.primary }} />

      {/* Profile info */}
      <View style={{ alignItems: 'center', marginTop: -40, paddingHorizontal: t.spacing.lg }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: t.colors.primaryLight, borderWidth: 4, borderColor: t.colors.surface, alignItems: 'center', justifyContent: 'center', ...t.shadows.card }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: t.colors.primaryDark }}>JD</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: t.colors.textPrimary, marginTop: t.spacing.sm }}>John Doe</Text>
        <Text style={{ fontSize: 14, color: t.colors.textSecondary, marginTop: 2 }}>Frontend Engineer</Text>
        <Text style={{ fontSize: 13, color: t.colors.textSecondary, marginTop: 2 }}>San Francisco, CA</Text>

        {/* Match score badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: t.spacing.md, backgroundColor: t.colors.primaryLight, borderRadius: t.borderRadius.pill, paddingHorizontal: 14, paddingVertical: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: t.colors.primary }}>78% avg match</Text>
        </View>
      </View>

      {/* Skills */}
      <View style={{ marginTop: t.spacing.xl, marginHorizontal: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.md, ...t.shadows.card }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.textPrimary, marginBottom: t.spacing.sm }}>Skills</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {skills.map((s) => (
            <View key={s} style={{ backgroundColor: t.colors.primaryLight, borderRadius: t.borderRadius.pill, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: t.colors.primaryDark }}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={{ marginTop: t.spacing.md, marginHorizontal: t.spacing.lg, flexDirection: 'row', gap: t.spacing.sm }}>
        {[{ label: 'Applications', value: '4' }, { label: 'Interviews', value: '2' }, { label: 'Offers', value: '1' }].map((s) => (
          <View key={s.label} style={{ flex: 1, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.md, alignItems: 'center', ...t.shadows.card }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: t.colors.primary }}>{s.value}</Text>
            <Text style={{ fontSize: 11, color: t.colors.textSecondary, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Settings menu */}
      <View style={{ marginTop: t.spacing.xl, marginHorizontal: t.spacing.lg, borderRadius: t.borderRadius.card, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, overflow: 'hidden', ...t.shadows.card }}>
        {menuItems.map((item, i) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.spacing.sm,
              paddingHorizontal: t.spacing.md,
              paddingVertical: 16,
              minHeight: t.minTouchTarget,
              backgroundColor: pressed ? t.colors.background : 'transparent',
              borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
              borderBottomColor: t.colors.border,
            })}
          >
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            <Text style={{ fontSize: 15, color: t.colors.textPrimary, flex: 1 }}>{item.label}</Text>
            <Text style={{ fontSize: 16, color: t.colors.textSecondary }}>›</Text>
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <Pressable
        style={({ pressed }) => ({
          marginTop: t.spacing.lg,
          marginHorizontal: t.spacing.lg,
          borderRadius: t.borderRadius.card,
          borderWidth: 1,
          borderColor: t.colors.error,
          paddingVertical: 14,
          alignItems: 'center',
          minHeight: t.minTouchTarget,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: t.colors.error }}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}
