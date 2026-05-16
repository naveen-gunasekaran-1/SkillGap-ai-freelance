import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input, Textarea, Card, Badge } from '@skillgap/ui';
import { BriefcaseBusiness, Check, GraduationCap } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';
import { useAuthStore } from '../stores/authStore';

type Role = 'CANDIDATE' | 'COMPANY' | null;
type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

const skillOptions = ['React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'CSS', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Next.js', 'Vue.js', 'MongoDB', 'PostgreSQL', 'Redis', 'Git', 'Figma', 'Tailwind CSS'];
const levelOptions: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const roleOptions = [
  {
    r: 'CANDIDATE' as const,
    icon: GraduationCap,
    title: 'Candidate',
    desc: 'Build a verified profile, compare against jobs, and get explainable skill guidance.',
  },
  {
    r: 'COMPANY' as const,
    icon: BriefcaseBusiness,
    title: 'Company',
    desc: 'Verify your organization, publish jobs, and review applicants with explainable AI.',
  },
];

const emptyEducation = { school: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' };
const emptyInternship = { company: '', role: '', startDate: '', endDate: '', summary: '' };
const emptyExperience = { company: '', role: '', startDate: '', endDate: '', summary: '', bullets: [''] };
const emptyProject = { name: '', stack: '', link: '', summary: '' };
const emptyLink = { label: '', url: '' };

/**
 * Multi-step registration page: Role → Info → Profile → Background.
 */
export function RegisterPage(): React.JSX.Element {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', companyName: '', industry: '', website: '' });
  const [profile, setProfile] = useState({ title: '', location: '', summary: '', phone: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<string, SkillLevel>>({});
  const [education, setEducation] = useState([{ ...emptyEducation }]);
  const [internships, setInternships] = useState([{ ...emptyInternship }]);
  const [experience, setExperience] = useState([{ ...emptyExperience }]);
  const [projects, setProjects] = useState([{ ...emptyProject }]);
  const [links, setLinks] = useState([{ ...emptyLink }]);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const setProfileField = (key: keyof typeof profile, val: string) => setProfile((p) => ({ ...p, [key]: val }));
  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 8 ? 2 : /[A-Z]/.test(form.password) && /\d/.test(form.password) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const strengthColor = ['', 'bg-error', 'bg-warning', 'bg-primary', 'bg-success'][pwStrength];

  const toggleSkill = (s: string) =>
    setSkills((prev) => {
      if (prev.includes(s)) {
        setSkillLevels((levels) => {
          const next = { ...levels };
          delete next[s];
          return next;
        });
        return prev.filter((x) => x !== s);
      }
      if (prev.length >= 20) return prev;
      setSkillLevels((levels) => ({ ...levels, [s]: 'INTERMEDIATE' }));
      return [...prev, s];
    });

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const skillLevelList = useMemo(
    () => skills.map((name) => ({ name, level: skillLevels[name] ?? 'INTERMEDIATE' })),
    [skills, skillLevels],
  );

  const getCompanyWebsite = (): string | undefined => {
    const website = form.website.trim();
    if (!website) return undefined;
    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
  };

  const uploadResume = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ url: string }>('/uploads/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeUrl(res.data.url);
      setResumeName(file.name);
      toast.success('Resume uploaded');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Upload failed')
          : 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error('Choose a role to continue');
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (role === 'CANDIDATE') {
      if (skills.length === 0) {
        toast.error('Pick at least one skill');
        return;
      }
      if (!profile.title.trim() || !profile.location.trim() || profile.summary.trim().length < 20) {
        toast.error('Add a realistic title, location, and summary');
        return;
      }
      if (!resumeUrl) {
        toast.error('Resume upload is required');
        return;
      }
      const hasEducation = education.some((e) => e.school.trim() && e.degree.trim() && e.startYear.trim());
      const hasInternship = internships.some((i) => i.company.trim() && i.role.trim() && i.startDate.trim());
      const hasLink = links.some((l) => l.label.trim() && l.url.trim());
      if (!hasEducation) {
        toast.error('Add at least one education entry');
        return;
      }
      if (!hasInternship) {
        toast.error('Add at least one internship entry');
        return;
      }
      if (!hasLink) {
        toast.error('Add at least one portfolio link');
        return;
      }
    }
    if (role === 'COMPANY' && (!form.companyName.trim() || !form.industry.trim())) {
      toast.error('Company name and industry are required');
      return;
    }

    setSubmitting(true);
    try {
      const body =
        role === 'CANDIDATE'
          ? {
              role: 'CANDIDATE' as const,
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              password: form.password,
              profile: {
                title: profile.title.trim(),
                location: profile.location.trim(),
                summary: profile.summary.trim(),
                ...(profile.phone.trim() ? { phone: profile.phone.trim() } : {}),
                skillLevels: skillLevelList,
                education: education
                  .filter((e) => e.school.trim() && e.degree.trim() && e.startYear.trim())
                  .map((e) => ({
                    school: e.school.trim(),
                    degree: e.degree.trim(),
                    field: e.field.trim() || undefined,
                    startYear: Number(e.startYear),
                    endYear: e.endYear.trim() ? Number(e.endYear) : undefined,
                    gpa: e.gpa.trim() || undefined,
                  })),
                internships: internships
                  .filter((i) => i.company.trim() && i.role.trim() && i.startDate.trim())
                  .map((i) => ({
                    company: i.company.trim(),
                    role: i.role.trim(),
                    startDate: i.startDate.trim(),
                    endDate: i.endDate.trim() || undefined,
                    summary: i.summary.trim() || undefined,
                  })),
                experience: experience
                  .filter((x) => x.company.trim() && x.role.trim() && x.startDate.trim())
                  .map((x) => ({
                    company: x.company.trim(),
                    role: x.role.trim(),
                    startDate: x.startDate.trim(),
                    endDate: x.endDate.trim() || undefined,
                    summary: x.summary.trim() || undefined,
                    bullets: x.bullets.map((b) => b.trim()).filter(Boolean),
                  })),
                projects: projects
                  .filter((p) => p.name.trim() && p.stack.trim())
                  .map((p) => ({
                    name: p.name.trim(),
                    stack: p.stack.split(',').map((s) => s.trim()).filter(Boolean),
                    link: p.link.trim() || undefined,
                    summary: p.summary.trim() || undefined,
                  })),
                links: links
                  .filter((l) => l.label.trim() && l.url.trim())
                  .map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
                resumeUrl,
              },
            }
          : {
              role: 'COMPANY' as const,
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              password: form.password,
              company: {
                name: form.companyName.trim(),
                industry: form.industry.trim(),
                ...(getCompanyWebsite() ? { website: getCompanyWebsite() } : {}),
              },
            };

      const res = await api.post<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/register', body);
      const user = parseUser(res.data.user);
      setSession(user, res.data.accessToken, res.data.refreshToken, true);
      toast.success('Account created. Verify your email to unlock full features.');
      navigate(user.role === 'COMPANY' ? '/company' : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Registration failed')
          : 'Registration failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:py-12">
        <div className="w-full animate-fade-in-up">
          {/* Progress indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${step >= s ? 'bg-primary text-white shadow-card' : 'bg-border text-text-secondary'}`}>
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 4 && <div className={`h-0.5 w-8 rounded-full transition-all duration-300 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
          <p className="mb-8 text-center text-sm text-text-secondary">
            Step {step} of 4 — {step === 1 ? 'Choose your role' : step === 2 ? 'Your details' : step === 3 ? (role === 'CANDIDATE' ? 'Profile essentials' : 'Company info') : 'Background & skills'}
          </p>

          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8 lg:p-10">
            {/* ═══ STEP 1: Role selection ═══ */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
                <p className="mt-2 text-text-secondary">How will you use SkillGap AI?</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                    <button
                      key={opt.r}
                      type="button"
                      onClick={() => { setRole(opt.r); setStep(2); }}
                      className={`group rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${role === opt.r ? 'border-primary bg-primary-light/30 shadow-card' : 'border-border hover:border-primary/30'}`}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary transition-transform duration-200 group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-text-primary">{opt.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{opt.desc}</p>
                    </button>
                  );
                  })}
                </div>
              </div>
            )}

            {/* ═══ STEP 2: Personal info ═══ */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-text-primary">Your details</h1>
                <p className="mt-2 text-text-secondary">Tell us a bit about yourself</p>
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!form.name.trim() || !form.email.trim()) {
                      toast.error('Name and email are required');
                      return;
                    }
                    if (form.password !== form.confirmPassword) {
                      toast.error('Passwords do not match');
                      return;
                    }
                    if (form.password.length < 8) {
                      toast.error('Password must be at least 8 characters');
                      return;
                    }
                    setStep(3);
                  }}
                >
                  <Input label="Full name" placeholder="John Doe" value={form.name} onChange={(e) => set('name', e.target.value)} />
                  <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  <div className="relative">
                    <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary transition-colors" aria-label="Toggle password">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                    </button>
                    {form.password.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-200 ${i <= pwStrength ? strengthColor : 'bg-border'}`} />)}</div>
                        <span className={`text-xs font-medium ${pwStrength <= 1 ? 'text-error' : pwStrength === 2 ? 'text-warning' : pwStrength === 3 ? 'text-primary' : 'text-success'}`}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  <Input label="Confirm password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button type="submit" className="flex-1">Continue</Button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══ STEP 3: Profile essentials or Company ═══ */}
            {step === 3 && (
              <form className="animate-fade-in-up" onSubmit={role === 'COMPANY' ? handleSubmit : (e) => { e.preventDefault(); setStep(4); }}>
                {role === 'CANDIDATE' ? (
                  <>
                    <h1 className="text-2xl font-bold text-text-primary">Profile essentials</h1>
                    <p className="mt-2 text-text-secondary">Add the basics recruiters look for first.</p>
                    <div className="mt-6 space-y-4">
                      <Input label="Headline" placeholder="Frontend Engineer" value={profile.title} onChange={(e) => setProfileField('title', e.target.value)} />
                      <Input label="Location" placeholder="San Francisco, CA" value={profile.location} onChange={(e) => setProfileField('location', e.target.value)} />
                      <Input label="Phone (optional)" placeholder="+1 555 123 4567" value={profile.phone} onChange={(e) => setProfileField('phone', e.target.value)} />
                      <Textarea label="Professional summary" placeholder="2-3 sentences about your focus, impact, and career goals." value={profile.summary} onChange={(e) => setProfileField('summary', e.target.value)} />
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">Portfolio links</h2>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setLinks((prev) => [...prev, { ...emptyLink }])}>
                          Add link
                        </Button>
                      </div>
                      <div className="mt-4 space-y-3">
                        {links.map((link, idx) => (
                          <div key={`${link.label}-${idx}`} className="grid gap-3 sm:grid-cols-2">
                            <Input label="Label" placeholder="LinkedIn" value={link.label} onChange={(e) => setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, label: e.target.value } : l)))} />
                            <Input label="URL" placeholder="https://linkedin.com/in/you" value={link.url} onChange={(e) => setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, url: e.target.value } : l)))} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-text-primary">Resume</h2>
                        {resumeUrl && <Badge variant="success">Uploaded</Badge>}
                      </div>
                      <div className="mt-3 rounded-card border border-dashed border-border bg-background/60 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{resumeName || 'Upload your resume (PDF/DOCX)'}</p>
                            <p className="text-xs text-text-secondary">Max 6MB. Required for verification.</p>
                          </div>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-card border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-card">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void uploadResume(file);
                              }}
                            />
                            {uploading ? 'Uploading…' : 'Choose file'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-text-primary">Company details</h1>
                    <p className="mt-2 text-text-secondary">Tell us about your organization</p>
                    <div className="mt-6 space-y-4">
                      <Input label="Company name" placeholder="Acme Inc." value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
                      <Input label="Industry" placeholder="e.g. Technology, Finance" value={form.industry} onChange={(e) => set('industry', e.target.value)} />
                      <Input label="Website" placeholder="https://example.com" value={form.website} onChange={(e) => set('website', e.target.value)} />
                    </div>
                  </>
                )}
                <div className="mt-8 flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" variant="ai-gradient" className="flex-1" disabled={submitting}>
                    {role === 'COMPANY' ? (submitting ? 'Creating…' : 'Create account') : 'Continue'}
                  </Button>
                </div>
              </form>
            )}

            {/* ═══ STEP 4: Background & Skills ═══ */}
            {step === 4 && role === 'CANDIDATE' && (
              <div className="animate-fade-in-up space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">Background & skills</h1>
                  <p className="mt-2 text-text-secondary">This powers your match score and gap analysis.</p>
                </div>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Skills assessment</h2>
                    <Badge variant="info">{skills.length}/20</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skillOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${skills.includes(s) ? 'bg-primary text-white shadow-card' : 'bg-border/50 text-text-secondary hover:bg-primary-light hover:text-primary'}`}
                      >
                        {skills.includes(s) && <Check className="mr-1 inline h-3.5 w-3.5" />}{s}
                      </button>
                    ))}
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {skills.map((skill) => (
                        <label key={skill} className="flex items-center justify-between rounded-card border border-border bg-white px-4 py-2 text-sm">
                          <span className="font-medium text-text-primary">{skill}</span>
                          <select
                            className="rounded-md border border-border bg-white px-2 py-1 text-xs"
                            value={skillLevels[skill] ?? 'INTERMEDIATE'}
                            onChange={(e) => setSkillLevels((prev) => ({ ...prev, [skill]: e.target.value as SkillLevel }))}
                          >
                            {levelOptions.map((lvl) => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Education</h2>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEducation((prev) => [...prev, { ...emptyEducation }])}>
                      Add school
                    </Button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {education.map((entry, idx) => (
                      <div key={`${entry.school}-${idx}`} className="grid gap-3 sm:grid-cols-2">
                        <Input label="School" value={entry.school} onChange={(e) => setEducation((prev) => prev.map((x, i) => (i === idx ? { ...x, school: e.target.value } : x)))} />
                        <Input label="Degree" value={entry.degree} onChange={(e) => setEducation((prev) => prev.map((x, i) => (i === idx ? { ...x, degree: e.target.value } : x)))} />
                        <Input label="Field" value={entry.field} onChange={(e) => setEducation((prev) => prev.map((x, i) => (i === idx ? { ...x, field: e.target.value } : x)))} />
                        <Input label="GPA" value={entry.gpa} onChange={(e) => setEducation((prev) => prev.map((x, i) => (i === idx ? { ...x, gpa: e.target.value } : x)))} />
                        <Input label="Start year" value={entry.startYear} onChange={(e) => setEducation((prev) => prev.map((x, i) => (i === idx ? { ...x, startYear: e.target.value } : x)))} />
                        <Input label="End year" value={entry.endYear} onChange={(e) => setEducation((prev) => prev.map((x, i) => (i === idx ? { ...x, endYear: e.target.value } : x)))} />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Internships</h2>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setInternships((prev) => [...prev, { ...emptyInternship }])}>
                      Add internship
                    </Button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {internships.map((entry, idx) => (
                      <div key={`${entry.company}-${idx}`} className="grid gap-3 sm:grid-cols-2">
                        <Input label="Company" value={entry.company} onChange={(e) => setInternships((prev) => prev.map((x, i) => (i === idx ? { ...x, company: e.target.value } : x)))} />
                        <Input label="Role" value={entry.role} onChange={(e) => setInternships((prev) => prev.map((x, i) => (i === idx ? { ...x, role: e.target.value } : x)))} />
                        <Input label="Start date" value={entry.startDate} onChange={(e) => setInternships((prev) => prev.map((x, i) => (i === idx ? { ...x, startDate: e.target.value } : x)))} />
                        <Input label="End date" value={entry.endDate} onChange={(e) => setInternships((prev) => prev.map((x, i) => (i === idx ? { ...x, endDate: e.target.value } : x)))} />
                        <Textarea label="Highlights" value={entry.summary} onChange={(e) => setInternships((prev) => prev.map((x, i) => (i === idx ? { ...x, summary: e.target.value } : x)))} />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Experience (optional)</h2>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setExperience((prev) => [...prev, { ...emptyExperience }])}>
                      Add role
                    </Button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {experience.map((entry, idx) => (
                      <div key={`${entry.company}-${idx}`} className="grid gap-3 sm:grid-cols-2">
                        <Input label="Company" value={entry.company} onChange={(e) => setExperience((prev) => prev.map((x, i) => (i === idx ? { ...x, company: e.target.value } : x)))} />
                        <Input label="Role" value={entry.role} onChange={(e) => setExperience((prev) => prev.map((x, i) => (i === idx ? { ...x, role: e.target.value } : x)))} />
                        <Input label="Start date" value={entry.startDate} onChange={(e) => setExperience((prev) => prev.map((x, i) => (i === idx ? { ...x, startDate: e.target.value } : x)))} />
                        <Input label="End date" value={entry.endDate} onChange={(e) => setExperience((prev) => prev.map((x, i) => (i === idx ? { ...x, endDate: e.target.value } : x)))} />
                        <Textarea label="Summary" value={entry.summary} onChange={(e) => setExperience((prev) => prev.map((x, i) => (i === idx ? { ...x, summary: e.target.value } : x)))} />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Projects (optional)</h2>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setProjects((prev) => [...prev, { ...emptyProject }])}>
                      Add project
                    </Button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {projects.map((entry, idx) => (
                      <div key={`${entry.name}-${idx}`} className="grid gap-3 sm:grid-cols-2">
                        <Input label="Project name" value={entry.name} onChange={(e) => setProjects((prev) => prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                        <Input label="Stack (comma separated)" value={entry.stack} onChange={(e) => setProjects((prev) => prev.map((x, i) => (i === idx ? { ...x, stack: e.target.value } : x)))} />
                        <Input label="Project link" value={entry.link} onChange={(e) => setProjects((prev) => prev.map((x, i) => (i === idx ? { ...x, link: e.target.value } : x)))} />
                        <Textarea label="Summary" value={entry.summary} onChange={(e) => setProjects((prev) => prev.map((x, i) => (i === idx ? { ...x, summary: e.target.value } : x)))} />
                      </div>
                    ))}
                  </div>
                </Card>

                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setStep(3)} className="flex-1" disabled={submitting}>
                    Back
                  </Button>
                  <Button type="submit" variant="ai-gradient" className="flex-1" disabled={submitting || uploading}>
                    {submitting ? 'Creating…' : 'Create account'}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
