import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, Building2, Code2, Tag, TrendingUp,
  LogOut, User, Shield, Settings, ChevronLeft, ChevronRight,
  Menu, X
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Building2, label: 'Companies', href: '/companies' },
  { icon: Code2, label: 'Problems', href: '/problems' },
  { icon: Tag, label: 'Topics', href: '/topics' },
  { icon: TrendingUp, label: 'Progress', href: '/dashboard' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsed state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('cr_sidebar_collapsed') === 'true';
  });

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cr_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (href) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-40 p-3 bg-accent text-white rounded-2xl shadow-xl hover:bg-accent-hover transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center gap-2"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative w-64 max-w-[80vw] bg-bg-secondary border-r border-border h-full flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center font-black text-white text-sm">
                  CR
                </div>
                <span className="font-bold text-white text-sm">CodeRank</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-text-muted hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-accent/10 text-white border border-accent/20'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2 ${
                    location.pathname === '/admin'
                      ? 'bg-accent/10 text-white border border-accent/20'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  Admin Panel
                </Link>
              )}
            </nav>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-text-muted text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar with Collapse/Expand */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-bg-secondary/50 shrink-0 sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-56'
        }`}
      >
        {/* Collapse Toggle Button */}
        <div className="flex items-center justify-end p-2 border-b border-border/50">
          <button
            onClick={toggleCollapse}
            className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto" aria-label="Navigation">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-accent/10 text-white border border-accent/20'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                aria-current={active ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-white shadow-xl border border-border group-hover:block whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin link */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-2 ${
                location.pathname === '/admin'
                  ? 'bg-accent/10 text-white border border-accent/20'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              aria-current={location.pathname === '/admin' ? 'page' : undefined}
              title={isCollapsed ? 'Admin Panel' : undefined}
            >
              <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
              {!isCollapsed && <span className="truncate">Admin Panel</span>}

              {isCollapsed && (
                <span className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-white shadow-xl border border-border group-hover:block whitespace-nowrap">
                  Admin Panel
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-border p-3">
          {!isCollapsed ? (
            <>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl hover:bg-white/5 transition-colors group"
                title="Account Settings"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 group-hover:border-accent">
                  <User className="w-4 h-4 text-accent" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate group-hover:text-accent transition-colors">
                    {user?.name}
                  </p>
                  <p className="text-text-muted text-xs truncate">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-text-secondary
                           hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/settings"
                className="group relative w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center hover:border-accent transition-colors"
                title="Account Settings"
              >
                <User className="w-4 h-4 text-accent" />
                <span className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-white shadow-xl border border-border group-hover:block whitespace-nowrap">
                  Settings ({user?.name})
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="group relative p-2.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-bg-elevated px-2.5 py-1 text-xs font-semibold text-white shadow-xl border border-border group-hover:block whitespace-nowrap">
                  Log out
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
