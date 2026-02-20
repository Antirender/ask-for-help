/* ============================================================
   FieldCard.tsx — MD3-style card for each wizard field
   ============================================================ */

import type { ReactNode } from 'react';

interface Props {
  title: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export default function FieldCard({ title, hint, required, children }: Props) {
  return (
    <section className="field-card card" aria-label={title}>
      <div className="field-card-header">
        <h3 className="field-card-title">
          {title}
          {required && <span className="field-required" aria-label="required"> *</span>}
        </h3>
        {hint && <p className="field-card-hint text-muted text-sm">{hint}</p>}
      </div>
      <div className="field-card-body">{children}</div>
      <style>{`
        .field-card { margin-bottom: var(--sp-4); }
        .field-card-header { margin-bottom: var(--sp-3); }
        .field-card-title {
          font-size: var(--fs-md);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .field-required { color: var(--clr-error); font-weight: 700; }
        .field-card-hint { margin-top: 2px; }
        .field-card-body { display: flex; flex-direction: column; gap: var(--sp-3); }
      `}</style>
    </section>
  );
}
