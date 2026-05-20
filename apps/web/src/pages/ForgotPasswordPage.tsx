import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input, Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';
import { api } from '../lib/api';

/**
 * Password reset request screen.
 */
export function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Enter your email address');
      return;
    }
    setSending(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
      toast.success('If an account exists, a reset link has been sent');
    } catch {
      toast.error('Could not request password reset');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center px-6 py-12">
        <Card className="mx-auto w-full max-w-lg p-8">
          <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter the email tied to your account. If it exists, we will send a secure reset link.
          </p>

          {sent ? (
            <div className="mt-6 rounded-card border border-success/20 bg-success/5 p-4 text-sm text-text-secondary">
              Check your inbox for a password reset link. For security, the link expires in 30
              minutes.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="w-full" size="lg" disabled={sending}>
                {sending ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-secondary">
            Remembered your password?{' '}
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
