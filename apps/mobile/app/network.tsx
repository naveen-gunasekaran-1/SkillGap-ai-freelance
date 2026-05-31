import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { getApiOrigin, getApiUrl } from '../src/lib/api';
import { checkMobileApiHealth } from '../src/lib/http';

const t = theme;

type HealthResult = {
  ok: boolean;
  latencyMs: number;
  status?: number;
  message: string;
};

export default function NetworkDiagnosticsScreen(): React.JSX.Element {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<HealthResult | null>(null);
  const apiOrigin = getApiOrigin();
  const apiUrl = getApiUrl();

  const runCheck = async (): Promise<void> => {
    setChecking(true);
    try {
      setResult(await checkMobileApiHealth());
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Network Check',
          headerTintColor: t.colors.primary,
          headerStyle: { backgroundColor: t.colors.surface },
          headerTitleStyle: { fontWeight: '700', color: t.colors.textPrimary },
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: t.colors.background }}
        contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: t.spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            borderRadius: t.borderRadius.card,
            backgroundColor: t.colors.surface,
            padding: t.spacing.lg,
            ...t.shadows.card,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: t.colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="wifi-outline" size={24} color={t.colors.primaryDark} />
          </View>
          <Text
            style={{ ...t.typography.h2, color: t.colors.textPrimary, marginTop: t.spacing.md }}
          >
            SkillGap API connection
          </Text>
          <Text
            style={{
              ...t.typography.caption,
              color: t.colors.textSecondary,
              marginTop: t.spacing.sm,
            }}
          >
            Use this when login/register says Network Error on a physical phone.
          </Text>

          <View
            style={{
              marginTop: t.spacing.lg,
              borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.surfaceSecondary,
              padding: t.spacing.md,
            }}
          >
            <Text style={{ ...t.typography.small, fontWeight: '800', color: t.colors.textPrimary }}>
              API base URL
            </Text>
            <Text
              selectable
              style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}
            >
              {apiUrl}
            </Text>
            <Text
              style={{
                ...t.typography.small,
                fontWeight: '800',
                color: t.colors.textPrimary,
                marginTop: t.spacing.md,
              }}
            >
              Health URL
            </Text>
            <Text
              selectable
              style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}
            >
              {apiOrigin}/health
            </Text>
          </View>

          {result ? (
            <View
              style={{
                marginTop: t.spacing.lg,
                borderRadius: t.borderRadius.lg,
                backgroundColor: result.ok ? '#ECFDF5' : '#FEF2F2',
                padding: t.spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons
                  name={result.ok ? 'checkmark-circle' : 'warning-outline'}
                  size={20}
                  color={result.ok ? t.colors.success : t.colors.error}
                />
                <Text
                  style={{
                    ...t.typography.caption,
                    fontWeight: '800',
                    color: result.ok ? t.colors.success : t.colors.error,
                  }}
                >
                  {result.ok ? 'Connected' : 'Connection failed'}
                </Text>
              </View>
              <Text
                style={{
                  ...t.typography.caption,
                  color: t.colors.textPrimary,
                  marginTop: t.spacing.sm,
                }}
              >
                {result.message}
              </Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}>
                Latency: {result.latencyMs}ms{result.status ? ` · HTTP ${result.status}` : ''}
              </Text>
            </View>
          ) : null}

          <Pressable
            disabled={checking}
            onPress={() => void runCheck()}
            style={({ pressed }) => ({
              marginTop: t.spacing.lg,
              borderRadius: t.borderRadius.pill,
              minHeight: t.minTouchTarget,
              backgroundColor: t.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: checking || pressed ? 0.75 : 1,
            })}
          >
            {checking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ ...t.typography.body, fontWeight: '800', color: '#FFFFFF' }}>
                Run network check
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => void Linking.openURL(`${apiOrigin}/health`)}
            style={({ pressed }) => ({
              marginTop: t.spacing.sm,
              borderRadius: t.borderRadius.pill,
              minHeight: t.minTouchTarget,
              borderWidth: 1,
              borderColor: t.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={{ ...t.typography.body, fontWeight: '800', color: t.colors.textPrimary }}>
              Open health URL in browser
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: t.spacing.lg,
            borderRadius: t.borderRadius.card,
            backgroundColor: t.colors.surface,
            padding: t.spacing.lg,
            ...t.shadows.card,
          }}
        >
          <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>If it still fails</Text>
          {[
            'Turn off VPN, ad blocker, or private DNS temporarily.',
            'Switch between Wi-Fi and mobile data.',
            'Open the health URL above in the phone browser.',
            'If Render is sleeping, wait 30-60 seconds and run the check again.',
          ].map((item) => (
            <View key={item} style={{ flexDirection: 'row', gap: 8, marginTop: t.spacing.sm }}>
              <Ionicons name="checkmark-circle-outline" size={16} color={t.colors.primary} />
              <Text style={{ flex: 1, ...t.typography.caption, color: t.colors.textSecondary }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
