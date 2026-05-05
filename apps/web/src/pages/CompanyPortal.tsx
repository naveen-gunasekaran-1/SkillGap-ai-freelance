import { Link } from 'react-router-dom';
import { Button, Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

export function CompanyPortal(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="text-primary hover:underline">
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-text-primary">Company Portal</h1>
        <p className="mt-2 text-text-secondary">Manage job postings and find top talent</p>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary">Active Jobs</h2>
            <p className="mt-2 text-3xl font-bold text-primary">5</p>
            <p className="mt-2 text-sm text-text-secondary">Currently posting</p>
            <Button className="mt-4 w-full">View all jobs</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary">Applications</h2>
            <p className="mt-2 text-3xl font-bold text-primary">42</p>
            <p className="mt-2 text-sm text-text-secondary">Pending review</p>
            <Button className="mt-4 w-full">Review applications</Button>
          </Card>

          <Card className="col-span-2 p-6">
            <h2 className="text-lg font-semibold text-text-primary">Post a new job</h2>
            <p className="mt-2 text-text-secondary">
              Create a new job posting to reach qualified candidates
            </p>
            <Button className="mt-4">Create job posting</Button>
          </Card>
        </div>
      </main>
    </div>
  );
}