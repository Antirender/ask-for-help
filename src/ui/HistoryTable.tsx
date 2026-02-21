/* ============================================================
   HistoryTable.tsx — Evidence list, filters, export
   ============================================================ */

import { useState } from 'react';
import type { EvidenceLogEntry, Channel, Tone, RecipientType } from '../core/schema';
import { scoreColor, scoreLabel } from '../core/scoring';
import { IconFileText, IconTrash } from './Icons';

interface Props {
  entries: EvidenceLogEntry[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export default function HistoryTable({ entries, onDelete, onDeleteAll, onExportJSON, onExportCSV }: Props) {
  const [filterChannel, setFilterChannel] = useState<Channel | ''>('');
  const [filterTone, setFilterTone] = useState<Tone | ''>('');
  const [filterRecipient, setFilterRecipient] = useState<RecipientType | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = entries.filter((e) => {
    if (filterChannel && e.channel !== filterChannel) return false;
    if (filterTone && e.tone !== filterTone) return false;
    if (filterRecipient && e.recipientType !== filterRecipient) return false;
    return true;
  });

  if (entries.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '48px 24px' }}>
        <p className="text-muted">No history yet. Build your first ask to see it here!</p>
      </div>
    );
  }

  return (
    <div className="history-table">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center mb-4">
        <div className="input-field" style={{ width: 140 }}>
          <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value as Channel | '')}>
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="slack">Slack/DM</option>
            <option value="issue">Issue/Forum</option>
            <option value="in_person">In-person</option>
          </select>
        </div>
        <div className="input-field" style={{ width: 120 }}>
          <select value={filterTone} onChange={(e) => setFilterTone(e.target.value as Tone | '')}>
            <option value="">All Tones</option>
            <option value="polite">Polite</option>
            <option value="direct">Direct</option>
            <option value="warm">Warm</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="input-field" style={{ width: 140 }}>
          <select value={filterRecipient} onChange={(e) => setFilterRecipient(e.target.value as RecipientType | '')}>
            <option value="">All Recipients</option>
            <option value="Professor">Professor</option>
            <option value="TA">TA</option>
            <option value="Teammate">Teammate</option>
            <option value="Mentor">Mentor</option>
            <option value="Support">Support</option>
            <option value="Forum">Forum</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }} className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={onExportJSON} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {IconFileText({ size: 14 })} JSON
          </button>
          <button className="btn btn-outline btn-sm" onClick={onExportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {IconFileText({ size: 14 })} CSV
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onDeleteAll} style={{ color: 'var(--clr-error)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {IconTrash({ size: 14 })} Clear All
          </button>
        </div>
      </div>

      <p className="text-sm text-muted mb-4">
        {filtered.length} of {entries.length} entries shown
      </p>

      {/* Entries */}
      <div className="history-list">
        {filtered.map((entry) => (
          <div key={entry.id} className="card history-entry" style={{ marginBottom: 'var(--sp-3)' }}>
            <div
              className="history-entry-header"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              aria-expanded={expandedId === entry.id}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedId(expandedId === entry.id ? null : entry.id);
                }
              }}
            >
              <div className="flex items-center gap-3" style={{ flex: 1 }}>
                <div
                  className="score-ring"
                  style={{
                    width: 40,
                    height: 40,
                    fontSize: 'var(--fs-sm)',
                    border: `3px solid ${scoreColor(entry.score.total)}`,
                    color: scoreColor(entry.score.total),
                  }}
                >
                  {entry.score.total}
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {entry.recipientType} · {entry.channel} · {entry.tone}
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(entry.t).toLocaleString()} — {scoreLabel(entry.score.total, entry.lang)}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {entry.tags.map((t) => (
                  <span key={t} className="badge badge-outline">{t}</span>
                ))}
              </div>
              <span style={{ marginLeft: 8 }}>{expandedId === entry.id ? '▾' : '▸'}</span>
            </div>

            {expandedId === entry.id && (
              <div className="history-entry-body" style={{ marginTop: 'var(--sp-3)' }}>
                <div style={{ marginBottom: 'var(--sp-3)' }}>
                  <strong className="text-sm">Ultra-short:</strong>
                  <pre className="preview-body" style={{ marginTop: 4 }}>{entry.finalOutput.ultra}</pre>
                </div>
                <div style={{ marginBottom: 'var(--sp-3)' }}>
                  <strong className="text-sm">Short:</strong>
                  <pre className="preview-body" style={{ marginTop: 4 }}>{entry.finalOutput.short}</pre>
                </div>
                <div style={{ marginBottom: 'var(--sp-3)' }}>
                  <strong className="text-sm">Standard:</strong>
                  <pre className="preview-body" style={{ marginTop: 4 }}>{entry.finalOutput.standard}</pre>
                </div>
                <div className="flex justify-between items-center" style={{ marginTop: 'var(--sp-3)' }}>
                  <div className="text-xs text-muted">
                    Score: C={entry.score.completeness} Cl={entry.score.clarity} E={entry.score.effort} Co={entry.score.cost} T={entry.score.tone}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDelete(entry.id)}
                    style={{ color: 'var(--clr-error)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    {IconTrash({ size: 14 })} Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .history-entry-header {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
        }
        .preview-body {
          font-family: var(--font-family);
          font-size: var(--fs-xs);
          line-height: var(--lh-normal);
          white-space: pre-wrap;
          word-break: break-word;
          background: var(--bg);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: var(--sp-3);
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
