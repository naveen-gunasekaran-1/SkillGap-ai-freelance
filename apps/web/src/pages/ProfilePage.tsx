import { useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, Button, Input, Textarea, Badge, Avatar, ProgressBar } from '@skillgap/ui';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Link as LinkIcon,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Edit3,
  Save,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';

interface ProfileFormData {
  name: string;
  title: string;
  location: string;
  phone: string;
  summary: string;
}

/**
 * Candidate profile page with editable sections for personal info, skills, experience, education, and resume.
 */
export function ProfilePage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name ?? '',
      title: user?.title ?? '',
      location: user?.location ?? '',
      phone: user?.phone ?? '',
      summary: user?.summary ?? '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormData & { skills: string[] }>) => {
      const res = await api.patch<{ user: unknown }>('/users/me', data);
      return parseUser(res.data.user);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated');
      setEditingSection(null);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/email-verification/send');
    },
    onSuccess: () => toast.success('Verification email sent'),
    onError: () => toast.error('Could not send verification email'),
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      const res = await api.post<{ user: unknown }>('/uploads/resume/profile', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return parseUser(res.data.user);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setSkills(updatedUser.skills ?? []);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Resume parsed and profile updated');
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
    },
    onError: () => {
      toast.error('Resume upload failed. Try a PDF or DOCX resume.');
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
      updateProfileMutation.mutate({ skills: updated });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    updateProfileMutation.mutate({ skills: updated });
  };

  const handleResumeSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadResumeMutation.mutate(file);
  };

  const displayName = user?.name ?? 'User';
  const completionScore = calculateProfileCompletion(user);

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Your Profile</h1>
          <p className="mt-2 text-text-secondary">
            Manage your professional information and skills
          </p>
        </div>

        {/* Profile Completion Banner */}
        {completionScore < 100 && (
          <Card className="mt-6 p-5 border-warning/30 bg-warning/5 animate-fade-in-up delay-100">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">Complete your profile</p>
                <p className="text-sm text-text-secondary mt-1">
                  A complete profile increases your match scores by up to 40%
                </p>
                <div className="mt-3 max-w-xs">
                  <ProgressBar value={completionScore} />
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="overflow-hidden animate-fade-in-up delay-200">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-text-secondary" />
                  <h2 className="font-semibold text-text-primary">Personal Information</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditingSection(editingSection === 'personal' ? null : 'personal')
                  }
                >
                  {editingSection === 'personal' ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </>
                  )}
                </Button>
              </div>
              <div className="p-5">
                {editingSection === 'personal' ? (
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Full Name" {...register('name')} />
                      <Input
                        label="Job Title"
                        {...register('title')}
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Location"
                        {...register('location')}
                        placeholder="e.g. San Francisco, CA"
                      />
                      <Input label="Phone" {...register('phone')} type="tel" />
                    </div>
                    <Textarea
                      label="Professional Summary"
                      {...register('summary')}
                      rows={4}
                      placeholder="A brief overview of your experience and career goals..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setEditingSection(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!isDirty || updateProfileMutation.isPending}>
                        <Save className="h-4 w-4 mr-1" />
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={displayName} src={user?.avatar} size="lg" />
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                          {user?.name || 'Add your name'}
                        </h3>
                        <p className="text-text-secondary">{user?.title || 'Add your job title'}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 pt-4 border-t border-border sm:grid-cols-2">
                      <InfoRow
                        icon={<Mail className="h-4 w-4" />}
                        label="Email"
                        value={user?.email ?? null}
                      />
                      <InfoRow
                        icon={<Phone className="h-4 w-4" />}
                        label="Phone"
                        value={user?.phone || 'Not set'}
                      />
                      <InfoRow
                        icon={<MapPin className="h-4 w-4" />}
                        label="Location"
                        value={user?.location || 'Not set'}
                      />
                      <InfoRow
                        icon={<Briefcase className="h-4 w-4" />}
                        label="Title"
                        value={user?.title || 'Not set'}
                      />
                    </div>
                    {user?.summary && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {user.summary}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Card className="overflow-hidden animate-fade-in-up delay-300">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-text-secondary" />
                  <h2 className="font-semibold text-text-primary">Skills</h2>
                </div>
                {user?.skillsVerified && (
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-primary"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-error"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-sm text-text-secondary">No skills added yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddSkill} disabled={!newSkill.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Experience */}
            <Card className="overflow-hidden animate-fade-in-up delay-400">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-text-secondary" />
                  <h2 className="font-semibold text-text-primary">Experience</h2>
                </div>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="p-5">
                {user?.experience?.length ? (
                  <div className="space-y-4">
                    {user.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light flex-shrink-0">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary">{exp.role}</h4>
                          <p className="text-sm text-text-secondary">{exp.company}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                          {exp.summary && (
                            <p className="text-sm text-text-secondary mt-2">{exp.summary}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">
                    No experience added yet. Add your work history to improve matches.
                  </p>
                )}
              </div>
            </Card>

            {/* Education */}
            <Card className="overflow-hidden animate-fade-in-up delay-500">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-text-secondary" />
                  <h2 className="font-semibold text-text-primary">Education</h2>
                </div>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="p-5">
                {user?.education?.length ? (
                  <div className="space-y-4">
                    {user.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai-purple/10 flex-shrink-0">
                          <GraduationCap className="h-5 w-5 text-ai-purple" />
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary">{edu.degree}</h4>
                          <p className="text-sm text-text-secondary">{edu.school}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            {edu.startYear} - {edu.endYear || 'Present'}
                            {edu.gpa && ` | GPA: ${edu.gpa}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">
                    No education added yet. Add your academic background.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume Upload */}
            <Card className="p-5 animate-fade-in-up delay-300">
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={handleResumeSelect}
              />
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-text-secondary" />
                <h2 className="font-semibold text-text-primary">Resume</h2>
              </div>
              {user?.resumeUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        Resume uploaded
                      </p>
                      <p className="text-xs text-text-secondary">
                        {user.resumeStatus === 'VERIFIED' ? 'Verified' : 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-card border border-border bg-white px-3 text-sm font-medium text-text-primary shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" /> View
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      loading={uploadResumeMutation.isPending}
                      onClick={() => resumeInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" /> Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary hover:bg-primary-light/10 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-70"
                  disabled={uploadResumeMutation.isPending}
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-text-secondary mx-auto mb-3" />
                  <p className="text-sm font-medium text-text-primary">
                    {uploadResumeMutation.isPending ? 'Parsing resume...' : 'Upload your resume'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">PDF, DOCX, or TXT up to 6MB</p>
                </button>
              )}
            </Card>

            {/* Profile Links */}
            <Card className="p-5 animate-fade-in-up delay-400">
              <div className="flex items-center gap-3 mb-4">
                <LinkIcon className="h-5 w-5 text-text-secondary" />
                <h2 className="font-semibold text-text-primary">Links</h2>
              </div>
              {user?.links?.length ? (
                <div className="space-y-2">
                  {user.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <span className="text-sm text-text-primary">{link.label}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  Add links to your portfolio, GitHub, LinkedIn, etc.
                </p>
              )}
              <Button variant="ghost" size="sm" className="mt-3 w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Link
              </Button>
            </Card>

            {/* Account Status */}
            <Card className="p-5 animate-fade-in-up delay-500">
              <h2 className="font-semibold text-text-primary mb-4">Account Status</h2>
              <div className="space-y-3">
                <StatusRow label="Email" verified={Boolean(user?.emailVerified)} />
                {!user?.emailVerified && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={resendVerificationMutation.isPending}
                    onClick={() => resendVerificationMutation.mutate()}
                  >
                    {resendVerificationMutation.isPending
                      ? 'Sending...'
                      : 'Resend verification email'}
                  </Button>
                )}
                <StatusRow label="Skills" verified={Boolean(user?.skillsVerified)} />
                <StatusRow label="Resume" verified={user?.resumeStatus === 'VERIFIED'} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 text-sm">
      <span className="mt-0.5 shrink-0 text-text-secondary">{icon}</span>
      <span className="shrink-0 text-text-secondary">{label}:</span>
      <span
        className={`min-w-0 flex-1 break-words font-medium leading-5 ${
          value && value !== 'Not set' ? 'text-text-primary' : 'text-text-secondary'
        }`}
      >
        {value || 'Not set'}
      </span>
    </div>
  );
}

function StatusRow({ label, verified }: { label: string; verified?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      {verified ? (
        <Badge variant="success">
          <CheckCircle className="h-3 w-3 mr-1" /> Verified
        </Badge>
      ) : (
        <Badge variant="neutral">Pending</Badge>
      )}
    </div>
  );
}

function calculateProfileCompletion(
  user: ReturnType<typeof useAuthStore.getState>['user'],
): number {
  if (!user) return 0;

  const fields = [
    user.name,
    user.title,
    user.location,
    user.phone,
    user.summary,
    user.skills?.length,
    user.experience?.length,
    user.education?.length,
    user.resumeUrl,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}
