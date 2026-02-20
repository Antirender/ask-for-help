/* ============================================================
   App.tsx — Hash router + AppShell
   ============================================================ */

import { useState, useEffect, lazy, Suspense } from 'react';
import AppShell from './ui/AppShell';

const Home = lazy(() => import('./routes/Home'));
const Builder = lazy(() => import('./routes/Builder'));
const Library = lazy(() => import('./routes/Library'));
const History = lazy(() => import('./routes/History'));
const About = lazy(() => import('./routes/About'));

function getRoute(): string {
  const hash = window.location.hash || '#/';
  return hash.replace(/^#/, '') || '/';
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="container text-center" style={{ padding: '64px 16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 16 }}>⏳</div>
            <p className="text-muted">Loading…</p>
          </div>
        }
      >
        {route === '/' && <Home />}
        {route === '/build' && <Builder />}
        {route === '/library' && <Library />}
        {route === '/history' && <History />}
        {route === '/about' && <About />}
        {!['/','/build','/library','/history','/about'].includes(route) && (
          <div className="container text-center" style={{ padding: '64px 16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🫣</div>
            <h1 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>Page not found</h1>
            <p className="text-muted mt-2">
              <a href="#/">Go home</a>
            </p>
          </div>
        )}
      </Suspense>
    </AppShell>
  );
}
