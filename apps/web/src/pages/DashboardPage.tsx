import { MatchScore, ProgressBar, Card, Badge } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

export function DashboardPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Your skill gap analysis and job recommendations, organized into one clean view.
            </p>
          </div>
          <div className="rounded-full border border-border bg-white px-4 py-2 text-sm text-text-secondary shadow-card">
            Last updated today
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">Overall Match Score</h2>
            <div className="mt-4 flex items-center justify-center">
              <MatchScore value={78} size={120} />
            </div>
            <p className="mt-4 text-center text-sm text-text-secondary">
              You're a strong match for 12 jobs in your area
            </p>
          </Card>

          <Card className="p-6 shadow-card">
            <h2 className="text-lg font-semibold text-text-primary">Skills Progress</h2>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>React</span>
                  <span className="text-text-secondary">85%</span>
                </div>
                <ProgressBar value={85} />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>TypeScript</span>
                  <span className="text-text-secondary">72%</span>
                </div>
                <ProgressBar value={72} />
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">Skill Gaps</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-card border border-border bg-background/70 p-4">
              <div>
                <p className="font-medium">Advanced TypeScript Patterns</p>
                <p className="text-sm text-text-secondary">Needed for 8 job matches</p>
              </div>
              <Badge variant="warning">Priority</Badge>
            </div>
            <div className="flex items-center justify-between rounded-card border border-border bg-background/70 p-4">
              <div>
                <p className="font-medium">AWS Cloud Architecture</p>
                <p className="text-sm text-text-secondary">Needed for 5 job matches</p>
              </div>
              <Badge>Recommended</Badge>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">Learning Recommendations</h2>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-text-secondary">Based on your skill gaps and job interests:</p>
            <ul className="mt-3 space-y-2 text-sm text-text-primary">
              <li>• Complete "Advanced TypeScript" course on Udemy</li>
              <li>• Build a full-stack project with Next.js and AWS</li>
              <li>• Practice system design problems on LeetCode</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}