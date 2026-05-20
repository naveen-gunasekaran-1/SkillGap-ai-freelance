import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card } from '@skillgap/ui';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';
import { parseUser } from '../lib/normalize';
import { useAuthStore } from '../stores/authStore';

type VerifyState = 'checking' | 'success' | 'error';

export function VerifyEmailPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') ?? '', [params]);
  const [state, setState] = useState<VerifyState>('checking');
  const [message, setMessage] = useState('Verifying your email address...');
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!token) {
        setState('error');
        setMessage('This verification link is missing a token.');
        return;
      }
      try {
        const res = await api.post<{ user: unknown }>('/auth/email-verification/confirm', {
          token,
        });
        if (cancelled) return;
        setUser(parseUser(res.data.user));
        setState('success');
        setMessage('Your email has been verified.');
      } catch (err: unknown) {
        if (cancelled) return;
        const errorMessage =
          err && typeof err === 'object' && 'response' in err
            ? String(
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                  'Verification failed',
              )
            : 'Verification failed';
        setState('error');
        setMessage(errorMessage);
      }
    }
    void verify();
    return () => {
      cancelled = true;
    };
  }, [setUser, token]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center px-6 py-12">
        <Card className="mx-auto w-full max-w-lg p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            {state === 'error' ? (
              <XCircle className="h-7 w-7 text-error" />
            ) : (
              <CheckCircle2 className="h-7 w-7" />
            )}
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text-primary">
            {state === 'checking'
              ? 'Checking email'
              : state === 'success'
                ? 'Email verified'
                : 'Verification failed'}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">{message}</p>
          <div className="mt-6 flex justify-center">
            <Link to="/dashboard">
              <Button>{state === 'success' ? 'Go to dashboard' : 'Back to SkillGap AI'}</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
