import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { Avatar, Button } from '@skillgap/ui';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuthStore } from '../stores/authStore';
import { hasAccessToken, revokeRefreshToken } from '../lib/api';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Main application shell with:
 * - Desktop: collapsible sidebar + topbar
 * - Mobile: topbar + bottom tab navigation
 * - Role-aware navigation for candidate and company users
 */
export function AppShell({ children }: AppShellProps): React.JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const authed = hasAccessToken();
  const activeRole =
    user?.role === 'ADMIN' ? 'admin' : user?.role === 'COMPANY' ? 'company' : 'candidate';

  const handleSignOut = () => {
    void revokeRefreshToken().finally(() => {
      logout();
      navigate('/');
    });
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const displayName = user?.name ?? 'User';
  const displayRole =
    activeRole === 'admin' ? 'Admin' : activeRole === 'company' ? 'Company' : 'Candidate';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        {/* Desktop + Mobile Topbar */}
        <header
          className={`sticky top-0 z-30 transition-all duration-200 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-xl shadow-card border-b border-border/60'
              : 'bg-white/80 backdrop-blur-md border-b border-border/40'
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile: Logo + hamburger */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
                aria-label="Open menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-ai-purple to-ai-cyan shadow-card flex items-center justify-center">
                  <span className="text-xs font-bold text-white">S</span>
                </div>
                <span className="text-base font-semibold text-text-primary">
                  SkillGap <span className="text-ai-gradient">AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop: Search */}
            <div className="hidden lg:flex items-center flex-1">
              <div className="relative max-w-md">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search jobs, candidates..."
                  className="w-80 h-10 pl-10 pr-4 rounded-xl border border-border bg-background/50 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:inline-flex items-center rounded bg-border/50 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>

            {/* Right: User menu */}
            <div className="flex items-center gap-2">
              {authed && (
                <div className="flex items-center gap-3">
                  <Avatar name={displayName} src={user?.avatar} size="sm" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-text-primary">{displayName}</p>
                    <p className="text-xs text-text-secondary">{displayRole}</p>
                  </div>
                </div>
              )}
              {!authed && (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register" className="hidden sm:block">
                    <Button variant="ai-gradient" size="sm">
                      Get started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      {authed && <MobileBottomNav />}

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-80 bg-white shadow-elevated animate-slide-in-left">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-ai-purple to-ai-cyan shadow-card flex items-center justify-center">
                    <span className="text-sm font-bold text-white">S</span>
                  </div>
                  <span className="text-lg font-semibold text-text-primary">
                    SkillGap <span className="text-ai-gradient">AI</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {authed && (
                <div className="border-b border-border p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {displayRole} workspace
                  </p>
                </div>
              )}

              {/* User info */}
              {authed && (
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Avatar name={displayName} src={user?.avatar} size="md" />
                    <div>
                      <p className="font-medium text-text-primary">{displayName}</p>
                      <p className="text-sm text-text-secondary">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto p-4">
                <MobileNavLinks activeRole={activeRole} onClose={() => setMobileMenuOpen(false)} />
              </nav>

              {/* Footer actions */}
              <div className="p-4 border-t border-border">
                {authed ? (
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-error/10 py-3 text-sm font-medium text-error hover:bg-error/20 transition-colors"
                  >
                    Sign out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ai-gradient" className="w-full">
                        Get started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileNavLinks({
  activeRole,
  onClose,
}: {
  activeRole: 'candidate' | 'company' | 'admin';
  onClose: () => void;
}) {
  const location = useLocation();

  const candidateLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/jobs', label: 'Browse Jobs', icon: <Briefcase className="h-5 w-5" /> },
    { to: '/applications', label: 'My Applications', icon: <ClipboardList className="h-5 w-5" /> },
    { to: '/profile', label: 'My Profile', icon: <User className="h-5 w-5" /> },
  ];

  const companyLinks = [
    { to: '/company', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/company/jobs', label: 'Job Listings', icon: <Briefcase className="h-5 w-5" /> },
    { to: '/company/jobs/new', label: 'Post New Job', icon: <PlusCircle className="h-5 w-5" /> },
    { to: '/company/candidates', label: 'Candidates', icon: <Users className="h-5 w-5" /> },
    { to: '/company/pipeline', label: 'Hiring Pipeline', icon: <BarChart3 className="h-5 w-5" /> },
    { to: '/company/profile', label: 'Company Profile', icon: <Building2 className="h-5 w-5" /> },
    {
      to: '/company/verification',
      label: 'Verification',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      to: '/admin?tab=verifications',
      label: 'Verification Queue',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    { to: '/admin?tab=audit', label: 'Audit Logs', icon: <ClipboardList className="h-5 w-5" /> },
    { to: '/admin?tab=fraud', label: 'Fraud Flags', icon: <Users className="h-5 w-5" /> },
  ];

  const links =
    activeRole === 'admin' ? adminLinks : activeRole === 'company' ? companyLinks : candidateLinks;

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
    <ul className="space-y-1">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              isActive(link.to)
                ? 'bg-primary-light/70 text-primary'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
