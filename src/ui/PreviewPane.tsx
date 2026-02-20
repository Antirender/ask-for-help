/* ============================================================
   PreviewPane.tsx — Live preview + copy + download
   ============================================================ */

import { useState } from 'react';
import type { GeneratedOutput } from '../core/schema';

interface Props {
  output: GeneratedOutput;
  lang: string;
}

type Tab = 'standard' | 'short' | 'ultra';

export default function PreviewPane({ output, lang }: Props) {
  const [tab, setTab] = useState<Tab>('standard');
  const [copied, setCopied] = useState(false);

  const content = output[tab];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const download = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ask-for-help-${tab}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isZh = lang === 'zh';
  const tabs: { id: Tab; label: string }[] = [
    { id: 'standard', label: isZh ? '完整版' : 'Standard' },
    { id: 'short', label: isZh ? '简短版' : 'Short' },
    { id: 'ultra', label: isZh ? '极简版' : 'Ultra-short' },
  ];

  return (
    <div className="preview-pane card">
      <div className="preview-header">
        <div className="preview-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`chip ${tab === t.id ? 'chip-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={copy}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={download}>
            💾 .txt
          </button>
        </div>
      </div>

      {output.subjectLine && tab === 'standard' && (
        <div className="preview-subject">
          <strong>{isZh ? '主题：' : 'Subject:'}</strong> {output.subjectLine}
        </div>
      )}

      <pre className="preview-body">{content || (isZh ? '（预览为空）' : '(empty preview)')}</pre>

      <style>{`
        .preview-pane { overflow: hidden; }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--sp-2);
          margin-bottom: var(--sp-3);
        }
        .preview-tabs { display: flex; gap: var(--sp-2); }
        .preview-subject {
          padding: var(--sp-2) var(--sp-3);
          background: color-mix(in srgb, var(--accent) 6%, transparent);
          border-radius: var(--radius-sm);
          font-size: var(--fs-sm);
          margin-bottom: var(--sp-3);
        }
        .preview-body {
          font-family: var(--font-family);
          font-size: var(--fs-sm);
          line-height: var(--lh-normal);
          white-space: pre-wrap;
          word-break: break-word;
          background: var(--bg);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: var(--sp-4);
          max-height: 400px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
