/* ============================================================
   Home.tsx — Landing page: what this tool does, quick start, privacy
   ============================================================ */

export default function Home() {
  return (
    <div className="container container-narrow page-enter">
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: 'var(--sp-10) 0 var(--sp-6)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 'var(--sp-4)' }}>💬</div>
        <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, lineHeight: 'var(--lh-tight)', marginBottom: 'var(--sp-3)' }}>
          Ask for help
        </h1>
        <p className="text-muted prose" style={{ margin: '0 auto', maxWidth: '50ch', fontSize: 'var(--fs-md)', lineHeight: 'var(--lh-loose)' }}>
          Turn "I don't know how to ask" into a clear, professional request — in seconds.
          No login. No server. Everything stays on your device.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <a href="#/build" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            ✏️ Start building
          </a>
          <a href="#/library" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            📚 Browse templates
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-6">
        <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          How it works
        </h2>
        <div className="steps-grid">
          <StepCard number={1} icon="📝" title="Fill in the wizard" desc="Answer a few simple questions — who, what, why, where you're stuck. Skip anything you're unsure about." />
          <StepCard number={2} icon="🤖" title="Get smart suggestions" desc="Our built-in heuristics + Markov engine scores your request and suggests improvements — no AI API needed." />
          <StepCard number={3} icon="📋" title="Copy & send" desc="Get your request in 3 formats (ultra-short, short, standard), tailored for Slack, email, or forums. One click to copy." />
        </div>
      </section>

      {/* Features */}
      <section className="mt-6">
        <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          Features
        </h2>
        <div className="feature-grid">
          <FeatureCard icon="🔒" title="100% Private" desc="No login, no server, no tracking. All data stays in your browser." />
          <FeatureCard icon="🌐" title="EN / 中文" desc="Full bilingual support — English, Chinese, or mixed mode." />
          <FeatureCard icon="📊" title="Explainable Score" desc="5-dimension quality score with actionable tips to improve your ask." />
          <FeatureCard icon="♿" title="Accessible" desc="Keyboard navigation, focus rings, high contrast, reduced motion support." />
          <FeatureCard icon="📥" title="Evidence Export" desc="Save history locally. Export as JSON or CSV for assignment evidence." />
          <FeatureCard icon="⚡" title="Works Offline" desc="After first load, the entire app works without internet." />
        </div>
      </section>

      {/* Privacy banner */}
      <section className="card mt-6" style={{ textAlign: 'center', padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>
          🔒 Privacy Promise
        </h3>
        <p className="text-muted text-sm prose" style={{ margin: '0 auto' }}>
          Ask for help has <strong>no login, no server storage, no analytics, and no tracking</strong>.
          <br />
          Everything you type stays on your device unless you choose to export it.
        </p>
      </section>

      <style>{`
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--sp-4);
        }
        .step-card {
          text-align: center;
          padding: var(--sp-6);
        }
        .step-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--accent-text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: var(--fs-sm);
          margin-bottom: var(--sp-3);
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--sp-4);
        }
        .feature-card {
          padding: var(--sp-5);
        }
        .feature-icon {
          font-size: 1.8rem;
          margin-bottom: var(--sp-2);
        }
      `}</style>
    </div>
  );
}

function StepCard({ number, icon, title, desc }: { number: number; icon: string; title: string; desc: string }) {
  return (
    <div className="card step-card">
      <div className="step-num">{number}</div>
      <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-2)' }}>{icon}</div>
      <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, marginBottom: 'var(--sp-1)' }}>{title}</h3>
      <p className="text-sm text-muted">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)' }}>{title}</h3>
      <p className="text-xs text-muted">{desc}</p>
    </div>
  );
}
