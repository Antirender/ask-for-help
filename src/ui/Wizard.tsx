/* ============================================================
   Wizard.tsx — Stepper, back/next, jump, progress, autosave
   Validation warnings only appear after the user clicks Next.
   ============================================================ */

import { useEffect, useState, useRef } from 'react';
import { STEPS, STEP_META, validateStep, type StepId, type WizardAction, type WizardState } from '../core/machine';
import { saveDraft } from '../core/storage';
import { getGlobalLang } from './AppShell';
import { IconArrowLeft, IconArrowRight, IconSkipForward, IconAlertTriangle } from './Icons';

interface Props {
  state: WizardState;
  dispatch: (action: WizardAction) => void;
  children: React.ReactNode;
}

export default function Wizard({ state, dispatch, children }: Props) {
  const { currentStep, visited, draft } = state;
  const meta = STEP_META[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const uiLang = getGlobalLang();

  // Track which steps have had a "next" attempt — only those show warnings
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());
  const prevStep = useRef(currentStep);

  // Autosave draft on every change
  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  // Detect when step changes (user successfully moved or jumped)
  useEffect(() => {
    prevStep.current = currentStep;
  }, [currentStep]);

  const handleNext = () => {
    // Mark current step as submitted so warnings become visible
    setSubmittedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
    dispatch({ type: 'NEXT' });
  };

  // Only show warnings for steps the user has already tried to leave
  const showWarnings = submittedSteps.has(currentStep);
  const validation = validateStep(STEPS[currentStep], draft);

  const stepLabel = (s: (typeof STEP_META)[number]) => {
    if (uiLang === 'zh') return s.labelZh;
    return s.label;
  };

  const stepDesc = (s: (typeof STEP_META)[number]) => {
    if (uiLang === 'zh') return s.descriptionZh;
    return s.description;
  };

  return (
    <div className="wizard">
      {/* Step indicator / stepper */}
      <nav className="wizard-stepper" role="tablist" aria-label="Wizard steps">
        {STEP_META.map((s, i) => {
          const v = validateStep(s.id, draft);
          const isCurrent = i === currentStep;
          const isVisited = visited.has(i);
          const hasWarning = submittedSteps.has(i) && !v.ok;

          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isCurrent}
              aria-label={`${stepLabel(s)}${hasWarning ? ' (needs attention)' : ''}`}
              className={`wizard-step ${isCurrent ? 'current' : ''} ${isVisited ? 'visited' : ''} ${hasWarning ? 'warning' : ''}`}
              onClick={() => dispatch({ type: 'JUMP', step: i })}
            >
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{stepLabel(s)}</span>
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
          {stepLabel(meta)}
        </h2>
        <p className="wizard-desc text-muted">
          {stepDesc(meta)}
        </p>
        {/* Inline validation: only shown after submit attempt, uses compact styling */}
        {showWarnings && validation.warnings.length > 0 && (
          <div className="wizard-warnings" role="alert">
            {validation.warnings.map((w, i) => (
              <p key={i} className="wizard-warning-item">
                <span className="wizard-warning-icon">{IconAlertTriangle({ size: 14 })}</span>
                {w}
              </p>
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
              {IconArrowLeft({ size: 16 })} {uiLang === 'zh' ? '上一步' : 'Back'}
            </button>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {!isLast && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => dispatch({ type: 'NOT_SURE' })}
              title="Skip to review with what you have"
            >
              {IconSkipForward({ size: 14 })}
              <span style={{ marginLeft: 4 }}>
                {uiLang === 'zh' ? '跳到预览' : uiLang === 'fr' ? 'Aperçu' : 'Skip to review'}
              </span>
            </button>
          )}
          {!isLast && (
            <button className="btn btn-primary" onClick={handleNext}>
              {uiLang === 'zh' ? '下一步' : uiLang === 'fr' ? 'Suivant' : 'Next'} {IconArrowRight({ size: 16 })}
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
          padding: var(--sp-2) var(--sp-3);
          background: var(--clr-warning-container);
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--clr-warning);
        }
        .wizard-warning-item {
          font-size: var(--fs-sm);
          color: var(--clr-warning);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .wizard-warning-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
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
          .wizard-nav { flex-wrap: wrap; gap: var(--sp-3); }
        }
      `}</style>
    </div>
  );
}
