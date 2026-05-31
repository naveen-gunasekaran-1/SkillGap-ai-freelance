import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Badge, Button, Card, Input, Select, Textarea } from '@skillgap/ui';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

const contactReasons = [
  'Company verification and onboarding',
  'Hiring workflow setup',
  'Campus placement or final-year project demo',
  'Admin, security, or storage configuration',
];

const reasonOptions = [
  { label: 'Choose a reason', value: '' },
  ...contactReasons.map((reason) => ({ label: reason, value: reason })),
  { label: 'General inquiry', value: 'General inquiry' },
];

type ContactForm = {
  name: string;
  email: string;
  company: string;
  reason: string;
  message: string;
};

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

export function ContactPage(): React.JSX.Element {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    reason: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: ContactErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!form.reason.trim()) nextErrors.reason = 'Choose the best reason';
    if (!form.message.trim()) nextErrors.message = 'Message is required';
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);
    const payload = new URLSearchParams({
      'form-name': 'contact',
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      reason: form.reason.trim(),
      message: form.message.trim(),
    });

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });
      if (!response.ok) throw new Error('Contact form submission failed');
      setSubmitted(true);
      setForm({ name: '', email: '', company: '', reason: '', message: '' });
      toast.success('Message sent. We will get back to you soon.');
    } catch {
      toast.error('Could not submit the form. Email support@skillgap.ai directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section>
            <Badge variant="ai" className="mb-5">
              Contact us
            </Badge>
            <h1
              className="max-w-2xl font-display text-4xl font-bold tracking-tight text-text-primary md:text-6xl"
              style={{ lineHeight: 1.08 }}
            >
              Let’s set up your hiring workspace.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              Reach out for company onboarding, verification setup, demo walkthroughs, or help
              configuring SkillGap AI for your team.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-semibold text-text-primary">Email</h2>
                <p className="mt-1 text-sm text-text-secondary">support@skillgap.ai</p>
              </Card>
              <Card className="p-5">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="mt-3 font-semibold text-text-primary">For companies</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Verification, jobs, and applicant review.
                </p>
              </Card>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-card">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-success" />
                <h2 className="font-semibold text-text-primary">We can help with</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {contactReasons.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Card className="p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Send a message</h2>
                <p className="text-sm text-text-secondary">
                  Tell us what you need and we will route it to the right setup flow.
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="mt-6 rounded-card border border-success/30 bg-success/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                  <div>
                    <h3 className="font-semibold text-text-primary">Inquiry received</h3>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      Thanks for reaching out. We will review your message and respond by email.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <form
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              className="mt-6 space-y-4"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>
                  Do not fill this out: <input name="bot-field" />
                </label>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  {...(errors.name ? { error: errors.name } : {})}
                  onChange={(e) => setField('name', e.target.value)}
                />
                <Input
                  label="Work email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  {...(errors.email ? { error: errors.email } : {})}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
              <Input
                label="Company / institution"
                name="company"
                placeholder="Company name"
                value={form.company}
                helperText="Optional, but helpful for company or campus setup."
                onChange={(e) => setField('company', e.target.value)}
              />
              <Select
                label="Reason"
                name="reason"
                options={reasonOptions}
                value={form.reason}
                {...(errors.reason ? { error: errors.reason } : {})}
                onChange={(e) => setField('reason', e.target.value)}
              />
              <Textarea
                label="Message"
                name="message"
                rows={6}
                placeholder="Tell us what you want to set up or test."
                value={form.message}
                {...(errors.message ? { error: errors.message } : {})}
                onChange={(e) => setField('message', e.target.value)}
              />
              <Button
                type="submit"
                variant="ai-gradient"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit inquiry'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-text-secondary">
              For immediate testing, create a company account from{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
                registration
              </Link>
              .
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
