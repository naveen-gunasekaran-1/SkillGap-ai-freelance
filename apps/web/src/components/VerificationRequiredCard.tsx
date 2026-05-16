import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button, Card } from '@skillgap/ui';

export function VerificationRequiredCard({
  title = 'Company verification required',
  description = 'Complete company verification before accessing candidate data, hiring analytics, or protected recruiter workflows.',
}: {
  title?: string;
  description?: string;
}): React.JSX.Element {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-card bg-primary-light text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">{description}</p>
          </div>
        </div>
        <Link to="/company/verification">
          <Button variant="ai-gradient">Complete verification</Button>
        </Link>
      </div>
    </Card>
  );
}
