import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { theme } from '../../src/theme';
import { mobileApi } from '../../src/lib/http';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

const statuses = [
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_DONE',
  'OFFER_EXTENDED',
  'HIRED',
  'REJECTED',
] as const;

const rejectionCategories = [
  'Technical Skills',
  'Communication',
  'Experience Gap',
  'Domain Knowledge',
  'Leadership',
  'Culture Fit',
  'System Design',
  'DevOps',
  'Security',
  'Architecture',
];

type ApplicationDetail = {
  id: string;
  status: string;
  matchScore?: number;
  rejectionReason?: string;
  appliedAt: string;
  candidate?: {
    name: string;
    email: string;
    title?: string;
    location?: string;
    skills?: string[];
  };
  job: {
    title: string;
    company: { name: string };
    location: string;
    type: string;
    requirements: string[];
    skillsRequired: Array<{ name: string }>;
  };
  gapReport?: {
    summary?: string;
    missingSkills?: string[];
    strengths?: string[];
    recommendations?: string[];
  };
  aiExplanations?: Array<{ type: string; summary: string; createdAt: string }>;
};

function label(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function badgeColor(status: string): string {
  if (status === 'REJECTED') return t.colors.error;
  if (['OFFER_EXTENDED', 'HIRED'].includes(status)) return t.colors.success;
  if (status.includes('INTERVIEW')) return t.colors.aiPurple;
  return t.colors.primary;
}

function Chip({
  text,
  color = t.colors.primary,
}: {
  text: string;
  color?: string;
}): React.JSX.Element {
  return (
    <View
      style={{
        borderRadius: t.borderRadius.pill,
        backgroundColor: `${color}14`,
        borderWidth: 1,
        borderColor: `${color}33`,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text style={{ ...t.typography.small, fontWeight: '700', color }}>{text}</Text>
    </View>
  );
}

export default function ApplicationDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const role = useMobileAuthStore((s) => s.role);
  const canManage = role === 'COMPANY' || role === 'ADMIN';
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await mobileApi.get<{ application: ApplicationDetail }>(
        `/applications/${encodeURIComponent(id)}`,
      );
      setApplication(res.data.application);
    } catch {
      setApplication(null);
      Alert.alert('Could not load application', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const rejectionExplanation = useMemo(
    () => application?.aiExplanations?.find((item) => item.type === 'REJECTION_REASON'),
    [application],
  );

  const updateStatus = async (status: string): Promise<void> => {
    if (!application) return;
    if (status === 'REJECTED') {
      if (selectedCategories.length === 0) {
        Alert.alert('Select category', 'Choose at least one structured rejection category.');
        return;
      }
      if (rejectionReason.trim().length < 10) {
        Alert.alert('Add reasoning', 'Write a clear rejection reason before rejecting.');
        return;
      }
    }
    setSaving(true);
    try {
      const payload =
        status === 'REJECTED'
          ? {
              status,
              rejectionCategories: selectedCategories,
              rejectionReason: rejectionReason.trim(),
              missingSkills: missingSkills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              ...(evidenceNotes.trim() ? { evidenceNotes: evidenceNotes.trim() } : {}),
            }
          : { status };
      const res = await mobileApi.patch<{ application: ApplicationDetail }>(
        `/applications/${application.id}/status`,
        payload,
      );
      setApplication(res.data.application);
      Alert.alert('Updated', `Application moved to ${label(status)}.`);
    } catch (e) {
      const message =
        isAxiosError(e) &&
        typeof e.response?.data === 'object' &&
        e.response.data &&
        'message' in e.response.data
          ? String((e.response.data as { message: unknown }).message)
          : 'Could not update this application.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !application) {
    return (
      <>
        <Stack.Screen options={{ title: 'Application' }} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.colors.background,
          }}
        >
          {loading ? (
            <ActivityIndicator color={t.colors.primary} />
          ) : (
            <Text style={{ ...t.typography.body, color: t.colors.textSecondary }}>
              Application unavailable.
            </Text>
          )}
        </View>
      </>
    );
  }

  const statusColor = badgeColor(application.status);
  const skills = application.job.skillsRequired.map((skill) => skill.name);

  return (
    <>
      <Stack.Screen options={{ title: canManage ? 'Applicant review' : 'Application detail' }} />
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
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: t.spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.h2, color: t.colors.textPrimary }}>
                {canManage ? (application.candidate?.name ?? 'Candidate') : application.job.title}
              </Text>
              <Text
                style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 }}
              >
                {canManage ? application.job.title : application.job.company.name} ·{' '}
                {application.job.location}
              </Text>
            </View>
            <Chip text={label(application.status)} color={statusColor} />
          </View>
          {typeof application.matchScore === 'number' && (
            <View
              style={{
                marginTop: t.spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.spacing.md,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  borderWidth: 6,
                  borderColor: statusColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: t.colors.textPrimary }}>
                  {application.matchScore}%
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...t.typography.caption,
                    fontWeight: '800',
                    color: t.colors.textPrimary,
                  }}
                >
                  AI match confidence
                </Text>
                <Text
                  style={{ ...t.typography.small, color: t.colors.textSecondary, marginTop: 2 }}
                >
                  Score is calculated from candidate skills against job requirements.
                </Text>
              </View>
            </View>
          )}
        </View>

        {canManage && application.candidate && (
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
              Candidate evidence
            </Text>
            <Text style={{ ...t.typography.caption, color: t.colors.textSecondary, marginTop: 6 }}>
              {application.candidate.title || application.candidate.email}
            </Text>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.md }}
            >
              {(application.candidate.skills ?? []).slice(0, 12).map((skill) => (
                <Chip key={skill} text={skill} color={t.colors.aiPurple} />
              ))}
              {!(application.candidate.skills ?? []).length && (
                <Text style={{ ...t.typography.caption, color: t.colors.textSecondary }}>
                  No candidate skills listed.
                </Text>
              )}
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
          <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Role requirements</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.md }}>
            {skills.map((skill) => (
              <Chip key={skill} text={skill} />
            ))}
          </View>
          {application.job.requirements.slice(0, 6).map((item, index) => (
            <View
              key={`${item}-${index}`}
              style={{ flexDirection: 'row', gap: 8, marginTop: t.spacing.sm }}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={t.colors.primary} />
              <Text style={{ flex: 1, ...t.typography.caption, color: t.colors.textSecondary }}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {application.gapReport && (
          <View
            style={{
              marginTop: t.spacing.lg,
              borderRadius: t.borderRadius.card,
              backgroundColor: '#F3E8FF',
              padding: t.spacing.lg,
              ...t.shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="sparkles" size={18} color={t.colors.aiPurple} />
              <Text style={{ ...t.typography.h3, color: t.colors.aiPurple }}>AI gap analysis</Text>
            </View>
            {application.gapReport.summary ? (
              <Text style={{ ...t.typography.caption, color: '#5B21B6', marginTop: t.spacing.sm }}>
                {application.gapReport.summary}
              </Text>
            ) : null}
            {(application.gapReport.missingSkills ?? []).length > 0 && (
              <View style={{ marginTop: t.spacing.md }}>
                <Text
                  style={{
                    ...t.typography.caption,
                    fontWeight: '800',
                    color: t.colors.textPrimary,
                  }}
                >
                  Missing skills
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {application.gapReport.missingSkills?.map((skill) => (
                    <Chip key={skill} text={skill} color={t.colors.error} />
                  ))}
                </View>
              </View>
            )}
            {(application.gapReport.recommendations ?? []).slice(0, 3).map((item, index) => (
              <Text
                key={`${item}-${index}`}
                style={{ ...t.typography.small, color: '#5B21B6', marginTop: 8 }}
              >
                • {item}
              </Text>
            ))}
          </View>
        )}

        {(application.rejectionReason || rejectionExplanation) && (
          <View
            style={{
              marginTop: t.spacing.lg,
              borderRadius: t.borderRadius.card,
              backgroundColor: '#FEF2F2',
              padding: t.spacing.lg,
              ...t.shadows.card,
            }}
          >
            <Text style={{ ...t.typography.h3, color: t.colors.error }}>Rejection explanation</Text>
            <Text style={{ ...t.typography.caption, color: '#991B1B', marginTop: t.spacing.sm }}>
              {rejectionExplanation?.summary ?? application.rejectionReason}
            </Text>
          </View>
        )}

        {canManage && (
          <View
            style={{
              marginTop: t.spacing.lg,
              borderRadius: t.borderRadius.card,
              backgroundColor: t.colors.surface,
              padding: t.spacing.lg,
              ...t.shadows.card,
            }}
          >
            <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>Hiring actions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: t.spacing.md }}
            >
              {statuses
                .filter((status) => status !== 'REJECTED')
                .map((status) => (
                  <Pressable
                    key={status}
                    disabled={saving}
                    onPress={() => void updateStatus(status)}
                    style={({ pressed }) => ({
                      borderRadius: t.borderRadius.pill,
                      backgroundColor:
                        application.status === status
                          ? t.colors.primary
                          : t.colors.surfaceSecondary,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      opacity: pressed || saving ? 0.75 : 1,
                    })}
                  >
                    <Text
                      style={{
                        ...t.typography.small,
                        fontWeight: '800',
                        color: application.status === status ? '#FFFFFF' : t.colors.textPrimary,
                      }}
                    >
                      {label(status)}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>

            <Text
              style={{
                ...t.typography.caption,
                fontWeight: '800',
                color: t.colors.textPrimary,
                marginTop: t.spacing.sm,
              }}
            >
              Structured rejection
            </Text>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.sm }}
            >
              {rejectionCategories.map((category) => {
                const selected = selectedCategories.includes(category);
                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setSelectedCategories((current) =>
                        selected
                          ? current.filter((item) => item !== category)
                          : [...current, category],
                      )
                    }
                    style={{
                      borderRadius: t.borderRadius.pill,
                      backgroundColor: selected ? t.colors.error : t.colors.surfaceSecondary,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        ...t.typography.small,
                        fontWeight: '700',
                        color: selected ? '#FFFFFF' : t.colors.textSecondary,
                      }}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={missingSkills}
              onChangeText={setMissingSkills}
              placeholder="Missing skills, comma separated"
              placeholderTextColor={t.colors.textSecondary}
              style={{
                marginTop: t.spacing.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.borderRadius.lg,
                padding: t.spacing.md,
                color: t.colors.textPrimary,
              }}
            />
            <TextInput
              value={evidenceNotes}
              onChangeText={setEvidenceNotes}
              placeholder="Evidence gaps, optional"
              placeholderTextColor={t.colors.textSecondary}
              multiline
              style={{
                marginTop: t.spacing.sm,
                minHeight: 84,
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.borderRadius.lg,
                padding: t.spacing.md,
                color: t.colors.textPrimary,
                textAlignVertical: 'top',
              }}
            />
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Candidate-facing rejection reason"
              placeholderTextColor={t.colors.textSecondary}
              multiline
              style={{
                marginTop: t.spacing.sm,
                minHeight: 112,
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.borderRadius.lg,
                padding: t.spacing.md,
                color: t.colors.textPrimary,
                textAlignVertical: 'top',
              }}
            />
            <Pressable
              disabled={saving}
              onPress={() => void updateStatus('REJECTED')}
              style={({ pressed }) => ({
                marginTop: t.spacing.md,
                borderRadius: t.borderRadius.pill,
                backgroundColor: t.colors.error,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: pressed || saving ? 0.75 : 1,
              })}
            >
              <Text style={{ ...t.typography.body, fontWeight: '800', color: '#FFFFFF' }}>
                {saving ? 'Saving...' : 'Reject with explanation'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </>
  );
}
