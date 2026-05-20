import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { theme } from '../../src/theme';
import { mobileApi } from '../../src/lib/http';

const t = theme;

type Verification = {
  id: string;
  status: string;
  region: string;
  countryCode: string;
  fraudScore?: number;
  rejectionReason?: string | null;
  company: { name: string; industry?: string; website?: string };
  documents: Array<{ id: string; type: string; originalName: string }>;
};

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  actor?: { name: string; email: string } | null;
};

type FraudFlag = {
  id: string;
  reason: string;
  severity: string;
  createdAt: string;
  company?: { name: string } | null;
};

function statusColor(status: string): string {
  if (status === 'VERIFIED') return t.colors.success;
  if (status === 'REJECTED') return t.colors.error;
  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') return t.colors.warning;
  return t.colors.primary;
}

export default function AdminMobileConsole(): React.JSX.Element {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [selected, setSelected] = useState<Verification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [verificationRes, auditRes, fraudRes] = await Promise.all([
      mobileApi.get<{ verifications: Verification[] }>('/admin/verifications'),
      mobileApi.get<{ logs: AuditLog[] }>('/admin/audit-logs'),
      mobileApi.get<{ flags: FraudFlag[] }>('/admin/fraud-flags'),
    ]);
    setVerifications(verificationRes.data.verifications);
    setAuditLogs(auditRes.data.logs);
    setFraudFlags(fraudRes.data.flags);
    setSelected(
      (current) =>
        verificationRes.data.verifications.find((item) => item.id === current?.id) ??
        verificationRes.data.verifications[0] ??
        null,
    );
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        await load();
      } catch {
        Alert.alert('Admin console unavailable', 'Check that your account has ADMIN access.');
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const pending = verifications.filter((item) =>
      ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'].includes(item.status),
    ).length;
    const approved = verifications.filter((item) => item.status === 'VERIFIED').length;
    const rejected = verifications.filter((item) => item.status === 'REJECTED').length;
    return { pending, approved, rejected };
  }, [verifications]);

  const decide = async (decision: 'APPROVED' | 'REJECTED'): Promise<void> => {
    if (!selected) return;
    if (decision === 'REJECTED' && rejectionReason.trim().length < 10) {
      Alert.alert('Rejection reason required', 'Explain what the company must fix.');
      return;
    }
    setSaving(true);
    try {
      const res = await mobileApi.patch<{ verification: Verification }>(
        `/admin/verifications/${selected.id}/decision`,
        {
          decision,
          ...(decision === 'REJECTED' ? { rejectionReason: rejectionReason.trim() } : {}),
        },
      );
      setSelected(res.data.verification);
      setRejectionReason('');
      await load();
      Alert.alert(
        'Decision saved',
        decision === 'APPROVED' ? 'Company approved.' : 'Company rejected.',
      );
    } catch (e) {
      const message =
        isAxiosError(e) &&
        typeof e.response?.data === 'object' &&
        e.response.data &&
        'message' in e.response.data
          ? String((e.response.data as { message: unknown }).message)
          : 'Could not save admin decision.';
      Alert.alert('Decision failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Admin console' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: t.colors.background }}
        contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: t.spacing.xxxl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          <Metric label="Pending" value={stats.pending} color={t.colors.warning} />
          <Metric label="Approved" value={stats.approved} color={t.colors.success} />
          <Metric label="Rejected" value={stats.rejected} color={t.colors.error} />
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
          <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
            Verification queue
          </Text>
          {loading ? (
            <ActivityIndicator color={t.colors.primary} style={{ marginTop: t.spacing.lg }} />
          ) : null}
          {verifications.slice(0, 12).map((item) => {
            const selectedItem = selected?.id === item.id;
            const color = statusColor(item.status);
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelected(item)}
                style={{
                  marginTop: t.spacing.md,
                  borderRadius: t.borderRadius.lg,
                  borderWidth: 1,
                  borderColor: selectedItem ? t.colors.primary : t.colors.border,
                  backgroundColor: selectedItem ? t.colors.primaryLight : t.colors.surface,
                  padding: t.spacing.md,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: t.spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      ...t.typography.caption,
                      fontWeight: '800',
                      color: t.colors.textPrimary,
                    }}
                  >
                    {item.company.name}
                  </Text>
                  <Text style={{ ...t.typography.small, fontWeight: '800', color }}>
                    {item.status.replace(/_/g, ' ')}
                  </Text>
                </View>
                <Text
                  style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}
                >
                  {item.region} · {item.documents.length} documents · Fraud {item.fraudScore ?? 0}
                  /100
                </Text>
              </Pressable>
            );
          })}
          {!loading && verifications.length === 0 ? (
            <Text
              style={{
                ...t.typography.caption,
                color: t.colors.textSecondary,
                marginTop: t.spacing.md,
              }}
            >
              No verification submissions.
            </Text>
          ) : null}
        </View>

        {selected && (
          <View
            style={{
              marginTop: t.spacing.lg,
              borderRadius: t.borderRadius.card,
              backgroundColor: t.colors.surface,
              padding: t.spacing.lg,
              ...t.shadows.card,
            }}
          >
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
              {selected.company.name}
            </Text>
            <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 }}>
              {selected.company.industry || 'Company'} · {selected.countryCode}
            </Text>
            {selected.documents.map((doc) => (
              <View
                key={doc.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: t.spacing.sm,
                }}
              >
                <Ionicons name="document-text-outline" size={18} color={t.colors.primary} />
                <Text style={{ flex: 1, ...t.typography.small, color: t.colors.textSecondary }}>
                  {doc.type.replace(/_/g, ' ')} · {doc.originalName}
                </Text>
              </View>
            ))}
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Rejection reason for failed verification"
              placeholderTextColor={t.colors.textSecondary}
              multiline
              style={{
                marginTop: t.spacing.md,
                minHeight: 96,
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.borderRadius.lg,
                padding: t.spacing.md,
                color: t.colors.textPrimary,
                textAlignVertical: 'top',
              }}
            />
            <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md }}>
              <Pressable
                disabled={saving}
                onPress={() => void decide('REJECTED')}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: t.borderRadius.pill,
                  backgroundColor: '#FEF2F2',
                  paddingVertical: 13,
                  alignItems: 'center',
                  opacity: pressed || saving ? 0.75 : 1,
                })}
              >
                <Text style={{ ...t.typography.caption, fontWeight: '800', color: t.colors.error }}>
                  Reject
                </Text>
              </Pressable>
              <Pressable
                disabled={saving}
                onPress={() => void decide('APPROVED')}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: t.borderRadius.pill,
                  backgroundColor: t.colors.success,
                  paddingVertical: 13,
                  alignItems: 'center',
                  opacity: pressed || saving ? 0.75 : 1,
                })}
              >
                <Text style={{ ...t.typography.caption, fontWeight: '800', color: '#FFFFFF' }}>
                  Approve
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View
          style={{
            marginTop: t.spacing.lg,
            borderRadius: t.borderRadius.card,
            backgroundColor: t.colors.surface,
            padding: t.spacing.lg,
            ...t.shadows.card,
          }}
        >
          <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Audit activity</Text>
          {auditLogs.slice(0, 8).map((log) => (
            <View
              key={log.id}
              style={{
                marginTop: t.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: t.colors.border,
                paddingBottom: t.spacing.sm,
              }}
            >
              <Text
                style={{ ...t.typography.caption, fontWeight: '800', color: t.colors.textPrimary }}
              >
                {log.action.replace(/_/g, ' ')}
              </Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>
                {log.entityType} · {log.actor?.name ?? 'System'}
              </Text>
            </View>
          ))}
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
          <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Fraud flags</Text>
          {fraudFlags.slice(0, 8).map((flag) => (
            <View
              key={flag.id}
              style={{
                marginTop: t.spacing.md,
                borderRadius: t.borderRadius.lg,
                backgroundColor: '#FFFBEB',
                padding: t.spacing.md,
              }}
            >
              <Text style={{ ...t.typography.caption, fontWeight: '800', color: t.colors.warning }}>
                {flag.severity}
              </Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}>
                {flag.company?.name ?? 'Company'} · {flag.reason}
              </Text>
            </View>
          ))}
          {fraudFlags.length === 0 ? (
            <Text
              style={{
                ...t.typography.caption,
                color: t.colors.textSecondary,
                marginTop: t.spacing.md,
              }}
            >
              No fraud flags.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}): React.JSX.Element {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: t.borderRadius.card,
        backgroundColor: t.colors.surface,
        padding: t.spacing.md,
        ...t.shadows.card,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}
