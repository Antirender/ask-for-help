/* ============================================================
   TemplatePicker.tsx — Recipient/channel presets, quick-start
   ============================================================ */

import type { TemplatePreset, AskDraft } from '../core/schema';
import templates from '../data/templates.json';

interface Props {
  lang: string;
  onSelect: (patch: Partial<AskDraft>) => void;
}

export default function TemplatePicker({ lang, onSelect }: Props) {
  const filtered = (templates as TemplatePreset[]).filter(
    (t) => t.lang === lang || t.lang === 'en', // show all if not matching
  );

  return (
    <div className="template-picker">
      <div className="template-grid">
        {filtered.map((t) => (
          <button
            key={t.id}
            className="card card-interactive template-card"
            onClick={() => onSelect({ ...t.defaults })}
          >
            <div className="template-icon">{channelIcon(t.channel)}</div>
            <div className="template-info">
              <strong className="text-sm">{t.label}</strong>
              <p className="text-xs text-muted">{t.description}</p>
            </div>
            <div className="flex gap-1 flex-wrap" style={{ marginTop: 8 }}>
              <span className="badge badge-outline">{t.recipientType}</span>
              <span className="badge badge-outline">{t.channel}</span>
              <span className="badge badge-outline">{t.tone}</span>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: var(--sp-4);
        }
        .template-card {
          text-align: left;
          border: none;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          flex-direction: column;
          transition: box-shadow var(--dur-fast), transform var(--dur-fast);
        }
        .template-card:hover { transform: translateY(-2px); }
        .template-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .template-info strong { display: block; margin-bottom: 2px; }
      `}</style>
    </div>
  );
}

function channelIcon(channel: string): string {
  switch (channel) {
    case 'email': return '📧';
    case 'slack': return '💬';
    case 'issue': return '🐛';
    case 'in_person': return '🗣️';
    default: return '📝';
  }
}
