import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input, Textarea } from '@skillgap/ui';
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

export function ContactPage(): React.JSX.Element {
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
                  This demo form is ready for your backend contact endpoint.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" placeholder="Your name" />
                <Input label="Work email" type="email" placeholder="you@company.com" />
              </div>
              <Input label="Company / institution" placeholder="Company name" />
              <Input label="Reason" placeholder="Company onboarding, demo, support..." />
              <Textarea
                label="Message"
                rows={6}
                placeholder="Tell us what you want to set up or test."
              />
              <Button type="button" variant="ai-gradient" size="lg" className="w-full">
                Submit inquiry
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
