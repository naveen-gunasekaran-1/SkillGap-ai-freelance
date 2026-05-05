import { Link } from 'react-router-dom';
import { Badge, Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const mockApplications = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Engineer',
    company: 'TechCorp',
    status: 'reviewing',
    appliedDate: '2024-05-01',
  },
  {
    id: '2',
    jobTitle: 'Full Stack Developer',
    company: 'StartupXYZ',
    status: 'interview',
    appliedDate: '2024-04-28',
  },
  {
    id: '3',
    jobTitle: 'Backend Engineer',
    company: 'BigTech',
    status: 'rejected',
    appliedDate: '2024-04-20',
  },
];

function getStatusColor(
  status: string,
): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'reviewing':
      return 'warning';
    case 'interview':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'info';
  }
}

export function ApplicationsPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold text-text-primary">Your Applications</h1>
        <p className="mt-2 text-text-secondary">Track your job applications and interviews</p>

        <div className="mt-8 space-y-4">
          {mockApplications.map((app) => (
            <Link key={app.id} to={`/applications/${app.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-text-primary">{app.jobTitle}</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      {app.company} • Applied {app.appliedDate}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}