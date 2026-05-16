import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  User,
  Building2,
  Users,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  ScrollText,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const candidateNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/jobs', label: 'Jobs', icon: <Briefcase className="h-5 w-5" /> },
  { to: '/applications', label: 'Applications', icon: <ClipboardList className="h-5 w-5" /> },
  { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const companyNav: NavItem[] = [
  { to: '/company', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/company/jobs', label: 'Job Listings', icon: <Briefcase className="h-5 w-5" /> },
  { to: '/company/jobs/new', label: 'Post Job', icon: <PlusCircle className="h-5 w-5" /> },
  { to: '/company/candidates', label: 'Candidates', icon: <Users className="h-5 w-5" /> },
  { to: '/company/pipeline', label: 'Pipeline', icon: <BarChart3 className="h-5 w-5" /> },
  { to: '/company/profile', label: 'Company Profile', icon: <Building2 className="h-5 w-5" /> },
  { to: '/company/verification', label: 'Verification', icon: <ShieldCheck className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/admin?tab=verifications', label: 'Verification Queue', icon: <ShieldCheck className="h-5 w-5" /> },
  { to: '/admin?tab=audit', label: 'Audit Logs', icon: <ScrollText className="h-5 w-5" /> },
  { to: '/admin?tab=fraud', label: 'Fraud Flags', icon: <ShieldAlert className="h-5 w-5" /> },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps): React.JSX.Element {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const activeRole = user?.role === 'ADMIN' ? 'admin' : user?.role === 'COMPANY' ? 'company' : 'candidate';

  const navItems = activeRole === 'admin' ? adminNav : activeRole === 'company' ? companyNav : candidateNav;

  const isActive = (path: string) => {
    const [pathname, search] = path.split('?');
    if (search) return location.pathname === pathname && location.search === `?${search}`;
    if (path === '/company' && location.pathname === '/company') return true;
    if (path === '/company') return false;
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path === '/admin') return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-surface border-r border-border z-40 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="SkillGap AI Home">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-ai-purple to-ai-cyan shadow-card transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">S</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-text-primary">
              SkillGap <span className="text-ai-gradient">AI</span>
            </span>
          )}
        </Link>
      </div>

      {!collapsed && user && (
        <div className="border-b border-border p-4">
          <div className="rounded-xl bg-background px-3 py-2 text-sm font-medium text-text-secondary">
            {activeRole === 'admin' ? 'Admin workspace' : activeRole === 'company' ? 'Company workspace' : 'Candidate workspace'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive(item.to)
                    ? 'bg-primary-light/70 text-primary'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive(item.to) ? 'text-primary' : ''}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      {onToggleCollapse && (
        <div className="p-4 border-t border-border">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
