import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';
import { useAuthStore } from '../stores/authStore';

export function OAuthCallbackPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const didRun = useRef(false);
  const code = useMemo(() => params.get('code') ?? '', [params]);
  const returnTo = useMemo(() => params.get('returnTo') ?? '', [params]);
  const error = useMemo(() => params.get('error') ?? '', [params]);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (error || !code) {
      toast.error('Social sign-in failed');
      navigate('/login', { replace: true });
      return;
    }

    void api
      .post<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/oauth/session', {
        code,
        rememberMe: true,
      })
      .then((res) => {
        const user = parseUser(res.data.user);
        setSession(user, res.data.accessToken, res.data.refreshToken, true);
        toast.success('Signed in');
        const fallback =
          user.role === 'ADMIN' ? '/admin' : user.role === 'COMPANY' ? '/company' : '/dashboard';
        navigate(
          returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : fallback,
          {
            replace: true,
          },
        );
      })
      .catch(() => {
        toast.error('Social sign-in expired. Please try again.');
        navigate('/login', { replace: true });
      });
  }, [code, error, navigate, returnTo, setSession]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center px-6 py-12">
        <Card className="mx-auto w-full max-w-md p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h1 className="mt-5 text-xl font-semibold text-text-primary">Finishing sign-in</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Securing your session and loading your workspace.
          </p>
        </Card>
      </main>
    </div>
  );
}
