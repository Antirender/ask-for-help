/* ============================================================
   Accessibility.tsx — Reduced motion, font size, controls
   ============================================================ */

import { useState, useEffect } from 'react';

export default function AccessibilityControls() {
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('ask4help_fsize') || '100', 10);
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('ask4help_hc') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('ask4help_rm') === 'true'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('ask4help_fsize', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
    localStorage.setItem('ask4help_hc', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.style.setProperty('--dur-fast', '0ms');
      document.documentElement.style.setProperty('--dur-normal', '0ms');
      document.documentElement.style.setProperty('--dur-slow', '0ms');
    } else {
      document.documentElement.style.removeProperty('--dur-fast');
      document.documentElement.style.removeProperty('--dur-normal');
      document.documentElement.style.removeProperty('--dur-slow');
    }
    localStorage.setItem('ask4help_rm', String(reducedMotion));
  }, [reducedMotion]);

  return (
    <div className="a11y-controls card">
      <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
        ♿ Accessibility
      </h3>

      <div className="a11y-row">
        <label htmlFor="font-size-slider">Font Size: {fontSize}%</label>
        <input
          id="font-size-slider"
          type="range"
          min={80}
          max={150}
          step={10}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          style={{ width: '100%', maxWidth: 200 }}
        />
      </div>

      <div className="a11y-row">
        <label htmlFor="hc-toggle">High Contrast</label>
        <button
          id="hc-toggle"
          role="switch"
          aria-checked={highContrast}
          className={`toggle-switch ${highContrast ? 'on' : ''}`}
          onClick={() => setHighContrast(!highContrast)}
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      <div className="a11y-row">
        <label htmlFor="rm-toggle">Reduced Motion</label>
        <button
          id="rm-toggle"
          role="switch"
          aria-checked={reducedMotion}
          className={`toggle-switch ${reducedMotion ? 'on' : ''}`}
          onClick={() => setReducedMotion(!reducedMotion)}
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      <style>{`
        .a11y-controls { max-width: 400px; }
        .a11y-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sp-2) 0;
          border-bottom: 1px solid var(--border-light);
        }
        .a11y-row:last-child { border-bottom: none; }
        .a11y-row label {
          font-size: var(--fs-sm);
          font-weight: 500;
        }
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 28px;
          border-radius: 14px;
          border: 2px solid var(--border);
          background: var(--bg);
          cursor: pointer;
          padding: 0;
          transition: background var(--dur-fast), border-color var(--dur-fast);
        }
        .toggle-switch.on {
          background: var(--accent);
          border-color: var(--accent);
        }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          transition: transform var(--dur-fast);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .toggle-switch.on .toggle-thumb {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
}
