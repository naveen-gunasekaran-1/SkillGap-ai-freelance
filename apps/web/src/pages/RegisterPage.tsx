import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';
import { useAuthStore } from '../stores/authStore';

type Role = 'CANDIDATE' | 'COMPANY' | null;
const skillOptions = ['React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'CSS', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Next.js', 'Vue.js', 'MongoDB', 'PostgreSQL', 'Redis', 'Git', 'Figma', 'Tailwind CSS'];

/**
 * Multi-step registration page: Role → Info → Skills/Company details.
 */
export function RegisterPage(): React.JSX.Element {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', companyName: '', industry: '', website: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [showPw, setShowPw] = useState(false);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 8 ? 2 : /[A-Z]/.test(form.password) && /\d/.test(form.password) ? 4 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const strengthColor = ['', 'bg-error', 'bg-warning', 'bg-primary', 'bg-success'][pwStrength];

  const toggleSkill = (s: string) => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 20 ? [...prev, s] : prev);

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error('Choose a role to continue');
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
    if (role === 'CANDIDATE' && skills.length === 0) {
      toast.error('Pick at least one skill');
      return;
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
              skills,
            }
          : {
              role: 'COMPANY' as const,
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              password: form.password,
              company: {
                name: form.companyName.trim(),
                industry: form.industry.trim(),
                ...(form.website.trim() ? { website: form.website.trim() } : {}),
              },
            };

      const res = await api.post<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/register', body);
      setSession(parseUser(res.data.user), res.data.accessToken, res.data.refreshToken);
      toast.success('Account created');
      navigate('/dashboard', { replace: true });
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
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-lg items-center px-6 py-12">
        <div className="w-full animate-fade-in-up">
          {/* Progress indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${step >= s ? 'bg-primary text-white shadow-card' : 'bg-border text-text-secondary'}`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all duration-300 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
          <p className="mb-8 text-center text-sm text-text-secondary">
            Step {step} of 3 — {step === 1 ? 'Choose your role' : step === 2 ? 'Your details' : role === 'CANDIDATE' ? 'Pick your skills' : 'Company info'}
          </p>

          <div className="rounded-2xl border border-border bg-white p-8 shadow-card">
            {/* ═══ STEP 1: Role selection ═══ */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
                <p className="mt-2 text-text-secondary">How will you use SkillGap AI?</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {([
                    { r: 'CANDIDATE' as Role, icon: '🎓', title: 'Candidate', desc: 'Find jobs, get gap analysis, and learn' },
                    { r: 'COMPANY' as Role, icon: '🏢', title: 'Company', desc: 'Post jobs, review candidates, hire talent' },
                  ]).map((opt) => (
                    <button
                      key={opt.r}
                      type="button"
                      onClick={() => { setRole(opt.r); setStep(2); }}
                      className={`group rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${role === opt.r ? 'border-primary bg-primary-light/30 shadow-card' : 'border-border hover:border-primary/30'}`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <h3 className="mt-3 text-lg font-semibold text-text-primary">{opt.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ STEP 2: Personal info ═══ */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-text-primary">Your details</h1>
                <p className="mt-2 text-text-secondary">Tell us a bit about yourself</p>
                <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
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

            {/* ═══ STEP 3: Skills or Company ═══ */}
            {step === 3 && (
              <div className="animate-fade-in-up">
                {role === 'CANDIDATE' ? (
                  <>
                    <h1 className="text-2xl font-bold text-text-primary">Pick your skills</h1>
                    <p className="mt-2 text-text-secondary">Select up to 20 skills ({skills.length}/20)</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {skillOptions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${skills.includes(s) ? 'bg-primary text-white shadow-card' : 'bg-border/50 text-text-secondary hover:bg-primary-light hover:text-primary'}`}
                        >
                          {skills.includes(s) && '✓ '}{s}
                        </button>
                      ))}
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
                <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1" disabled={submitting}>
                    Back
                  </Button>
                  <Button type="submit" variant="ai-gradient" className="flex-1" disabled={submitting}>
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