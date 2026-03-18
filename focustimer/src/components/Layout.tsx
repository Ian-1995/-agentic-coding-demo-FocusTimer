import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Timer' },
    ...(isAuthenticated
      ? [
          { to: '/tasks', label: 'Tasks' },
          { to: '/stats', label: 'Stats' },
        ]
      : []),
    { to: '/settings', label: 'Settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            FocusTimer
          </h1>
          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {user?.display_name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs px-2 py-1 rounded bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-text-muted)]">
        FocusTimer v2.0 — Phase 2
      </footer>
    </div>
  );
}
