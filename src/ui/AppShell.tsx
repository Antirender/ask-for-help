/* ============================================================
   AppShell.tsx — Top bar, navigation, theme toggle, layout
   ============================================================ */

import { type ReactNode, useState, useEffect, useCallback } from 'react';

interface Props {
  children: ReactNode;
}

const NAV_ITEMS = [
  { hash: '#/', label: 'Home', labelZh: '首页', icon: '🏠' },
  { hash: '#/build', label: 'Build', labelZh: '构建', icon: '✏️' },
  { hash: '#/library', label: 'Library', labelZh: '模板', icon: '📚' },
  { hash: '#/history', label: 'History', labelZh: '历史', icon: '📋' },
  { hash: '#/about', label: 'About', labelZh: '关于', icon: 'ℹ️' },
];

export default function AppShell({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ask4help_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ask4help_theme', theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => {
      setCurrentHash(window.location.hash || '#/');
      setMobileNav(false);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header" role="banner">
        <div className="container flex items-center justify-between" style={{ minHeight: 56 }}>
          <a href="#/" className="app-logo" aria-label="Ask for help — Home">
            💬 <span className="logo-text">Ask for help</span>
          </a>

          <nav className={`app-nav ${mobileNav ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.hash}
                href={item.hash}
                className={`nav-link ${currentHash === item.hash ? 'active' : ''}`}
                aria-current={currentHash === item.hash ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="btn-icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNav}
            >
              {mobileNav ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main" role="main">
        {children}
      </main>

      <footer className="app-footer" role="contentinfo">
        <div className="container text-center text-sm text-muted" style={{ padding: '24px 16px' }}>
          Ask for help — No login · No server · Everything stays on your device.
        </div>
      </footer>

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .app-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-light);
          box-shadow: var(--elev-1);
          backdrop-filter: blur(8px);
        }
        .app-logo {
          text-decoration: none;
          font-size: var(--fs-lg);
          font-weight: 700;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .app-nav {
          display: flex;
          gap: 4px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          text-decoration: none;
          color: var(--text-muted);
          font-size: var(--fs-sm);
          font-weight: 500;
          transition: background var(--dur-fast), color var(--dur-fast);
          min-height: var(--min-touch);
        }
        .nav-link:hover {
          background: color-mix(in srgb, var(--accent) 8%, transparent);
          color: var(--text);
        }
        .nav-link.active {
          background: color-mix(in srgb, var(--accent) 14%, transparent);
          color: var(--accent);
          font-weight: 600;
        }
        .nav-icon { font-size: 1rem; }
        .app-main {
          flex: 1;
          padding: var(--sp-6) 0;
        }
        .app-footer {
          border-top: 1px solid var(--border-light);
        }
        .mobile-menu-btn { display: none; }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: inline-flex; }
          .app-nav {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 56px;
            left: 0;
            right: 0;
            background: var(--bg-elevated);
            border-bottom: 1px solid var(--border-light);
            padding: var(--sp-2);
            box-shadow: var(--elev-2);
          }
          .app-nav.open { display: flex; }
          .logo-text { display: none; }
        }
      `}</style>
    </div>
  );
}
