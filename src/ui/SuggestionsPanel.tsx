/* ============================================================
   SuggestionsPanel.tsx — Heuristic tips + Markov rewrites
   ============================================================ */

import type { Suggestion } from '../core/heuristics';
import type { AskDraft } from '../core/schema';

interface Props {
  suggestions: Suggestion[];
  lang: string;
  onApplyFix?: (patch: Partial<AskDraft>) => void;
  onJumpToField?: (field: string) => void;
  markovVariants?: { section: string; text: string }[];
  onApplyVariant?: (section: string, text: string) => void;
}

export default function SuggestionsPanel({
  suggestions,
  lang,
  onApplyFix,
  onJumpToField,
  markovVariants,
  onApplyVariant,
}: Props) {
  const isZh = lang === 'zh';
  const doNow = suggestions.filter((s) => s.priority === 'do-now');
  const niceToHave = suggestions.filter((s) => s.priority === 'nice-to-have');

  if (suggestions.length === 0 && (!markovVariants || markovVariants.length === 0)) {
    return (
      <div className="suggestions-panel card" style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>✨</div>
        <p className="text-muted text-sm">
          {isZh ? '看起来都不错！没有建议。' : 'Looking good! No suggestions.'}
        </p>
      </div>
    );
  }

  return (
    <div className="suggestions-panel card">
      <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
        {isZh ? '💡 建议' : '💡 Suggestions'}
      </h3>

      {doNow.length > 0 && (
        <div className="suggestion-group">
          <h4 className="suggestion-group-title">
            {isZh ? '🔴 需要处理' : '🔴 Do now'}
          </h4>
          {doNow.map((s) => (
            <SuggestionItem
              key={s.id}
              suggestion={s}
              isZh={isZh}
              onApplyFix={onApplyFix}
              onJumpToField={onJumpToField}
            />
          ))}
        </div>
      )}

      {niceToHave.length > 0 && (
        <div className="suggestion-group">
          <h4 className="suggestion-group-title">
            {isZh ? '🟡 建议改进' : '🟡 Nice to have'}
          </h4>
          {niceToHave.map((s) => (
            <SuggestionItem
              key={s.id}
              suggestion={s}
              isZh={isZh}
              onApplyFix={onApplyFix}
              onJumpToField={onJumpToField}
            />
          ))}
        </div>
      )}

      {markovVariants && markovVariants.length > 0 && (
        <div className="suggestion-group" style={{ marginTop: 'var(--sp-4)' }}>
          <h4 className="suggestion-group-title">
            {isZh ? '🔄 表达变体' : '🔄 Phrasing variants'}
          </h4>
          {markovVariants.map((v, i) => (
            <div key={i} className="variant-item">
              <span className="badge badge-outline" style={{ marginRight: 8 }}>{v.section}</span>
              <span className="text-sm">"{v.text}"</span>
              {onApplyVariant && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onApplyVariant(v.section, v.text)}
                  style={{ marginLeft: 'auto' }}
                >
                  {isZh ? '使用' : 'Use'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .suggestions-panel { }
        .suggestion-group { margin-bottom: var(--sp-3); }
        .suggestion-group-title {
          font-size: var(--fs-sm);
          font-weight: 600;
          margin-bottom: var(--sp-2);
        }
        .suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: var(--sp-2);
          padding: var(--sp-2) var(--sp-3);
          border-radius: var(--radius-sm);
          margin-bottom: var(--sp-1);
          background: color-mix(in srgb, var(--accent) 4%, transparent);
        }
        .suggestion-msg { flex: 1; font-size: var(--fs-sm); line-height: var(--lh-normal); }
        .variant-item {
          display: flex;
          align-items: center;
          gap: var(--sp-2);
          padding: var(--sp-2) var(--sp-3);
          border-radius: var(--radius-sm);
          margin-bottom: var(--sp-1);
          background: color-mix(in srgb, var(--accent) 4%, transparent);
        }
      `}</style>
    </div>
  );
}

/* ---------- Individual suggestion ---------- */
function SuggestionItem({
  suggestion,
  isZh,
  onApplyFix,
  onJumpToField,
}: {
  suggestion: Suggestion;
  isZh: boolean;
  onApplyFix?: (patch: Partial<AskDraft>) => void;
  onJumpToField?: (field: string) => void;
}) {
  return (
    <div className="suggestion-item">
      <p className="suggestion-msg">{isZh ? suggestion.messageZh : suggestion.message}</p>
      <div className="flex gap-2">
        {suggestion.autoFix && onApplyFix && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onApplyFix(suggestion.autoFix!)}
          >
            {isZh ? '自动修复' : 'Fix'}
          </button>
        )}
        {suggestion.field && onJumpToField && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onJumpToField(suggestion.field!)}
          >
            {isZh ? '跳转' : 'Go'}
          </button>
        )}
      </div>
    </div>
  );
}
