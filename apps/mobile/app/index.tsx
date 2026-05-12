import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { theme } from '../src/theme';

console.log('[HomeScreen] Mounting home screen');

const t = theme;

const features = [
  { icon: '🧠', title: 'AI Gap Analysis', desc: 'Know exactly what skills you need' },
  { icon: '✅', title: 'Verified Jobs', desc: 'Only real, verified employers' },
  { icon: '🎯', title: 'Smart Matching', desc: 'Match % for every job posting' },
];

/**
 * Welcome/home screen with hero, feature highlights, and CTA buttons.
 */
export default function HomeScreen(): React.JSX.Element {
  console.log('[HomeScreen] Rendering with bg:', t.colors.background);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.background }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.xxl }}
    >
      <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center', gap: t.spacing.md, alignItems: 'center' }}>
        {/* Logo */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: t.borderRadius.xl,
            backgroundColor: t.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...t.shadows.card,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700' }}>S</Text>
        </View>

        <Text style={{ ...t.typography.h1, color: t.colors.textPrimary, textAlign: 'center', marginTop: t.spacing.xs }}>
          SkillGap AI
        </Text>
        <Text style={{ ...t.typography.body, color: t.colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: t.spacing.md }}>
          AI-powered gap analysis, job matching, and learning paths to accelerate your career.
        </Text>

        {/* Feature cards */}
        <View style={{ width: '100%', gap: t.spacing.sm, marginTop: t.spacing.lg }}>
          {features.map((f) => (
            <View
              key={f.title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.spacing.md,
                borderRadius: t.borderRadius.card,
                borderWidth: 1,
                borderColor: t.colors.border,
                backgroundColor: t.colors.surface,
                padding: t.spacing.md,
                ...t.shadows.card,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: t.borderRadius.card,
                  backgroundColor: t.colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: t.colors.textPrimary }}>{f.title}</Text>
                <Text style={{ fontSize: 12, color: t.colors.textSecondary, marginTop: 2 }}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={{ width: '100%', gap: t.spacing.sm, marginTop: t.spacing.lg }}>
          <Link href="/(auth)/register" asChild>
            <Pressable
              style={({ pressed }) => ({
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.borderRadius.card,
                backgroundColor: t.colors.primary,
                paddingVertical: 16,
                minHeight: t.minTouchTarget,
                opacity: pressed ? 0.9 : 1,
                ...t.shadows.card,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Get Started →</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/login" asChild>
            <Pressable
              style={({ pressed }) => ({
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.borderRadius.card,
                borderWidth: 1,
                borderColor: t.colors.border,
                backgroundColor: t.colors.surface,
                paddingVertical: 16,
                minHeight: t.minTouchTarget,
                opacity: pressed ? 0.9 : 1,
                ...t.shadows.card,
              })}
            >
              <Text style={{ color: t.colors.textPrimary, fontSize: 16, fontWeight: '600' }}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
