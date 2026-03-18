import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Timer', icon: '⏱' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Layout() {
  return (
    /* Desktop: center a phone-sized frame; Mobile: fill screen naturally */
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-0 md:p-6">
      <div className="relative w-full md:w-[420px] md:h-[780px] md:rounded-3xl md:border md:border-[var(--color-border)] md:shadow-2xl md:overflow-hidden flex flex-col bg-[var(--color-bg)] min-h-screen md:min-h-0">

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md shrink-0">
          <div className="px-4 h-14 flex items-center">
            <NavLink to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🍅</span>
              <span className="text-lg font-bold tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                FocusTimer
              </span>
            </NavLink>
          </div>
        </header>

        {/* Main content — scrollable area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-20">
          <Outlet />
        </main>

        {/* Bottom tab bar — centered pill style for 2 tabs */}
        <nav className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
          <div className="flex justify-center gap-2 py-2 px-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                  }`
                }
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
