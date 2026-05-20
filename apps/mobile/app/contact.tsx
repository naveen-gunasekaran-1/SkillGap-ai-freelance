import { Link } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';

const t = theme;
const supportEmail = 'support@skillgap.ai';

const supportOptions = [
  {
    icon: 'business-outline' as const,
    title: 'For companies',
    body: 'Help with verification, job posting, applicant review, and team hiring workflows.',
  },
  {
    icon: 'person-outline' as const,
    title: 'For candidates',
    body: 'Support for profiles, resumes, skill gap analysis, applications, and account access.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Trust and security',
    body: 'Report suspicious listings, upload issues, login problems, or verification concerns.',
  },
];

async function openEmail(): Promise<void> {
  const url = `mailto:${supportEmail}?subject=${encodeURIComponent('SkillGap AI support')}`;
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert('Email unavailable', `Contact us at ${supportEmail}.`);
    return;
  }
  await Linking.openURL(url);
}

export default function ContactScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: t.spacing.lg,
          paddingVertical: t.spacing.xl,
          paddingBottom: t.spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 460, alignSelf: 'center' }}>
          <Link href="/(auth)/login" asChild>
            <Pressable
              hitSlop={8}
              style={({ pressed }) => ({
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.spacing.xs,
                opacity: pressed ? 0.7 : 1,
                marginBottom: t.spacing.lg,
              })}
            >
              <Ionicons name="arrow-back" size={18} color={t.colors.textSecondary} />
              <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>Back</Text>
            </Pressable>
          </Link>

          <View style={{ marginBottom: t.spacing.xl }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: t.colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: t.spacing.md,
              }}
            >
              <Ionicons name="chatbubbles-outline" size={30} color={t.colors.primaryDark} />
            </View>
            <Text style={{ ...t.typography.h1, color: t.colors.textPrimary }}>Contact us</Text>
            <Text
              style={{
                ...t.typography.body,
                color: t.colors.textSecondary,
                marginTop: t.spacing.sm,
              }}
            >
              Support for candidates, companies, verification, and account access.
            </Text>
          </View>

          <Pressable
            onPress={() => void openEmail()}
            style={({ pressed }) => ({
              minHeight: t.minTouchTarget,
              borderRadius: t.borderRadius.pill,
              backgroundColor: t.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: t.spacing.sm,
              opacity: pressed ? 0.88 : 1,
              ...t.shadows.card,
            })}
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={{ ...t.typography.body, color: '#FFFFFF', fontWeight: '800' }}>
              Email support
            </Text>
          </Pressable>

          <Text
            style={{
              ...t.typography.caption,
              color: t.colors.textSecondary,
              textAlign: 'center',
              marginTop: t.spacing.sm,
            }}
          >
            {supportEmail}
          </Text>

          <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
            {supportOptions.map((option) => (
              <View
                key={option.title}
                style={{
                  borderRadius: t.borderRadius.card,
                  backgroundColor: t.colors.surface,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  padding: t.spacing.lg,
                  ...t.shadows.sm,
                }}
              >
                <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: t.colors.surfaceSecondary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={option.icon} size={22} color={t.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        ...t.typography.body,
                        color: t.colors.textPrimary,
                        fontWeight: '800',
                      }}
                    >
                      {option.title}
                    </Text>
                    <Text
                      style={{
                        ...t.typography.caption,
                        color: t.colors.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      {option.body}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
