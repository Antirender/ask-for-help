/* ============================================================
   Builder.tsx — Core builder wizard + preview + suggestions
   ============================================================ */

import { useReducer, useMemo, useEffect, useCallback, useState } from 'react';
import {
  STEPS,
  wizardReducer,
  initialWizardState,
  type WizardAction,
} from '../core/machine';
import {
  emptyDraft,
  type AskDraft,
  type RecipientType,
  type Channel,
  type Tone,
  type Lang,
  type AskType,
  type TimeboxMin,
} from '../core/schema';
import { analyzeAskDraft, rewriteText, type RewriteStyle } from '../core/heuristics';
import { generateOutput } from '../core/generator';
import { scoreDraft, scoreColor, scoreLabel } from '../core/scoring';
import { buildMarkovModel, generateVariant, type MarkovModel } from '../core/markov';
import { saveToHistory, loadDraft, clearDraft } from '../core/storage';
import Wizard from '../ui/Wizard';
import FieldCard from '../ui/FieldCard';
import PreviewPane from '../ui/PreviewPane';
import SuggestionsPanel from '../ui/SuggestionsPanel';

import corpusEnUrl from '../data/markov_corpus_en.txt?raw';
import corpusZhUrl from '../data/markov_corpus_zh.txt?raw';

export default function Builder() {
  // Load saved draft or start fresh
  const [state, dispatch] = useReducer(wizardReducer, null, () => {
    const saved = loadDraft();
    return initialWizardState(saved || emptyDraft());
  });

  const { draft } = state;
  const stepId = STEPS[state.currentStep];

  // Markov models
  const [markovEn, setMarkovEn] = useState<MarkovModel | null>(null);
  const [markovZh, setMarkovZh] = useState<MarkovModel | null>(null);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    setMarkovEn(buildMarkovModel(corpusEnUrl, 'en', 3));
    setMarkovZh(buildMarkovModel(corpusZhUrl, 'zh', 3));
  }, []);

  const markov = draft.lang === 'zh' ? markovZh : markovEn;

  // Computed
  const suggestions = useMemo(() => analyzeAskDraft(draft), [draft]);
  const output = useMemo(() => generateOutput(draft), [draft]);
  const score = useMemo(() => scoreDraft(draft), [draft]);

  // Markov variants
  const [variants, setVariants] = useState<{ section: string; text: string }[]>([]);
  const regenerateVariants = useCallback(() => {
    if (!markov) return;
    const sections = ['salutation', 'closing', 'request', 'timebox'] as const;
    const v = sections.map((s) => ({
      section: s,
      text: generateVariant(markov, s),
    }));
    setVariants(v);
  }, [markov]);

  useEffect(() => {
    regenerateVariants();
  }, [regenerateVariants]);

  const showSnack = (msg: string) => {
    setSnack(msg);
    setTimeout(() => setSnack(''), 2500);
  };

  const updateDraft = (patch: Partial<AskDraft>) => {
    dispatch({ type: 'UPDATE_DRAFT', patch });
  };

  const handleSaveToHistory = () => {
    saveToHistory(draft, output, score);
    showSnack(draft.lang === 'zh' ? '✓ 已保存到历史' : '✓ Saved to history');
  };

  const handleNewDraft = () => {
    clearDraft();
    dispatch({ type: 'RESET', draft: emptyDraft() });
    showSnack(draft.lang === 'zh' ? '✓ 已重置' : '✓ Reset');
  };

  const handleJumpToField = (field: string) => {
    const fieldStepMap: Record<string, number> = {
      goal: 1,
      context: 2,
      tried: 3,
      block: 4,
      askType: 5,
      askDetail: 5,
      timeboxMin: 6,
    };
    const idx = fieldStepMap[field];
    if (idx !== undefined) dispatch({ type: 'JUMP', step: idx });
  };

  const handleRewrite = (field: 'goal' | 'context' | 'block' | 'askDetail', style: RewriteStyle) => {
    const lang = draft.lang === 'zh' ? 'zh' : 'en';
    const original = draft[field];
    if (typeof original !== 'string') return;
    const rewritten = rewriteText(original, style, lang);
    updateDraft({ [field]: rewritten });
  };

  const isZh = draft.lang === 'zh';

  return (
    <div className="container">
      <Wizard state={state} dispatch={dispatch as (a: WizardAction) => void}>
        {stepId === 'seed' && (
          <SeedStep draft={draft} updateDraft={updateDraft} isZh={isZh} />
        )}
        {stepId === 'goal' && (
          <TextFieldStep
            field="goal"
            value={draft.goal}
            onChange={(v) => updateDraft({ goal: v })}
            placeholder={isZh ? '例如：理解作业第3题的递归思路' : 'e.g., Understand the recursive approach for Q3'}
            onRewrite={(style) => handleRewrite('goal', style)}
            isZh={isZh}
          />
        )}
        {stepId === 'context' && (
          <TextFieldStep
            field="context"
            value={draft.context}
            onChange={(v) => updateDraft({ context: v })}
            placeholder={isZh ? '例如：这是 COMP 101 的期末项目…' : 'e.g., This is for the COMP 101 final project…'}
            onRewrite={(style) => handleRewrite('context', style)}
            isZh={isZh}
            multiline
          />
        )}
        {stepId === 'tried' && (
          <TriedStep tried={draft.tried} updateDraft={updateDraft} isZh={isZh} />
        )}
        {stepId === 'block' && (
          <TextFieldStep
            field="block"
            value={draft.block}
            onChange={(v) => updateDraft({ block: v })}
            placeholder={isZh ? '例如：运行到第4步时报错 TypeError…' : 'e.g., Step 4 throws TypeError…'}
            onRewrite={(style) => handleRewrite('block', style)}
            isZh={isZh}
            multiline
          />
        )}
        {stepId === 'ask' && (
          <AskStep draft={draft} updateDraft={updateDraft} isZh={isZh} onRewrite={(s) => handleRewrite('askDetail', s)} />
        )}
        {stepId === 'timebox' && (
          <TimeboxStep draft={draft} updateDraft={updateDraft} isZh={isZh} />
        )}
        {stepId === 'attachments' && (
          <AttachmentsStep draft={draft} updateDraft={updateDraft} isZh={isZh} />
        )}
        {stepId === 'review' && (
          <ReviewStep
            draft={draft}
            output={output}
            score={score}
            suggestions={suggestions}
            variants={variants}
            isZh={isZh}
            onApplyFix={updateDraft}
            onJumpToField={handleJumpToField}
            onApplyVariant={() => regenerateVariants()}
            onSave={handleSaveToHistory}
            onNew={handleNewDraft}
          />
        )}
      </Wizard>

      {/* Snackbar */}
      <div className={`snackbar ${snack ? 'show' : ''}`} role="status" aria-live="polite">
        {snack}
      </div>
    </div>
  );
}

/* ============================================================
   Step sub-components
   ============================================================ */

/* --- Seed step --- */
function SeedStep({ draft, updateDraft, isZh }: { draft: AskDraft; updateDraft: (p: Partial<AskDraft>) => void; isZh: boolean }) {
  const recipientTypes: RecipientType[] = ['Professor', 'TA', 'Teammate', 'Mentor', 'Support', 'Forum', 'Other'];
  const channels: Channel[] = ['email', 'slack', 'issue', 'in_person'];
  const tones: Tone[] = ['polite', 'direct', 'warm', 'urgent'];
  const langs: { value: Lang; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'zh', label: '中文' },
    { value: 'mix', label: 'Mixed 混合' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FieldCard title={isZh ? '语言' : 'Language'}>
        <div className="flex gap-2 flex-wrap">
          {langs.map((l) => (
            <button
              key={l.value}
              className={`chip ${draft.lang === l.value ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ lang: l.value })}
            >
              {l.label}
            </button>
          ))}
        </div>
      </FieldCard>

      <FieldCard title={isZh ? '接收者' : 'Recipient'} hint={isZh ? '你要找谁帮忙？' : 'Who are you asking?'}>
        <div className="flex gap-2 flex-wrap">
          {recipientTypes.map((r) => (
            <button
              key={r}
              className={`chip ${draft.recipientType === r ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ recipientType: r })}
            >
              {r}
            </button>
          ))}
        </div>
      </FieldCard>

      <FieldCard title={isZh ? '沟通方式' : 'Channel'}>
        <div className="flex gap-2 flex-wrap">
          {channels.map((c) => (
            <button
              key={c}
              className={`chip ${draft.channel === c ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ channel: c })}
            >
              {channelLabel(c)}
            </button>
          ))}
        </div>
      </FieldCard>

      <FieldCard title={isZh ? '语气' : 'Tone'}>
        <div className="flex gap-2 flex-wrap">
          {tones.map((t) => (
            <button
              key={t}
              className={`chip ${draft.tone === t ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ tone: t })}
            >
              {toneLabel(t)}
            </button>
          ))}
        </div>
      </FieldCard>
    </div>
  );
}

function channelLabel(c: Channel): string {
  const map: Record<Channel, string> = {
    email: '📧 Email',
    slack: '💬 Slack / Discord',
    issue: '🐛 Issue / Forum',
    in_person: '🗣️ In-person',
  };
  return map[c];
}

function toneLabel(t: Tone): string {
  const map: Record<Tone, string> = {
    polite: '🎩 Polite',
    direct: '🎯 Direct',
    warm: '☀️ Warm',
    urgent: '⏰ Urgent',
  };
  return map[t];
}

/* --- Text field step --- */
function TextFieldStep({
  field,
  value,
  onChange,
  placeholder,
  onRewrite,
  isZh,
  multiline,
}: {
  field: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onRewrite: (style: RewriteStyle) => void;
  isZh: boolean;
  multiline?: boolean;
}) {
  const rewriteButtons: { style: RewriteStyle; label: string; labelZh: string }[] = [
    { style: 'clearer', label: 'Make clearer', labelZh: '更清晰' },
    { style: 'shorter', label: 'Make shorter', labelZh: '更简短' },
    { style: 'more-polite', label: 'More polite', labelZh: '更礼貌' },
    { style: 'more-direct', label: 'More direct', labelZh: '更直接' },
  ];

  return (
    <FieldCard title={field.charAt(0).toUpperCase() + field.slice(1)}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          aria-label={field}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={field}
        />
      )}
      {value.trim() && (
        <div className="flex gap-2 flex-wrap mt-2">
          {rewriteButtons.map((rb) => (
            <button
              key={rb.style}
              className="btn btn-ghost btn-sm"
              onClick={() => onRewrite(rb.style)}
            >
              ✨ {isZh ? rb.labelZh : rb.label}
            </button>
          ))}
        </div>
      )}
    </FieldCard>
  );
}

/* --- Tried step --- */
function TriedStep({
  tried,
  updateDraft,
  isZh,
}: {
  tried: string[];
  updateDraft: (p: Partial<AskDraft>) => void;
  isZh: boolean;
}) {
  const items = tried.length === 0 ? [''] : tried;

  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    updateDraft({ tried: next });
  };

  const add = () => updateDraft({ tried: [...items, ''] });

  const remove = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateDraft({ tried: next.length === 0 ? [''] : next });
  };

  return (
    <FieldCard
      title={isZh ? '已尝试的方法' : 'What you\'ve tried'}
      hint={isZh ? '列出你已经做过的尝试（至少1项效果更好）' : 'List what you already attempted (at least 1 recommended)'}
    >
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-muted text-sm" style={{ minWidth: 20 }}>{i + 1}.</span>
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={isZh ? `尝试 ${i + 1}…` : `Attempt ${i + 1}…`}
            aria-label={`Attempt ${i + 1}`}
          />
          {items.length > 1 && (
            <button className="btn-icon" onClick={() => remove(i)} aria-label="Remove attempt">✕</button>
          )}
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={add} style={{ alignSelf: 'flex-start' }}>
        + {isZh ? '添加' : 'Add'}
      </button>
    </FieldCard>
  );
}

/* --- Ask step --- */
function AskStep({
  draft,
  updateDraft,
  isZh,
  onRewrite,
}: {
  draft: AskDraft;
  updateDraft: (p: Partial<AskDraft>) => void;
  isZh: boolean;
  onRewrite: (style: RewriteStyle) => void;
}) {
  const askTypes: { value: AskType; label: string; labelZh: string; icon: string }[] = [
    { value: 'answer', label: 'Answer', labelZh: '回答', icon: '💡' },
    { value: 'direction', label: 'Direction', labelZh: '方向', icon: '🧭' },
    { value: 'review', label: 'Review', labelZh: '审查', icon: '👀' },
    { value: 'confirm', label: 'Confirm', labelZh: '确认', icon: '✅' },
    { value: 'recommend', label: 'Recommend', labelZh: '推荐', icon: '⭐' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FieldCard title={isZh ? '请求类型' : 'What do you need?'} required>
        <div className="flex gap-2 flex-wrap">
          {askTypes.map((a) => (
            <button
              key={a.value}
              className={`chip ${draft.askType === a.value ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ askType: a.value })}
            >
              {a.icon} {isZh ? a.labelZh : a.label}
            </button>
          ))}
        </div>
      </FieldCard>

      <TextFieldStep
        field="askDetail"
        value={draft.askDetail}
        onChange={(v) => updateDraft({ askDetail: v })}
        placeholder={isZh ? '具体描述你需要什么…' : 'Describe specifically what you need…'}
        onRewrite={onRewrite}
        isZh={isZh}
        multiline
      />
    </div>
  );
}

/* --- Timebox step --- */
function TimeboxStep({ draft, updateDraft, isZh }: { draft: AskDraft; updateDraft: (p: Partial<AskDraft>) => void; isZh: boolean }) {
  const options: TimeboxMin[] = [2, 5, 10, 15, 20];

  return (
    <div className="flex flex-col gap-4">
      <FieldCard title={isZh ? '预计时间' : 'Time estimate'} hint={isZh ? '对方大概需要花多少分钟？' : 'How many minutes will this take them?'}>
        <div className="flex gap-2 flex-wrap">
          {options.map((m) => (
            <button
              key={m}
              className={`chip ${draft.timeboxMin === m ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ timeboxMin: m })}
            >
              {m} {isZh ? '分钟' : 'min'}
            </button>
          ))}
        </div>
      </FieldCard>

      <FieldCard title={isZh ? '截止日期（可选）' : 'Deadline (optional)'}>
        <input
          type="text"
          value={draft.deadline || ''}
          onChange={(e) => updateDraft({ deadline: e.target.value || null })}
          placeholder={isZh ? '例如：周五 5pm 之前' : 'e.g., Friday 5pm'}
          aria-label="Deadline"
        />
      </FieldCard>
    </div>
  );
}

/* --- Attachments step --- */
function AttachmentsStep({ draft, updateDraft, isZh }: { draft: AskDraft; updateDraft: (p: Partial<AskDraft>) => void; isZh: boolean }) {
  const links = draft.links.length === 0 ? [{ label: '', url: '' }] : draft.links;

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const next = [...links];
    next[index] = { ...next[index], [field]: value };
    updateDraft({ links: next });
  };

  const addLink = () => updateDraft({ links: [...links, { label: '', url: '' }] });

  const removeLink = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    updateDraft({ links: next.length === 0 ? [{ label: '', url: '' }] : next });
  };

  return (
    <div className="flex flex-col gap-4">
      <FieldCard title={isZh ? '参考链接' : 'Reference links'} hint={isZh ? '添加相关链接（可选）' : 'Add relevant links (optional)'}>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateLink(i, 'label', e.target.value)}
              placeholder={isZh ? '标签' : 'Label'}
              style={{ flex: '1 1 120px' }}
              aria-label={`Link ${i + 1} label`}
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(i, 'url', e.target.value)}
              placeholder="https://..."
              style={{ flex: '2 1 200px' }}
              aria-label={`Link ${i + 1} URL`}
            />
            {links.length > 1 && (
              <button className="btn-icon" onClick={() => removeLink(i)} aria-label="Remove link">✕</button>
            )}
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addLink} style={{ alignSelf: 'flex-start' }}>
          + {isZh ? '添加链接' : 'Add link'}
        </button>
      </FieldCard>

      <FieldCard title={isZh ? '附件说明' : 'Attachments note'} hint={isZh ? '描述截图或附件（可选）' : 'Describe screenshots or attachments (optional)'}>
        <textarea
          value={draft.attachmentsNote || ''}
          onChange={(e) => updateDraft({ attachmentsNote: e.target.value || null })}
          placeholder={isZh ? '例如：见附件截图，显示了错误信息…' : 'e.g., See attached screenshot showing the error…'}
          rows={3}
          aria-label="Attachments note"
        />
      </FieldCard>
    </div>
  );
}

/* --- Review step --- */
function ReviewStep({
  draft,
  output,
  score,
  suggestions,
  variants,
  isZh,
  onApplyFix,
  onJumpToField,
  onApplyVariant,
  onSave,
  onNew,
}: {
  draft: AskDraft;
  output: ReturnType<typeof generateOutput>;
  score: ReturnType<typeof scoreDraft>;
  suggestions: ReturnType<typeof analyzeAskDraft>;
  variants: { section: string; text: string }[];
  isZh: boolean;
  onApplyFix: (patch: Partial<AskDraft>) => void;
  onJumpToField: (field: string) => void;
  onApplyVariant: () => void;
  onSave: () => void;
  onNew: () => void;
}) {
  return (
    <div className="review-layout">
      {/* Score overview */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>
        <div
          className="score-ring"
          style={{
            margin: '0 auto 8px',
            border: `4px solid ${scoreColor(score.total)}`,
            color: scoreColor(score.total),
          }}
        >
          {score.total}
        </div>
        <p className="font-semibold">{scoreLabel(score.total, draft.lang)}</p>
        <div className="flex justify-center gap-3 mt-2 flex-wrap">
          {(['completeness', 'clarity', 'effort', 'cost', 'tone'] as const).map((dim) => (
            <span key={dim} className="badge badge-outline">
              {dim}: {score[dim]}/20
            </span>
          ))}
        </div>
        {score.tips.length > 0 && (
          <div className="mt-4" style={{ textAlign: 'left' }}>
            <p className="text-sm font-semibold mb-2">{isZh ? '改进建议：' : 'Improvement tips:'}</p>
            {score.tips.map((tip, i) => (
              <p key={i} className="text-sm text-muted">• {tip}</p>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <PreviewPane output={output} lang={draft.lang} />

      {/* Suggestions */}
      <div style={{ marginTop: 'var(--sp-4)' }}>
        <SuggestionsPanel
          suggestions={suggestions}
          lang={draft.lang}
          onApplyFix={onApplyFix}
          onJumpToField={onJumpToField}
          markovVariants={variants}
          onApplyVariant={() => onApplyVariant()}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center mt-6 flex-wrap">
        <button className="btn btn-primary" onClick={onSave}>
          💾 {isZh ? '保存到历史' : 'Save to history'}
        </button>
        <button className="btn btn-outline" onClick={onNew}>
          🔄 {isZh ? '新建请求' : 'New request'}
        </button>
      </div>
    </div>
  );
}
