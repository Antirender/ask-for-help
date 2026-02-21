/* ============================================================
   AppShell.tsx — Top bar, navigation, theme / lang toggle, layout
   ============================================================ */

import { type ReactNode, useState, useEffect, useCallback } from 'react';
import {
  IconHome,
  IconEdit,
  IconLibrary,
  IconHistory,
  IconInfo,
  IconSun,
  IconMoon,
  IconGlobe,
  IconMenu,
  IconX,
  IconMessageSquare,
} from './Icons';

interface Props {
  children: ReactNode;
}

type UILang = 'en' | 'zh' | 'fr';

const NAV_ITEMS = [
  { hash: '#/', label: 'Home', labelZh: '首页', labelFr: 'Accueil', icon: IconHome },
  { hash: '#/build', label: 'Build', labelZh: '构建', labelFr: 'Créer', icon: IconEdit },
  { hash: '#/library', label: 'Library', labelZh: '模板库', labelFr: 'Modèles', icon: IconLibrary },
  { hash: '#/history', label: 'History', labelZh: '历史', labelFr: 'Historique', icon: IconHistory },
  { hash: '#/about', label: 'About', labelZh: '关于', labelFr: 'À propos', icon: IconInfo },
];

const LANG_LABELS: Record<UILang, string> = { en: 'EN', zh: '中文', fr: 'FR' };
const LANG_OPTIONS: UILang[] = ['en', 'zh', 'fr'];

/* ---------- helper: read / write global lang ---------- */
export function getGlobalLang(): UILang {
  const v = localStorage.getItem('ask4help_lang') as UILang | null;
  if (v === 'en' || v === 'zh' || v === 'fr') return v;
  return 'en';
}
export function setGlobalLang(lang: UILang) {
  localStorage.setItem('ask4help_lang', lang);
  window.dispatchEvent(new CustomEvent('ask4help_lang_change', { detail: lang }));
}

function navLabel(item: (typeof NAV_ITEMS)[number], lang: UILang) {
  if (lang === 'zh') return item.labelZh;
  if (lang === 'fr') return item.labelFr;
  return item.label;
}

export default function AppShell({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ask4help_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [lang, setLangState] = useState<UILang>(getGlobalLang);
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [mobileNav, setMobileNav] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ask4help_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
    setGlobalLang(lang);
  }, [lang]);

  useEffect(() => {
    const onHash = () => {
      setCurrentHash(window.location.hash || '#/');
      setMobileNav(false);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const handler = () => setLangOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [langOpen]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header" role="banner">
        <div className="container flex items-center justify-between" style={{ minHeight: 56 }}>
          <a href="#/" className="app-logo" aria-label="Ask for help — Home">
            {IconMessageSquare({ size: 22 })}
            <span className="logo-text">Ask for help</span>
          </a>

          <nav className={`app-nav ${mobileNav ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.hash}
                href={item.hash}
                className={`nav-link ${currentHash === item.hash ? 'active' : ''}`}
                aria-current={currentHash === item.hash ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon({ size: 16 })}</span>
                <span className="nav-label">{navLabel(item, lang)}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="lang-dropdown" style={{ position: 'relative' }}>
              <button
                className="btn-icon"
                onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
                aria-label="Change language"
                title="Change language"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                {IconGlobe({ size: 18 })}
              </button>
              {langOpen && (
                <div className="lang-menu" role="listbox" aria-label="Language">
                  {LANG_OPTIONS.map((l) => (
                    <button
                      key={l}
                      role="option"
                      aria-selected={lang === l}
                      className={`lang-option ${lang === l ? 'selected' : ''}`}
                      onClick={() => { setLangState(l); setLangOpen(false); }}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              className="btn-icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? IconMoon({ size: 18 }) : IconSun({ size: 18 })}
            </button>

            {/* Mobile hamburger */}
            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNav}
            >
              {mobileNav ? IconX({ size: 20 }) : IconMenu({ size: 20 })}
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
          background: var(--header-bg);
          border-bottom: 1px solid var(--header-border);
          box-shadow: var(--elev-1);
        }
        .app-logo {
          text-decoration: none;
          font-size: var(--fs-lg);
          font-weight: 700;
          color: var(--header-text);
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
          color: var(--header-text-muted);
          font-size: var(--fs-sm);
          font-weight: 500;
          transition: background var(--dur-fast), color var(--dur-fast);
          min-height: var(--min-touch);
        }
        .nav-link:hover {
          background: var(--header-hover);
          color: var(--header-text);
        }
        .nav-link.active {
          background: var(--header-active-bg);
          color: var(--header-active-text);
          font-weight: 600;
        }
        .nav-icon { display: flex; align-items: center; }
        .app-header .btn-icon {
          color: var(--header-text);
        }
        .app-main {
          flex: 1;
          padding: var(--sp-6) 0;
        }
        .app-footer {
          border-top: 1px solid var(--border-light);
        }
        .mobile-menu-btn { display: none; }

        /* Language dropdown */
        .lang-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          box-shadow: var(--elev-2);
          padding: var(--sp-1);
          min-width: 80px;
          z-index: 200;
        }
        .lang-option {
          display: block;
          width: 100%;
          padding: var(--sp-2) var(--sp-3);
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: var(--fs-sm);
          font-weight: 500;
          color: var(--text);
          border-radius: var(--radius-xs);
          transition: background var(--dur-fast);
        }
        .lang-option:hover {
          background: color-mix(in srgb, var(--accent) 10%, transparent);
        }
        .lang-option.selected {
          background: color-mix(in srgb, var(--accent) 14%, transparent);
          color: var(--accent);
          font-weight: 600;
        }

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
          .nav-link {
            padding: 12px 16px;
            border-radius: var(--radius-sm);
          }
        }
      `}</style>
    </div>
  );
}
