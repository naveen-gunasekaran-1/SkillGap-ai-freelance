import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  User,
  Settings,
  Building2,
  Users,
  FileText,
  PlusCircle,
  BarChart3,
} from 'lucide-react';
import { useRoleStore, type AppRole } from '../stores/roleStore';
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
  { to: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const companyNav: NavItem[] = [
  { to: '/company', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/company/jobs', label: 'Job Listings', icon: <Briefcase className="h-5 w-5" /> },
  { to: '/company/jobs/new', label: 'Post Job', icon: <PlusCircle className="h-5 w-5" /> },
  { to: '/company/candidates', label: 'Candidates', icon: <Users className="h-5 w-5" /> },
  { to: '/company/pipeline', label: 'Pipeline', icon: <BarChart3 className="h-5 w-5" /> },
  { to: '/company/profile', label: 'Company Profile', icon: <Building2 className="h-5 w-5" /> },
  { to: '/company/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps): React.JSX.Element {
  const location = useLocation();
  const activeRole = useRoleStore((s) => s.activeRole);
  const setRole = useRoleStore((s) => s.setRole);
  const user = useAuthStore((s) => s.user);

  const navItems = activeRole === 'company' ? companyNav : candidateNav;
  const canSwitchRole = user?.role === 'COMPANY' || user?.role === 'ADMIN';

  const isActive = (path: string) => {
    if (path === '/company' && location.pathname === '/company') return true;
    if (path === '/company') return false;
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

      {/* Role Switcher */}
      {canSwitchRole && (
        <div className={`p-4 border-b border-border ${collapsed ? 'px-2' : ''}`}>
          {collapsed ? (
            <button
              onClick={() => setRole(activeRole === 'candidate' ? 'company' : 'candidate')}
              className="w-full flex items-center justify-center h-10 rounded-lg bg-background hover:bg-primary-light/50 transition-colors"
              title={`Switch to ${activeRole === 'candidate' ? 'Company' : 'Candidate'}`}
            >
              {activeRole === 'candidate' ? (
                <User className="h-5 w-5 text-primary" />
              ) : (
                <Building2 className="h-5 w-5 text-ai-purple" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 p-1 bg-background rounded-xl">
              <RoleSwitchButton
                role="candidate"
                active={activeRole === 'candidate'}
                onClick={() => setRole('candidate')}
                icon={<User className="h-4 w-4" />}
                label="Candidate"
              />
              <RoleSwitchButton
                role="company"
                active={activeRole === 'company'}
                onClick={() => setRole('company')}
                icon={<Building2 className="h-4 w-4" />}
                label="Company"
              />
            </div>
          )}
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

function RoleSwitchButton({
  role,
  active,
  onClick,
  icon,
  label,
}: {
  role: AppRole;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all duration-150 ${
        active
          ? role === 'candidate'
            ? 'bg-primary text-white shadow-card'
            : 'bg-ai-purple text-white shadow-card'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
