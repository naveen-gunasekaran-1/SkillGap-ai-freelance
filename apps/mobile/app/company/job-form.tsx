import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { theme } from '../../src/theme';
import { mobileApi } from '../../src/lib/http';

const t = theme;

const jobTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'] as const;
type JobType = (typeof jobTypes)[number];

type EditableJob = {
  id: string;
  title: string;
  description: string;
  location: string;
  type: JobType;
  skillsRequired: Array<{ name: string }>;
  requirements: string[];
  responsibilities: string[];
  salaryMin?: number;
  salaryMax?: number;
};

function splitLines(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function label(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MobileJobFormScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const jobId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;
  const isEdit = Boolean(jobId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<JobType>('FULL_TIME');
  const [skills, setSkills] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const loadJob = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await mobileApi.get<{ job: EditableJob }>(`/jobs/${encodeURIComponent(jobId)}`);
      const job = res.data.job;
      setTitle(job.title);
      setDescription(job.description);
      setLocation(job.location);
      setType(jobTypes.includes(job.type) ? job.type : 'FULL_TIME');
      setSkills(job.skillsRequired.map((skill) => skill.name).join(', '));
      setRequirements(job.requirements.join('\n'));
      setResponsibilities(job.responsibilities.join('\n'));
      setSalaryMin(job.salaryMin != null ? String(job.salaryMin) : '');
      setSalaryMax(job.salaryMax != null ? String(job.salaryMax) : '');
    } catch {
      Alert.alert('Could not load job', 'Please try again from your jobs list.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/jobs') },
      ]);
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  useEffect(() => {
    void loadJob();
  }, [loadJob]);

  const submit = async (): Promise<void> => {
    const skillNames = splitLines(skills);
    const requirementList = splitLines(requirements);
    if (
      title.trim().length < 2 ||
      description.trim().length < 10 ||
      location.trim().length < 2 ||
      skillNames.length === 0 ||
      requirementList.length === 0
    ) {
      Alert.alert(
        'Complete required fields',
        'Title, description, location, skills, and requirements are required.',
      );
      return;
    }
    const min = salaryMin.trim() ? Number(salaryMin) : undefined;
    const max = salaryMax.trim() ? Number(salaryMax) : undefined;
    if ((min != null && !Number.isFinite(min)) || (max != null && !Number.isFinite(max))) {
      Alert.alert('Check salary', 'Salary values must be valid numbers.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        type,
        skillNames,
        requirements: requirementList,
        responsibilities: splitLines(responsibilities),
        ...(min != null ? { salaryMin: Math.round(min) } : {}),
        ...(max != null ? { salaryMax: Math.round(max) } : {}),
      };
      if (isEdit && jobId) {
        await mobileApi.put(`/jobs/${encodeURIComponent(jobId)}`, payload);
      } else {
        await mobileApi.post('/jobs', payload);
      }
      Alert.alert(
        isEdit ? 'Job updated' : 'Job posted',
        isEdit ? 'Your changes are live.' : 'Your role is now live.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/jobs') }],
      );
    } catch (e) {
      const message =
        isAxiosError(e) &&
        typeof e.response?.data === 'object' &&
        e.response.data &&
        'message' in e.response.data
          ? String((e.response.data as { message: unknown }).message)
          : `Could not ${isEdit ? 'update' : 'create'} this job.`;
      Alert.alert(isEdit ? 'Job not updated' : 'Job not posted', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit job' }} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.colors.background,
          }}
        >
          <ActivityIndicator color={t.colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Edit job' : 'Create job' }} />
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
              alignItems: 'center',
              gap: 10,
              marginBottom: t.spacing.md,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: t.colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="briefcase-outline" size={20} color={t.colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...t.typography.h3, color: t.colors.textPrimary }}>
                {isEdit ? 'Update this role' : 'Post a verified role'}
              </Text>
              <Text style={{ ...t.typography.small, color: t.colors.textSecondary }}>
                Only approved companies can publish and edit jobs.
              </Text>
            </View>
          </View>

          <Field
            label="Job title"
            value={title}
            onChangeText={setTitle}
            placeholder="Senior Backend Engineer"
          />
          <Field
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Bengaluru, India or Remote"
          />

          <Text
            style={{
              ...t.typography.caption,
              fontWeight: '800',
              color: t.colors.textPrimary,
              marginTop: t.spacing.md,
            }}
          >
            Employment type
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.sm }}>
            {jobTypes.map((item) => {
              const selected = item === type;
              return (
                <Pressable
                  key={item}
                  onPress={() => setType(item)}
                  style={{
                    borderRadius: t.borderRadius.pill,
                    backgroundColor: selected ? t.colors.primary : t.colors.surfaceSecondary,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      ...t.typography.small,
                      fontWeight: '800',
                      color: selected ? '#FFFFFF' : t.colors.textSecondary,
                    }}
                  >
                    {label(item)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the role, team, and outcomes."
            multiline
          />
          <Field
            label="Skills"
            value={skills}
            onChangeText={setSkills}
            placeholder="React, Node.js, PostgreSQL"
            multiline
          />
          <Field
            label="Requirements"
            value={requirements}
            onChangeText={setRequirements}
            placeholder="One requirement per line or comma"
            multiline
          />
          <Field
            label="Responsibilities"
            value={responsibilities}
            onChangeText={setResponsibilities}
            placeholder="One responsibility per line or comma"
            multiline
          />

          <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Salary min"
                value={salaryMin}
                onChangeText={setSalaryMin}
                placeholder="800000"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Salary max"
                value={salaryMax}
                onChangeText={setSalaryMax}
                placeholder="1500000"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Pressable
            disabled={saving}
            onPress={() => void submit()}
            style={({ pressed }) => ({
              marginTop: t.spacing.lg,
              borderRadius: t.borderRadius.pill,
              backgroundColor: t.colors.primary,
              minHeight: t.minTouchTarget,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed || saving ? 0.75 : 1,
            })}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ ...t.typography.body, fontWeight: '800', color: '#FFFFFF' }}>
                {isEdit ? 'Save changes' : 'Publish job'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}): React.JSX.Element {
  return (
    <View style={{ marginTop: t.spacing.md }}>
      <Text
        style={{
          ...t.typography.caption,
          fontWeight: '800',
          color: t.colors.textPrimary,
          marginBottom: 6,
        }}
      >
        {props.label}
      </Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={t.colors.textSecondary}
        multiline={props.multiline}
        keyboardType={props.keyboardType ?? 'default'}
        style={{
          minHeight: props.multiline ? 104 : 48,
          borderWidth: 1,
          borderColor: t.colors.border,
          borderRadius: t.borderRadius.lg,
          backgroundColor: t.colors.surface,
          paddingHorizontal: t.spacing.md,
          paddingVertical: props.multiline ? t.spacing.md : 0,
          color: t.colors.textPrimary,
          textAlignVertical: props.multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}
