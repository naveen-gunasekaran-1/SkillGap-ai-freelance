import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

export function ApplicationDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link to="/applications" className="text-primary hover:underline">
          ← Back to applications
        </Link>

        <Card className="mt-6 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Senior Frontend Engineer</h1>
              <p className="mt-2 text-lg text-text-secondary">TechCorp</p>
            </div>
            <Badge variant="warning">Under review</Badge>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Applied</p>
              <p className="mt-1 font-medium">May 1, 2024</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Last update</p>
              <p className="mt-1 font-medium">May 3, 2024</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Status</p>
              <p className="mt-1 font-medium">Under review</p>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h2 className="font-semibold text-text-primary">Application timeline</h2>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <div className="h-3 w-3 rounded-full bg-primary mt-1" />
                <div>
                  <p className="font-medium">Application submitted</p>
                  <p className="text-sm text-text-secondary">May 1, 2024 at 2:30 PM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-3 w-3 rounded-full bg-primary mt-1" />
                <div>
                  <p className="font-medium">Application received</p>
                  <p className="text-sm text-text-secondary">May 1, 2024 at 3:15 PM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-3 w-3 rounded-full bg-gray-300 mt-1" />
                <div>
                  <p className="font-medium text-gray-500">Next step pending</p>
                  <p className="text-sm text-text-secondary">Waiting for recruiter review</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button>View job</Button>
            <Button variant="secondary">Withdraw application</Button>
          </div>
        </Card>
      </main>
    </div>
  );
}