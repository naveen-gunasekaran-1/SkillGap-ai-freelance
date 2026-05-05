import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

export function AdminPanel(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="text-primary hover:underline">
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-text-primary">Admin Panel</h1>
        <p className="mt-2 text-text-secondary">System administration and analytics</p>

        <div className="mt-8 grid grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-text-secondary">Total Users</p>
            <p className="mt-2 text-2xl font-bold text-primary">1,250</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-text-secondary">Active Jobs</p>
            <p className="mt-2 text-2xl font-bold text-primary">342</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-text-secondary">Total Applications</p>
            <p className="mt-2 text-2xl font-bold text-primary">5,821</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-text-secondary">System Health</p>
            <p className="mt-2 text-2xl font-bold text-green-600">99.8%</p>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary">User Management</h2>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Active users</span>
                <Badge>1,120</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Pending verification</span>
                <Badge variant="warning">45</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Suspended</span>
                <Badge variant="error">12</Badge>
              </div>
            </div>
            <Button className="mt-4 w-full">Manage users</Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary">System Logs</h2>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <p>Last updated: 5 minutes ago</p>
              <p>Database: Connected</p>
              <p>API status: Healthy</p>
              <p>Cache: 2.3 GB / 10 GB</p>
            </div>
            <Button className="mt-4 w-full">View logs</Button>
          </Card>
        </div>
      </main>
    </div>
  );
}