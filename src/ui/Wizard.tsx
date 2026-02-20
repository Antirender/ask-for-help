/* ============================================================
   Wizard.tsx — Stepper, back/next, jump, progress, autosave
   ============================================================ */

import { useEffect } from 'react';
import { STEPS, STEP_META, validateStep, type StepId, type WizardAction, type WizardState } from '../core/machine';
import { saveDraft } from '../core/storage';

interface Props {
  state: WizardState;
  dispatch: (action: WizardAction) => void;
  children: React.ReactNode;
}

export default function Wizard({ state, dispatch, children }: Props) {
  const { currentStep, visited, draft } = state;
  const meta = STEP_META[currentStep];
  const validation = validateStep(STEPS[currentStep], draft);
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const lang = draft.lang;

  // Autosave draft on every change
  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  return (
    <div className="wizard">
      {/* Step indicator / stepper */}
      <nav className="wizard-stepper" role="tablist" aria-label="Wizard steps">
        {STEP_META.map((s, i) => {
          const v = validateStep(s.id, draft);
          const isCurrent = i === currentStep;
          const isVisited = visited.has(i);
          const hasWarning = isVisited && !v.ok;

          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isCurrent}
              aria-label={`${lang === 'zh' ? s.labelZh : s.label}${hasWarning ? ' (needs attention)' : ''}`}
              className={`wizard-step ${isCurrent ? 'current' : ''} ${isVisited ? 'visited' : ''} ${hasWarning ? 'warning' : ''}`}
              onClick={() => dispatch({ type: 'JUMP', step: i })}
            >
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{lang === 'zh' ? s.labelZh : s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Progress bar */}
      <div className="wizard-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
        <div
          className="wizard-progress-fill"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step header */}
      <div className="wizard-header">
        <h2 className="wizard-title">
          {lang === 'zh' ? meta.labelZh : meta.label}
        </h2>
        <p className="wizard-desc text-muted">
          {lang === 'zh' ? meta.descriptionZh : meta.description}
        </p>
        {validation.warnings.length > 0 && (
          <div className="wizard-warnings" role="alert">
            {validation.warnings.map((w, i) => (
              <p key={i} className="wizard-warning-item">⚠️ {w}</p>
            ))}
          </div>
        )}
      </div>

      {/* Step content */}
      <div className="wizard-content page-enter">
        {children}
      </div>

      {/* Navigation buttons */}
      <div className="wizard-nav">
        <div className="flex gap-3">
          {!isFirst && (
            <button className="btn btn-outline" onClick={() => dispatch({ type: 'BACK' })}>
              ← {lang === 'zh' ? '上一步' : 'Back'}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {!isLast && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => dispatch({ type: 'NOT_SURE' })}
              title="Skip to review with what you have"
            >
              {lang === 'zh' ? '🤷 不确定，直接预览' : "🤷 Not sure, skip to review"}
            </button>
          )}
          {!isLast && (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'NEXT' })}>
              {lang === 'zh' ? '下一步' : 'Next'} →
            </button>
          )}
        </div>
      </div>

      <style>{`
        .wizard { max-width: 800px; margin: 0 auto; }
        .wizard-stepper {
          display: flex;
          gap: 2px;
          overflow-x: auto;
          padding-bottom: var(--sp-2);
          scrollbar-width: thin;
        }
        .wizard-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: var(--radius-sm);
          min-width: 64px;
          font-family: inherit;
          transition: background var(--dur-fast);
        }
        .wizard-step:hover { background: color-mix(in srgb, var(--accent) 6%, transparent); }
        .wizard-step.current { background: color-mix(in srgb, var(--accent) 12%, transparent); }
        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--fs-xs);
          font-weight: 700;
          border: 2px solid var(--border);
          color: var(--text-muted);
          transition: border-color var(--dur-fast), background var(--dur-fast), color var(--dur-fast);
        }
        .wizard-step.current .step-num {
          border-color: var(--accent);
          background: var(--accent);
          color: var(--accent-text);
        }
        .wizard-step.visited .step-num {
          border-color: var(--accent);
          color: var(--accent);
        }
        .wizard-step.warning .step-num {
          border-color: var(--clr-warning);
          color: var(--clr-warning);
        }
        .step-label {
          font-size: 10px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .wizard-step.current .step-label { color: var(--accent); font-weight: 600; }

        .wizard-progress {
          height: 3px;
          background: var(--border-light);
          border-radius: 2px;
          margin: var(--sp-2) 0 var(--sp-4);
          overflow: hidden;
        }
        .wizard-progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width var(--dur-normal) var(--ease-standard);
        }

        .wizard-header { margin-bottom: var(--sp-4); }
        .wizard-title { font-size: var(--fs-xl); font-weight: 700; margin-bottom: 4px; }
        .wizard-desc { font-size: var(--fs-sm); }
        .wizard-warnings {
          margin-top: var(--sp-2);
          padding: var(--sp-3);
          background: var(--clr-warning-container);
          border-radius: var(--radius-sm);
        }
        .wizard-warning-item {
          font-size: var(--fs-sm);
          color: var(--clr-warning);
        }

        .wizard-content { min-height: 200px; margin-bottom: var(--sp-6); }

        .wizard-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--sp-4);
          border-top: 1px solid var(--border-light);
        }

        @media (max-width: 600px) {
          .step-label { display: none; }
          .wizard-step { min-width: 40px; padding: 6px; }
        }
      `}</style>
    </div>
  );
}
