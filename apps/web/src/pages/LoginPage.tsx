import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';
import { useAuthStore } from '../stores/authStore';

/**
 * Login page with split-panel layout, OAuth buttons, show/hide password,
 * remember me, and animated entrance.
 */
export function LoginPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      setSession(parseUser(res.data.user), res.data.accessToken, res.data.refreshToken);
      toast.success('Signed in');
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Sign in failed')
          : 'Sign in failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left panel — branding */}
          <div className="hidden flex-col justify-center lg:flex animate-fade-in-up">
            <div className="rounded-3xl bg-gradient-to-br from-primary-light via-white to-ai-cyan/10 p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-ai-cyan shadow-card flex items-center justify-center">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <span className="text-2xl font-bold text-text-primary">SkillGap AI</span>
              </div>
              <h2 className="text-3xl font-bold text-text-primary leading-tight">
                Welcome back.<br />
                <span className="text-ai-gradient">Your career roadmap awaits.</span>
              </h2>
              <p className="mt-4 text-text-secondary leading-relaxed">
                Sign in to access your personalized gap analysis, track applications,
                and discover new learning recommendations.
              </p>
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 rounded-card bg-white/80 p-4 shadow-card">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-lg">📊</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Real-time tracking</p>
                    <p className="text-xs text-text-secondary">See every application status update instantly</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-card bg-white/80 p-4 shadow-card">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-lg">🎯</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Smart recommendations</p>
                    <p className="text-xs text-text-secondary">AI-curated courses based on your specific gaps</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Login form */}
          <div className="flex flex-col justify-center animate-fade-in-up delay-200">
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <h1 className="text-3xl font-bold text-text-primary">Sign in</h1>
              <p className="mt-2 text-text-secondary">Welcome back to SkillGap AI</p>

              {/* OAuth */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button type="button" className="flex items-center justify-center gap-2.5 rounded-card border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2.5 rounded-card border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-text-secondary">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className="relative">
                  <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary transition-colors" aria-label={showPw ? 'Hide password' : 'Show password'}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={showPw ? "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" : "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"} />{!showPw && <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />}</svg>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm text-text-secondary">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Forgot password?</Link>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">Create one for free</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}