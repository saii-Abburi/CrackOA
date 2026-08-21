import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Menu, X, ChevronRight, User, LogOut, LayoutDashboard, ChevronDown, Upload, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navLinks = [
  { label: 'Problems', href: '/problems' },
  { label: 'Companies', href: '/companies' },
  { label: 'Topics', href: '/topics' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'How It Works', href: '/#how-it-works' },
];

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-bg-card
                   hover:border-border-subtle hover:bg-bg-elevated transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-accent/30"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`User menu for ${firstName}`}
      >
        <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
          <User className="w-3 h-3 text-accent" aria-hidden="true" />
        </div>
        <span className="text-white text-sm font-medium max-w-[100px] truncate">{firstName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-bg-card border border-border rounded-xl shadow-xl py-1.5 z-50"
            role="menu"
            aria-label="User menu"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border mb-1">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-text-muted text-xs truncate mt-0.5">{user?.email}</p>
            </div>

            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              Dashboard
            </Link>

            <Link
              to="/my-blogs"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <BookOpen className="w-4 h-4 text-accent" aria-hidden="true" />
              My Editorials
            </Link>

            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              <User className="w-4 h-4" aria-hidden="true" />
              Settings
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:text-accent-hover hover:bg-accent/10 transition-colors font-semibold"
                role="menuitem"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                Admin Portal
              </Link>
            )}

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10
                         transition-colors text-left focus:outline-none"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleAnchor = (e, href) => {
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/85 backdrop-blur-md shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="container-xl">
          <nav className="flex items-center justify-between h-16" aria-label="Main navigation">
            {/* Logo */}
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center gap-2 group focus:outline-none"
              aria-label="CodeRank home"
            >
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:bg-accent-hover transition-colors duration-200">
                <Code2 className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Code<span className="text-accent">Rank</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleAnchor(e, link.href)}
                    className="px-4 py-2 text-text-secondary text-sm font-medium rounded-lg
                               hover:text-white hover:bg-white/5 transition-all duration-200
                               focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop right — conditional on auth state */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-text-secondary text-sm font-medium hover:text-white
                               transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm py-2 px-5"
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pt-16 bg-bg-primary/98 backdrop-blur-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="container-xl py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  className="flex items-center justify-between px-4 py-3 text-text-secondary font-medium
                             rounded-xl hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" aria-hidden="true" />
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    {/* User info strip */}
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-accent" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-text-muted text-xs truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/dashboard" className="btn-secondary w-full justify-center">
                      <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                      Dashboard
                    </Link>
                    <Link to="/settings" className="btn-secondary w-full justify-center">
                      <User className="w-4 h-4" aria-hidden="true" />
                      Settings
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="btn-primary w-full justify-center">
                        <Upload className="w-4 h-4" aria-hidden="true" />
                        Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm text-red-400
                                 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200 font-semibold"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary w-full justify-center">
                      Login
                    </Link>
                    <Link to="/register" className="btn-primary w-full justify-center">
                      Get Started <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
