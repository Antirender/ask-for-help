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
import { getGlobalLang } from '../ui/AppShell';
import Wizard from '../ui/Wizard';
import FieldCard from '../ui/FieldCard';
import PreviewPane from '../ui/PreviewPane';
import SuggestionsPanel from '../ui/SuggestionsPanel';
import { IconSave, IconRefresh, IconWand } from '../ui/Icons';

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

  // Sync draft.lang with global language setting
  useEffect(() => {
    const gLang = getGlobalLang();
    const mapped: Lang = gLang === 'fr' ? 'en' : gLang as Lang;
    if (draft.lang !== mapped && mapped !== 'mix') {
      dispatch({ type: 'UPDATE_DRAFT', patch: { lang: mapped } });
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      const m: Lang = detail === 'fr' ? 'en' : (detail as Lang);
      if (m !== 'mix') dispatch({ type: 'UPDATE_DRAFT', patch: { lang: m } });
    };
    window.addEventListener('ask4help_lang_change', handler);
    return () => window.removeEventListener('ask4help_lang_change', handler);
  }, []);

  // Markov models
  const [markovEn, setMarkovEn] = useState<MarkovModel | null>(null);
  const [markovZh, setMarkovZh] = useState<MarkovModel | null>(null);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    setMarkovEn(buildMarkovModel(corpusEnUrl, 'en', 3));
    setMarkovZh(buildMarkovModel(corpusZhUrl, 'zh', 3));
  }, []);

  const markov = draft.lang === 'zh' ? markovZh : markovEn;
  const uiLang = getGlobalLang();
  const isZh = uiLang === 'zh';
  const isFr = uiLang === 'fr';

  const t = (en: string, zh: string, fr: string) => isZh ? zh : isFr ? fr : en;

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
    showSnack(isZh ? '已保存到历史' : isFr ? 'Sauvegardé' : 'Saved to history');
  };

  const handleNewDraft = () => {
    clearDraft();
    dispatch({ type: 'RESET', draft: emptyDraft() });
    showSnack(isZh ? '已重置' : isFr ? 'Réinitialisé' : 'Reset');
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

  return (
    <div className="container">
      <Wizard state={state} dispatch={dispatch as (a: WizardAction) => void}>
        {stepId === 'seed' && (
          <SeedStep draft={draft} updateDraft={updateDraft} t={t} />
        )}
        {stepId === 'goal' && (
          <TextFieldStep
            field="goal"
            value={draft.goal}
            onChange={(v) => updateDraft({ goal: v })}
            placeholder={isZh ? '例如：理解作业第3题的递归思路' : 'e.g., Understand the recursive approach for Q3'}
            onRewrite={(style) => handleRewrite('goal', style)}
            t={t}
          />
        )}
        {stepId === 'context' && (
          <TextFieldStep
            field="context"
            value={draft.context}
            onChange={(v) => updateDraft({ context: v })}
            placeholder={isZh ? '例如：这是 COMP 101 的期末项目…' : 'e.g., This is for the COMP 101 final project…'}
            onRewrite={(style) => handleRewrite('context', style)}
            t={t}
            multiline
          />
        )}
        {stepId === 'tried' && (
          <TriedStep tried={draft.tried} updateDraft={updateDraft} t={t} />
        )}
        {stepId === 'block' && (
          <TextFieldStep
            field="block"
            value={draft.block}
            onChange={(v) => updateDraft({ block: v })}
            placeholder={isZh ? '例如：运行到第4步时报错 TypeError…' : 'e.g., Step 4 throws TypeError…'}
            onRewrite={(style) => handleRewrite('block', style)}
            t={t}
            multiline
          />
        )}
        {stepId === 'ask' && (
          <AskStep draft={draft} updateDraft={updateDraft} t={t} onRewrite={(s) => handleRewrite('askDetail', s)} />
        )}
        {stepId === 'timebox' && (
          <TimeboxStep draft={draft} updateDraft={updateDraft} t={t} />
        )}
        {stepId === 'attachments' && (
          <AttachmentsStep draft={draft} updateDraft={updateDraft} t={t} />
        )}
        {stepId === 'review' && (
          <ReviewStep
            draft={draft}
            output={output}
            score={score}
            suggestions={suggestions}
            variants={variants}
            t={t}
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

type T = (en: string, zh: string, fr: string) => string;

/* --- Seed step (no Language here — it's global now) --- */
function SeedStep({ draft, updateDraft, t }: { draft: AskDraft; updateDraft: (p: Partial<AskDraft>) => void; t: T }) {
  const recipientTypes: RecipientType[] = ['Professor', 'TA', 'Teammate', 'Mentor', 'Support', 'Forum', 'Other'];
  const channels: Channel[] = ['email', 'slack', 'issue', 'in_person'];
  const tones: Tone[] = ['polite', 'direct', 'warm', 'urgent'];

  return (
    <div className="flex flex-col gap-4">
      <FieldCard title={t('Recipient', '接收者', 'Destinataire')} hint={t('Who are you asking?', '你要找谁帮忙？', 'À qui demandez-vous ?')}>
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

      <FieldCard title={t('Channel', '沟通方式', 'Canal')}>
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

      <FieldCard title={t('Tone', '语气', 'Ton')}>
        <div className="flex gap-2 flex-wrap">
          {tones.map((tn) => (
            <button
              key={tn}
              className={`chip ${draft.tone === tn ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ tone: tn })}
            >
              {toneLabel(tn)}
            </button>
          ))}
        </div>
      </FieldCard>
    </div>
  );
}

function channelLabel(c: Channel): string {
  const map: Record<Channel, string> = {
    email: 'Email',
    slack: 'Slack / Discord',
    issue: 'Issue / Forum',
    in_person: 'In-person',
  };
  return map[c];
}

function toneLabel(tn: Tone): string {
  const map: Record<Tone, string> = {
    polite: 'Polite',
    direct: 'Direct',
    warm: 'Warm',
    urgent: 'Urgent',
  };
  return map[tn];
}

/* --- Text field step --- */
function TextFieldStep({
  field,
  value,
  onChange,
  placeholder,
  onRewrite,
  t,
  multiline,
}: {
  field: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onRewrite: (style: RewriteStyle) => void;
  t: T;
  multiline?: boolean;
}) {
  const rewriteButtons: { style: RewriteStyle; label: string }[] = [
    { style: 'clearer', label: t('Clearer', '更清晰', 'Plus clair') },
    { style: 'shorter', label: t('Shorter', '更简短', 'Plus court') },
    { style: 'more-polite', label: t('More polite', '更礼貌', 'Plus poli') },
    { style: 'more-direct', label: t('More direct', '更直接', 'Plus direct') },
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
              {IconWand({ size: 14 })} <span style={{ marginLeft: 2 }}>{rb.label}</span>
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
  t,
}: {
  tried: string[];
  updateDraft: (p: Partial<AskDraft>) => void;
  t: T;
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
      title={t("What you've tried", '已尝试的方法', 'Ce que vous avez essayé')}
      hint={t('List what you already attempted (at least 1 recommended)', '列出你已经做过的尝试（至少1项效果更好）', 'Listez ce que vous avez déjà essayé')}
    >
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-muted text-sm" style={{ minWidth: 20 }}>{i + 1}.</span>
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={t(`Attempt ${i + 1}…`, `尝试 ${i + 1}…`, `Tentative ${i + 1}…`)}
            aria-label={`Attempt ${i + 1}`}
          />
          {items.length > 1 && (
            <button className="btn-icon" onClick={() => remove(i)} aria-label="Remove attempt">
              <span aria-hidden="true" style={{ fontSize: '1rem', lineHeight: 1 }}>×</span>
            </button>
          )}
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={add} style={{ alignSelf: 'flex-start' }}>
        + {t('Add', '添加', 'Ajouter')}
      </button>
    </FieldCard>
  );
}

/* --- Ask step --- */
function AskStep({
  draft,
  updateDraft,
  t,
  onRewrite,
}: {
  draft: AskDraft;
  updateDraft: (p: Partial<AskDraft>) => void;
  t: T;
  onRewrite: (style: RewriteStyle) => void;
}) {
  const askTypes: { value: AskType; label: string }[] = [
    { value: 'answer', label: t('Answer', '回答', 'Réponse') },
    { value: 'direction', label: t('Direction', '方向', 'Direction') },
    { value: 'review', label: t('Review', '审查', 'Revue') },
    { value: 'confirm', label: t('Confirm', '确认', 'Confirmer') },
    { value: 'recommend', label: t('Recommend', '推荐', 'Recommander') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <FieldCard title={t('What do you need?', '请求类型', 'De quoi avez-vous besoin ?')} required>
        <div className="flex gap-2 flex-wrap">
          {askTypes.map((a) => (
            <button
              key={a.value}
              className={`chip ${draft.askType === a.value ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ askType: a.value })}
            >
              {a.label}
            </button>
          ))}
        </div>
      </FieldCard>

      <TextFieldStep
        field="askDetail"
        value={draft.askDetail}
        onChange={(v) => updateDraft({ askDetail: v })}
        placeholder={t('Describe specifically what you need…', '具体描述你需要什么…', 'Décrivez précisément ce dont vous avez besoin…')}
        onRewrite={onRewrite}
        t={t}
        multiline
      />
    </div>
  );
}

/* --- Timebox step --- */
function TimeboxStep({ draft, updateDraft, t }: { draft: AskDraft; updateDraft: (p: Partial<AskDraft>) => void; t: T }) {
  const options: TimeboxMin[] = [2, 5, 10, 15, 20];

  return (
    <div className="flex flex-col gap-4">
      <FieldCard title={t('Time estimate', '预计时间', 'Estimation du temps')} hint={t('How many minutes will this take them?', '对方大概需要花多少分钟？', 'Combien de minutes cela prendra-t-il ?')}>
        <div className="flex gap-2 flex-wrap">
          {options.map((m) => (
            <button
              key={m}
              className={`chip ${draft.timeboxMin === m ? 'chip-active' : ''}`}
              onClick={() => updateDraft({ timeboxMin: m })}
            >
              {m} {t('min', '分钟', 'min')}
            </button>
          ))}
        </div>
      </FieldCard>

      <FieldCard title={t('Deadline (optional)', '截止日期（可选）', 'Date limite (optionnel)')}>
        <input
          type="text"
          value={draft.deadline || ''}
          onChange={(e) => updateDraft({ deadline: e.target.value || null })}
          placeholder={t('e.g., Friday 5pm', '例如：周五 5pm 之前', 'ex. Vendredi 17h')}
          aria-label="Deadline"
        />
      </FieldCard>
    </div>
  );
}

/* --- Attachments step --- */
function AttachmentsStep({ draft, updateDraft, t }: { draft: AskDraft; updateDraft: (p: Partial<AskDraft>) => void; t: T }) {
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
      <FieldCard title={t('Reference links', '参考链接', 'Liens de référence')} hint={t('Add relevant links (optional)', '添加相关链接（可选）', 'Ajoutez des liens pertinents (optionnel)')}>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateLink(i, 'label', e.target.value)}
              placeholder={t('Label', '标签', 'Libellé')}
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
              <button className="btn-icon" onClick={() => removeLink(i)} aria-label="Remove link">
                <span aria-hidden="true" style={{ fontSize: '1rem', lineHeight: 1 }}>×</span>
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addLink} style={{ alignSelf: 'flex-start' }}>
          + {t('Add link', '添加链接', 'Ajouter un lien')}
        </button>
      </FieldCard>

      <FieldCard title={t('Attachments note', '附件说明', 'Note sur les pièces jointes')} hint={t('Describe screenshots or attachments (optional)', '描述截图或附件（可选）', 'Décrivez les captures ou pièces jointes (optionnel)')}>
        <textarea
          value={draft.attachmentsNote || ''}
          onChange={(e) => updateDraft({ attachmentsNote: e.target.value || null })}
          placeholder={t('e.g., See attached screenshot showing the error…', '例如：见附件截图，显示了错误信息…', "ex. Voir la capture d'écran jointe montrant l'erreur…")}
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
  t,
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
  t: T;
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
            <p className="text-sm font-semibold mb-2">{t('Improvement tips:', '改进建议：', "Conseils d'amélioration :")}</p>
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
          {IconSave({ size: 16 })} <span style={{ marginLeft: 4 }}>{t('Save to history', '保存到历史', 'Sauvegarder')}</span>
        </button>
        <button className="btn btn-outline" onClick={onNew}>
          {IconRefresh({ size: 16 })} <span style={{ marginLeft: 4 }}>{t('New request', '新建请求', 'Nouvelle demande')}</span>
        </button>
      </div>
    </div>
  );
}
