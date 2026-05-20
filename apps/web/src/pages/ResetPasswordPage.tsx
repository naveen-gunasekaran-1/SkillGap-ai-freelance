import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';

export function ResetPasswordPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') ?? '', [params]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error('Reset link is missing or invalid');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password updated');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                'Could not reset password',
            )
          : 'Could not reset password';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center px-6 py-12">
        <Card className="mx-auto w-full max-w-lg p-8">
          <h1 className="text-2xl font-bold text-text-primary">Create a new password</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Choose a strong password. Signing in again will be required on all devices.
          </p>

          {!token && (
            <div className="mt-6 rounded-card border border-error/20 bg-error/5 p-4 text-sm text-text-secondary">
              This reset link is missing a token. Request a new password reset link.
            </div>
          )}

          {done ? (
            <div className="mt-6 rounded-card border border-success/20 bg-success/5 p-4 text-sm text-text-secondary">
              Your password has been updated. Redirecting to sign in...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="New password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Input
                label="Confirm new password"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <Button type="submit" className="w-full" size="lg" disabled={!token || submitting}>
                {submitting ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-secondary">
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
