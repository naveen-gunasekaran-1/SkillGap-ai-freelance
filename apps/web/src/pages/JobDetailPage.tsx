import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Card, ProgressBar } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

export function JobDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link to="/jobs" className="text-primary hover:underline">
          ← Back to jobs
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold text-text-primary">Senior Frontend Engineer</h1>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-lg font-medium text-primary">TechCorp</span>
            <Badge>San Francisco, CA</Badge>
            <Badge>$150k - $200k</Badge>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <Card className="col-span-2 p-6">
            <h2 className="text-lg font-semibold text-text-primary">About the role</h2>
            <p className="mt-3 text-text-secondary">
              We're looking for an experienced Frontend Engineer to join our growing team. You'll work on
              cutting-edge web applications using React and TypeScript, collaborating with designers and
              backend engineers to deliver exceptional user experiences.
            </p>

            <h3 className="mt-6 font-semibold text-text-primary">Requirements</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>• 5+ years of experience with React and modern JavaScript</li>
              <li>• Strong TypeScript knowledge</li>
              <li>• Experience with state management (Zustand, Redux)</li>
              <li>• Proficiency with CSS and responsive design</li>
              <li>• Excellent communication skills</li>
            </ul>

            <h3 className="mt-6 font-semibold text-text-primary">Responsibilities</h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>• Build and maintain frontend applications</li>
              <li>• Collaborate with product and design teams</li>
              <li>• Optimize performance and user experience</li>
              <li>• Mentor junior developers</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-text-primary">Your match</h3>
            <div className="mt-4 text-center text-3xl font-bold text-primary">88%</div>
            <p className="mt-2 text-center text-sm text-text-secondary">You have 88% of required skills</p>

            <div className="mt-6 space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>React</span>
                  <span className="text-text-secondary">95%</span>
                </div>
                <ProgressBar value={95} />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>TypeScript</span>
                  <span className="text-text-secondary">85%</span>
                </div>
                <ProgressBar value={85} />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>CSS</span>
                  <span className="text-text-secondary">78%</span>
                </div>
                <ProgressBar value={78} />
              </div>
            </div>

            <Button className="mt-6 w-full">Apply now</Button>
            <Button variant="secondary" className="mt-2 w-full">
              Save job
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}