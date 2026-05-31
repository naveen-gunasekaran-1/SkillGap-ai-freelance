import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '@skillgap/ui';
import { ArrowRight, Bell, BriefcaseBusiness, CheckCircle2, FileText } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useAuthStore } from '../stores/authStore';

const candidateNotifications = [
  {
    icon: BriefcaseBusiness,
    title: 'New job matches are available',
    body: 'Review open roles that fit your current skills and resume profile.',
    to: '/jobs',
    cta: 'Browse jobs',
  },
  {
    icon: FileText,
    title: 'Keep your resume fresh',
    body: 'Upload an updated resume to improve parsed skills, education, and experience.',
    to: '/profile',
    cta: 'Update profile',
  },
];

const companyNotifications = [
  {
    icon: CheckCircle2,
    title: 'Company verification status',
    body: 'Complete verification to unlock job posting and candidate review workflows.',
    to: '/company/verification',
    cta: 'Open verification',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Hiring activity',
    body: 'Review applicants and move qualified candidates through your hiring pipeline.',
    to: '/company/candidates',
    cta: 'Review candidates',
  },
];

export function NotificationsPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const items = user?.role === 'COMPANY' ? companyNotifications : candidateNotifications;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl p-4 lg:p-8">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Notifications</h1>
          <p className="mt-2 text-text-secondary">
            Action items and updates for your SkillGap AI workspace.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-text-primary">{item.title}</h2>
                      <Badge variant="neutral">Current</Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
                  </div>
                  <Link to={item.to}>
                    <Button variant="secondary" size="sm">
                      {item.cta}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 p-5 text-center">
          <Bell className="mx-auto h-8 w-8 text-text-secondary" />
          <p className="mt-3 text-sm text-text-secondary">
            You are all caught up. New application, verification, and profile updates will appear
            here.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
