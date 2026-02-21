/* ============================================================
   Library.tsx — Templates & phrase bank browser
   ============================================================ */

import { useState, useEffect } from 'react';
import TemplatePicker from '../ui/TemplatePicker';
import { getGlobalLang } from '../ui/AppShell';
import phraseBankEn from '../data/phrase_bank_en.json';
import phraseBankZh from '../data/phrase_bank_zh.json';
import phraseBankFr from '../data/phrase_bank_fr.json';
import type { AskDraft } from '../core/schema';

export default function Library() {
  const [uiLang, setUiLang] = useState(getGlobalLang);
  const [tab, setTab] = useState<'templates' | 'phrases'>('templates');

  useEffect(() => {
    const handler = () => setUiLang(getGlobalLang());
    window.addEventListener('ask4help_lang_change', handler);
    return () => window.removeEventListener('ask4help_lang_change', handler);
  }, []);

  const bank = uiLang === 'zh' ? phraseBankZh : uiLang === 'fr' ? phraseBankFr : phraseBankEn;
  const isZh = uiLang === 'zh';
  const isFr = uiLang === 'fr';
  const t = (en: string, zh: string, fr: string) => isZh ? zh : isFr ? fr : en;

  const handleSelect = (patch: Partial<AskDraft>) => {
    const saved = localStorage.getItem('ask4help_draft');
    const draft = saved ? JSON.parse(saved) : {};
    localStorage.setItem('ask4help_draft', JSON.stringify({ ...draft, ...patch }));
    window.location.hash = '#/build';
  };

  return (
    <div className="container page-enter">
      <h1 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
        {t('Template Library', '模板与短语库', 'Bibliothèque de modèles')}
      </h1>
      <p className="text-muted text-sm mb-6">
        {t(
          'Pick a template to quick-start, or browse common phrases.',
          '选择一个模板快速开始，或浏览常用短语。',
          'Choisissez un modèle pour démarrer, ou parcourez les phrases courantes.'
        )}
      </p>

      {/* Tab controls only — lang comes from global header */}
      <div className="flex gap-3 items-center mb-6 flex-wrap">
        <div className="flex gap-2">
          <button className={`chip ${tab === 'templates' ? 'chip-active' : ''}`} onClick={() => setTab('templates')}>
            {t('Templates', '模板', 'Modèles')}
          </button>
          <button className={`chip ${tab === 'phrases' ? 'chip-active' : ''}`} onClick={() => setTab('phrases')}>
            {t('Phrase Bank', '短语库', 'Banque de phrases')}
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === 'templates' && <TemplatePicker lang={uiLang} onSelect={handleSelect} />}

      {tab === 'phrases' && (
        <div className="phrase-sections">
          <PhraseSection title={t('Salutations', '打招呼', 'Salutations')} data={bank.salutations} />
          <PhraseSection title={t('Closings', '结尾', 'Conclusions')} data={bank.closings} />
          <PhraseSection title={t('Goal starters', '目标句式', 'Débuts d\'objectif')} data={bank.goal_starters} isList />
          <PhraseSection title={t('Context phrases', '背景句式', 'Phrases de contexte')} data={bank.context_phrases} isList />
          <PhraseSection title={t('Ask phrases', '请求句式', 'Phrases de demande')} data={bank.ask_phrases} />
          <PhraseSection title={t('Timebox phrases', '时间句式', 'Phrases de délai')} data={bank.timebox_phrases} isList />
          <PhraseSection title={t('Exit options', '退出选项', 'Options de sortie')} data={bank.exit_options} isList />
          <PhraseSection title={t('Subject lines', '邮件主题', 'Lignes d\'objet')} data={bank.subject_lines} />
        </div>
      )}
    </div>
  );
}

/* --- Phrase section display --- */
function PhraseSection({ title, data, isList }: { title: string; data: unknown; isList?: boolean }) {
  if (isList && Array.isArray(data)) {
    return (
      <div className="card mb-4">
        <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
          {title}
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.map((item, i) => (
            <li key={i} className="phrase-item">{item as string}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (typeof data === 'object' && data !== null) {
    return (
      <div className="card mb-4">
        <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
          {title}
        </h3>
        {Object.entries(data as Record<string, unknown>).map(([key, values]) => (
          <div key={key} style={{ marginBottom: 'var(--sp-3)' }}>
            <span className="badge badge-outline mb-2" style={{ display: 'inline-block' }}>{key}</span>
            {Array.isArray(values) && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {values.map((item, i) => (
                  <li key={i} className="phrase-item">{item as string}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
