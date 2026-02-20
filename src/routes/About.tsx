/* ============================================================
   About.tsx — Method, limitations, privacy, accessibility
   ============================================================ */

import AccessibilityControls from '../ui/Accessibility';

export default function About() {
  return (
    <div className="container container-narrow page-enter">
      <h1 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 'var(--sp-6)' }}>
        ℹ️ About Ask for help
      </h1>

      {/* What */}
      <Section title="What is this?">
        <p>
          <strong>Ask for help</strong> is a zero-account, pure-frontend tool that turns
          "I need help but I don't know how to ask" into a clear, professional help request.
        </p>
        <p>
          Inspired by <a href="https://goblin.tools" target="_blank" rel="noopener noreferrer">goblin.tools</a> —
          small, single-purpose, calm UI, instant output, no sign-up.
        </p>
      </Section>

      {/* Method */}
      <Section title="🧠 How it works (Method)">
        <p>
          This app does <strong>not</strong> use any paid AI API (OpenAI, Anthropic, etc.).
          All "smart" features are implemented locally:
        </p>
        <ol className="method-list">
          <li>
            <strong>Infinite State Machine (Wizard):</strong> A typed state machine guides you through
            each field of a help request. You can go forward, back, jump to any step, or skip to review
            at any time. Validation is soft — missing fields produce placeholders, not hard blocks.
          </li>
          <li>
            <strong>Heuristic Engine ("Pseudo AI"):</strong> A rules-based system analyzes your draft
            in real time. It checks for completeness, clarity, effort indicators, time-cost awareness,
            and tone-channel fit. Outputs actionable suggestions and optional auto-fixes.
          </li>
          <li>
            <strong>Markov n-gram Generator:</strong> A trigram Markov chain trained on a curated corpus
            generates variant phrasings for salutations, closings, request lines, and timebox phrases.
            This creates "AI-ish" variation without any API call. Guardrails prevent generation of
            links, names, or inappropriate content.
          </li>
          <li>
            <strong>Explainable Scoring:</strong> Your request is scored on 5 dimensions
            (Completeness, Clarity, Effort, Cost, Tone), each 0–20, totaling 0–100.
            Each dimension has transparent criteria, and 1–3 actionable tips are always provided.
          </li>
          <li>
            <strong>Multi-format Generator:</strong> Outputs are generated in 3 lengths
            (ultra-short, short, standard) and adapted for 4 channels
            (email, Slack/Discord, GitHub issue, in-person script).
          </li>
        </ol>
      </Section>

      {/* Limitations */}
      <Section title="⚠️ Limitations">
        <ul>
          <li>This tool does <strong>not</strong> understand the meaning of your text. It only restructures and rephrases based on templates and rules.</li>
          <li>Markov-generated phrases may occasionally sound awkward — deterministic fallbacks are used when output quality is low.</li>
          <li>The tool cannot verify facts, check links, or know your specific context.</li>
          <li>Output quality depends on the information you provide.</li>
        </ul>
      </Section>

      {/* Privacy */}
      <Section title="🔒 Privacy">
        <ul>
          <li><strong>No login</strong> — no accounts, no passwords, no registration.</li>
          <li><strong>No server storage</strong> — all data lives in your browser's localStorage.</li>
          <li><strong>No analytics</strong> — no tracking scripts, no cookies, no external calls.</li>
          <li><strong>No external fonts</strong> — system font stack only.</li>
          <li>Your data stays on your device unless <strong>you</strong> choose to export it.</li>
        </ul>
      </Section>

      {/* Accessibility */}
      <Section title="♿ Accessibility Settings">
        <AccessibilityControls />
      </Section>

      {/* Tech */}
      <Section title="🛠️ Tech Stack">
        <ul>
          <li>Vite + React + TypeScript (static build)</li>
          <li>No external UI library — custom MD3-inspired design tokens</li>
          <li>Hash routing (no server-side routing needed)</li>
          <li>localStorage for persistence</li>
          <li>Clipboard API + Blob download for export</li>
          <li>Zero external API dependencies</li>
        </ul>
      </Section>

      <style>{`
        .about-section {
          margin-bottom: var(--sp-8);
        }
        .about-section h2 {
          font-size: var(--fs-lg);
          font-weight: 600;
          margin-bottom: var(--sp-3);
          padding-bottom: var(--sp-2);
          border-bottom: 1px solid var(--border-light);
        }
        .about-section p,
        .about-section li {
          font-size: var(--fs-sm);
          line-height: var(--lh-loose);
          color: var(--text-muted);
          max-width: var(--max-line-w);
        }
        .about-section p { margin-bottom: var(--sp-3); }
        .about-section ul,
        .about-section ol {
          padding-left: var(--sp-6);
          margin-bottom: var(--sp-3);
        }
        .about-section li { margin-bottom: var(--sp-2); }
        .about-section a {
          color: var(--accent);
          text-decoration: underline;
        }
        .method-list {
          counter-reset: method;
          list-style: none;
          padding-left: 0;
        }
        .method-list li {
          counter-increment: method;
          padding-left: var(--sp-8);
          position: relative;
          margin-bottom: var(--sp-4);
        }
        .method-list li::before {
          content: counter(method);
          position: absolute;
          left: 0;
          top: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--accent-text);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--fs-xs);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="about-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
