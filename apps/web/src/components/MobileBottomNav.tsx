import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  User,
  Building2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const candidateNav: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/jobs', label: 'Jobs', icon: <Briefcase className="h-5 w-5" /> },
  { to: '/applications', label: 'Apps', icon: <ClipboardList className="h-5 w-5" /> },
  { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const companyNav: NavItem[] = [
  { to: '/company', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/company/jobs', label: 'Jobs', icon: <Briefcase className="h-5 w-5" /> },
  { to: '/company/candidates', label: 'Candidates', icon: <Users className="h-5 w-5" /> },
  { to: '/company/verification', label: 'Verify', icon: <Building2 className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/admin?tab=verifications', label: 'Verify', icon: <ShieldCheck className="h-5 w-5" /> },
  { to: '/admin?tab=audit', label: 'Audit', icon: <ClipboardList className="h-5 w-5" /> },
  { to: '/admin?tab=fraud', label: 'Fraud', icon: <Users className="h-5 w-5" /> },
];

export function MobileBottomNav(): React.JSX.Element {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const activeRole =
    user?.role === 'ADMIN' ? 'admin' : user?.role === 'COMPANY' ? 'company' : 'candidate';

  const navItems =
    activeRole === 'admin' ? adminNav : activeRole === 'company' ? companyNav : candidateNav;

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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive(item.to) ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            <span className={isActive(item.to) ? 'text-primary' : ''}>{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive(item.to) && (
              <span className="absolute bottom-1 h-1 w-6 rounded-full bg-primary" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
