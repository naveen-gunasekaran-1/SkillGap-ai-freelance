import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@skillgap/ui';
import { hasAccessToken, revokeRefreshToken } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const navLinks = [
  { to: '/jobs', label: 'Jobs' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/profile', label: 'Profile' },
];

/**
 * Main navigation bar with mobile hamburger menu, active route highlighting,
 * and scroll-aware shadow.
 */
export function Navbar(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const authed = hasAccessToken();

  const handleSignOut = () => {
    void revokeRefreshToken().finally(() => {
      logout();
      navigate('/');
    });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-200 ${
          scrolled
            ? 'border-border/80 bg-white/90 shadow-card backdrop-blur-xl'
            : 'border-border/40 bg-white/70 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="SkillGap AI Home">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-ai-purple to-ai-cyan shadow-card transition-transform duration-200 group-hover:scale-105">
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-text-primary">
              SkillGap <span className="text-ai-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive(link.to)
                    ? 'text-primary bg-primary-light/60'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden gap-2.5 md:flex">
            {authed ? (
              <>
                <span className="mr-1 max-w-[160px] truncate text-sm text-text-secondary" title={user?.email}>
                  {user?.name ?? 'Account'}
                </span>
                <Button variant="ghost" size="sm" type="button" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="ai-gradient" size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-background md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
              <span
                className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-200 ${
                  menuOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-200 ${
                  menuOpen ? 'opacity-0 scale-0' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-200 ${
                  menuOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-out menu */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-72 bg-white shadow-elevated transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col px-6 pt-20 pb-8">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-150 ${
                  isActive(link.to)
                    ? 'bg-primary-light/60 text-primary'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
                style={{ animationDelay: `${i * 50 + 100}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
            {authed ? (
              <Button variant="secondary" className="w-full" type="button" onClick={handleSignOut}>
                Sign out
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" className="w-full">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="ai-gradient" className="w-full">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}