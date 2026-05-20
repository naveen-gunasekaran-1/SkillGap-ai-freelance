import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';

console.log('[HomeScreen] Mounting home screen');

const t = theme;

const features = [
  { icon: 'analytics', title: 'AI Gap Analysis', desc: 'Know exactly what skills you need' },
  { icon: 'briefcase', title: 'Verified Jobs', desc: 'Only real, verified employers' },
  { icon: 'flash', title: 'Smart Matching', desc: 'Match % for every job posting' },
];

/**
 * Welcome/home screen with hero, feature highlights, and CTA buttons.
 */
export default function HomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center', alignItems: 'center' }}>
          {/* Hero Section */}
          <View
            style={{ alignItems: 'center', marginBottom: t.spacing.xl, marginTop: t.spacing.md }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: t.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: t.spacing.lg,
                ...t.shadows.elevated,
              }}
            >
              <Ionicons name="sparkles" size={40} color="#FFFFFF" />
            </View>

            <Text
              style={{
                ...t.typography.h1,
                color: t.colors.textPrimary,
                textAlign: 'center',
                marginBottom: t.spacing.xs,
              }}
            >
              SkillGap AI
            </Text>
            <Text
              style={{
                ...t.typography.body,
                color: t.colors.textSecondary,
                textAlign: 'center',
                paddingHorizontal: t.spacing.sm,
              }}
            >
              AI-powered gap analysis, job matching, and learning paths to accelerate your career.
            </Text>
          </View>

          {/* Feature cards */}
          <View style={{ width: '100%', gap: t.spacing.md, marginBottom: t.spacing.xl }}>
            {features.map((f, index) => (
              <View
                key={f.title}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.spacing.md,
                  borderRadius: t.borderRadius.card,
                  backgroundColor: t.colors.surface,
                  padding: t.spacing.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  ...t.shadows.sm,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: t.colors.primaryLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={f.icon as any} size={24} color={t.colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...t.typography.body,
                      fontWeight: '600',
                      color: t.colors.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    {f.title}
                  </Text>
                  <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                    {f.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={{ width: '100%', gap: t.spacing.md }}>
            <Link href="/(auth)/register" asChild>
              <Pressable
                style={({ pressed }) => ({
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: t.spacing.sm,
                  borderRadius: t.borderRadius.pill,
                  backgroundColor: t.colors.primary,
                  paddingVertical: 18,
                  minHeight: t.minTouchTarget,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  ...t.shadows.card,
                })}
              >
                <Text style={{ color: '#FFFFFF', ...t.typography.body, fontWeight: '700' }}>
                  Get Started
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </Link>

            <Link href="/(auth)/login" asChild>
              <Pressable
                style={({ pressed }) => ({
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: t.borderRadius.pill,
                  backgroundColor: t.colors.surface,
                  paddingVertical: 18,
                  minHeight: t.minTouchTarget,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{ color: t.colors.textPrimary, ...t.typography.body, fontWeight: '600' }}
                >
                  I already have an account
                </Text>
              </Pressable>
            </Link>

            <Link href="/contact" asChild>
              <Pressable
                style={({ pressed }) => ({
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: t.spacing.xs,
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={17}
                  color={t.colors.textSecondary}
                />
                <Text
                  style={{
                    color: t.colors.textSecondary,
                    ...t.typography.caption,
                    fontWeight: '700',
                  }}
                >
                  Contact support
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
