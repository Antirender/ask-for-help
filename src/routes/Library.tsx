/* ============================================================
   Library.tsx — Templates & phrase bank browser
   ============================================================ */

import { useState } from 'react';
import TemplatePicker from '../ui/TemplatePicker';
import phraseBankEn from '../data/phrase_bank_en.json';
import phraseBankZh from '../data/phrase_bank_zh.json';
import type { AskDraft } from '../core/schema';

export default function Library() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [tab, setTab] = useState<'templates' | 'phrases'>('templates');
  const bank = lang === 'zh' ? phraseBankZh : phraseBankEn;

  const handleSelect = (patch: Partial<AskDraft>) => {
    // Save selection to draft and navigate to builder
    const saved = localStorage.getItem('ask4help_draft');
    const draft = saved ? JSON.parse(saved) : {};
    localStorage.setItem('ask4help_draft', JSON.stringify({ ...draft, ...patch }));
    window.location.hash = '#/build';
  };

  return (
    <div className="container page-enter">
      <h1 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
        📚 {lang === 'zh' ? '模板与短语库' : 'Template Library'}
      </h1>
      <p className="text-muted text-sm mb-6">
        {lang === 'zh'
          ? '选择一个模板快速开始，或浏览常用短语。'
          : 'Pick a template to quick-start, or browse common phrases.'}
      </p>

      {/* Controls */}
      <div className="flex gap-3 items-center mb-6 flex-wrap">
        <div className="flex gap-2">
          <button className={`chip ${tab === 'templates' ? 'chip-active' : ''}`} onClick={() => setTab('templates')}>
            {lang === 'zh' ? '模板' : 'Templates'}
          </button>
          <button className={`chip ${tab === 'phrases' ? 'chip-active' : ''}`} onClick={() => setTab('phrases')}>
            {lang === 'zh' ? '短语库' : 'Phrase Bank'}
          </button>
        </div>
        <div className="flex gap-2" style={{ marginLeft: 'auto' }}>
          <button className={`chip ${lang === 'en' ? 'chip-active' : ''}`} onClick={() => setLang('en')}>
            EN
          </button>
          <button className={`chip ${lang === 'zh' ? 'chip-active' : ''}`} onClick={() => setLang('zh')}>
            中文
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === 'templates' && <TemplatePicker lang={lang} onSelect={handleSelect} />}

      {tab === 'phrases' && (
        <div className="phrase-sections">
          <PhraseSection title={lang === 'zh' ? '打招呼' : 'Salutations'} data={bank.salutations} />
          <PhraseSection title={lang === 'zh' ? '结尾' : 'Closings'} data={bank.closings} />
          <PhraseSection title={lang === 'zh' ? '目标句式' : 'Goal starters'} data={bank.goal_starters} isList />
          <PhraseSection title={lang === 'zh' ? '背景句式' : 'Context phrases'} data={bank.context_phrases} isList />
          <PhraseSection title={lang === 'zh' ? '请求句式' : 'Ask phrases'} data={bank.ask_phrases} />
          <PhraseSection title={lang === 'zh' ? '时间句式' : 'Timebox phrases'} data={bank.timebox_phrases} isList />
          <PhraseSection title={lang === 'zh' ? '退出选项' : 'Exit options'} data={bank.exit_options} isList />
          <PhraseSection title={lang === 'zh' ? '邮件主题' : 'Subject lines'} data={bank.subject_lines} />
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
