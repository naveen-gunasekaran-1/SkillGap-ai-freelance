import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input, Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

/**
 * Password reset placeholder screen.
 */
export function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error('Enter your email address');
      return;
    }
    setSending(true);
    toast('Password reset is not wired yet. We will notify you once it is ready.');
    setTimeout(() => setSending(false), 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center px-6 py-12">
        <Card className="mx-auto w-full max-w-lg p-8">
          <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter the email tied to your account. We will send a reset link once this flow is live.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full" size="lg" disabled={sending}>
              {sending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Back to sign in
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
