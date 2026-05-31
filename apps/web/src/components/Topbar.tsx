import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { Avatar, Button } from '@skillgap/ui';
import { useAuthStore } from '../stores/authStore';
import { hasAccessToken, revokeRefreshToken } from '../lib/api';

interface TopbarProps {
  sidebarCollapsed?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Topbar({
  sidebarCollapsed = false,
  onMobileMenuToggle,
}: TopbarProps): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');
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

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = search.trim();
    if (!q) return;
    if (activeRole === 'company') {
      navigate(`/company/candidates?search=${encodeURIComponent(q)}`);
      return;
    }
    navigate(`/jobs?search=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) setShowUserMenu(false);
      if (!target.closest('[data-notifications]')) setShowNotifications(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const displayName = user?.name ?? 'User';
  const displayRole =
    activeRole === 'admin' ? 'Admin' : activeRole === 'company' ? 'Company' : 'Candidate';

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-card border-b border-border/60'
          : 'bg-white/80 backdrop-blur-md border-b border-border/40'
      }`}
      style={{ marginLeft: sidebarCollapsed ? '72px' : '256px' }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - mobile menu + search */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar */}
          <form className="hidden sm:flex items-center" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search jobs, candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 lg:w-80 h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 rounded bg-border/50 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </form>
        </div>

        {/* Right side - notifications + user menu */}
        <div className="flex items-center gap-2">
          {authed && (
            <>
              {/* Notifications */}
              <div className="relative" data-notifications>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center justify-center h-10 w-10 rounded-xl text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error animate-pulse" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-white shadow-elevated animate-scale-in origin-top-right">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h3 className="font-semibold text-text-primary">Notifications</h3>
                      <button
                        type="button"
                        className="text-xs text-primary hover:text-primary-dark font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <NotificationItem
                        title="New match found!"
                        description="Your profile matches a Senior React Developer role at TechCorp"
                        time="5 min ago"
                        unread
                      />
                      <NotificationItem
                        title="Application viewed"
                        description="Acme Inc. viewed your application for Frontend Engineer"
                        time="1 hour ago"
                        unread
                      />
                      <NotificationItem
                        title="Interview scheduled"
                        description="Your interview with StartupXYZ is confirmed for tomorrow"
                        time="3 hours ago"
                      />
                    </div>
                    <div className="p-3 border-t border-border">
                      <Link
                        to="/notifications"
                        className="block text-center text-sm font-medium text-primary hover:text-primary-dark"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-background transition-colors"
                >
                  <Avatar name={displayName} src={user?.avatar} size="sm" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-text-primary truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <p className="text-xs text-text-secondary">{displayRole}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-white shadow-elevated animate-scale-in origin-top-right">
                    <div className="p-3 border-b border-border">
                      <p className="font-medium text-text-primary truncate">{displayName}</p>
                      <p className="text-sm text-text-secondary truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={
                          activeRole === 'admin'
                            ? '/admin'
                            : activeRole === 'company'
                              ? '/company/profile'
                              : '/profile'
                        }
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Your Profile
                      </Link>
                      <Link
                        to={
                          activeRole === 'admin'
                            ? '/admin'
                            : activeRole === 'company'
                              ? '/company/profile'
                              : '/profile'
                        }
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                    <div className="p-2 border-t border-border">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!authed && (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="ai-gradient" size="sm">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-4">
        <form className="relative" onSubmit={handleSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition-all"
          />
        </form>
      </div>
    </header>
  );
}

function NotificationItem({
  title,
  description,
  time,
  unread = false,
}: {
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <button
      className={`w-full text-left p-4 hover:bg-background transition-colors ${unread ? 'bg-primary-light/30' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 h-2 w-2 mt-1.5 rounded-full ${unread ? 'bg-primary' : 'bg-transparent'}`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{title}</p>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{description}</p>
          <p className="text-xs text-text-secondary/70 mt-1">{time}</p>
        </div>
      </div>
    </button>
  );
}
