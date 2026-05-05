import { Link } from 'react-router-dom';
import { Button } from '@skillgap/ui';

export function Navbar(): React.JSX.Element {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-ai-cyan shadow-card" />
          <span className="text-lg font-semibold tracking-tight text-text-primary">SkillGap AI</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/jobs" className="text-sm text-text-secondary hover:text-text-primary">
            Jobs
          </Link>
          <Link to="/dashboard" className="text-sm text-text-secondary hover:text-text-primary">
            Dashboard
          </Link>
          <Link to="/applications" className="text-sm text-text-secondary hover:text-text-primary">
            Applications
          </Link>
          <Link to="/profile" className="text-sm text-text-secondary hover:text-text-primary">
            Profile
          </Link>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="ai-gradient">Get started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}