import { Pressable, ScrollView, Text, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

const t = theme;

const skills = ['React', 'TypeScript', 'Node.js', 'CSS', 'Next.js'];

const menuItems = [
  { icon: 'settings-outline' as const, label: 'Account Settings' },
  { icon: 'notifications-outline' as const, label: 'Notifications' },
  { icon: 'lock-closed-outline' as const, label: 'Privacy & Security' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support' },
];

/**
 * Mobile profile screen with avatar, user info, skills tags, and settings menu.
 */
export default function ProfileScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: t.spacing.xxxl }} showsVerticalScrollIndicator={false}>
        {/* Header gradient */}
        <View style={{ height: 140, backgroundColor: t.colors.primary, borderBottomLeftRadius: t.borderRadius.xxl, borderBottomRightRadius: t.borderRadius.xxl }} />

        {/* Profile info */}
        <View style={{ alignItems: 'center', marginTop: -48, paddingHorizontal: t.spacing.lg }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: t.colors.primaryLight, borderWidth: 4, borderColor: t.colors.surface, alignItems: 'center', justifyContent: 'center', ...t.shadows.elevated }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: t.colors.primaryDark }}>JD</Text>
          </View>
          <Text style={{ ...t.typography.h2, color: t.colors.textPrimary, marginTop: t.spacing.md }}>John Doe</Text>
          <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 }}>Frontend Engineer</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
            <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>San Francisco, CA</Text>
          </View>

          {/* Match score badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: t.spacing.md, backgroundColor: t.colors.primaryLight, borderRadius: t.borderRadius.pill, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Ionicons name="trophy" size={14} color={t.colors.primaryDark} />
            <Text style={{ ...t.typography.small, fontWeight: '700', color: t.colors.primaryDark }}>78% avg match</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ marginTop: t.spacing.xl, marginHorizontal: t.spacing.lg, flexDirection: 'row', gap: t.spacing.sm }}>
          {[{ label: 'Applications', value: '4' }, { label: 'Interviews', value: '2' }, { label: 'Offers', value: '1' }].map((s) => (
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
            {skills.map((s) => (
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
