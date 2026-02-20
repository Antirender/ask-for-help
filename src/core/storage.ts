/* ============================================================
   storage.ts — Local-only persistence (localStorage)
   ============================================================ */

import type { EvidenceLogEntry, AskDraft, GeneratedOutput, ScoreSummary } from './schema';
import { uid } from './schema';

const STORAGE_KEY = 'ask4help_history';

/* ---------- Read all entries ---------- */
export function loadHistory(): EvidenceLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EvidenceLogEntry[];
  } catch {
    return [];
  }
}

/* ---------- Save a new entry ---------- */
export function saveToHistory(
  draft: AskDraft,
  output: GeneratedOutput,
  score: ScoreSummary,
  tags: string[] = [],
): EvidenceLogEntry {
  const entry: EvidenceLogEntry = {
    id: uid(),
    t: new Date().toISOString(),
    draftId: draft.id,
    recipientType: draft.recipientType,
    channel: draft.channel,
    tone: draft.tone,
    lang: draft.lang,
    score,
    finalOutput: output,
    tags,
  };

  const history = loadHistory();
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return entry;
}

/* ---------- Delete single ---------- */
export function deleteEntry(id: string): void {
  const history = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/* ---------- Delete all ---------- */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/* ---------- Export JSON ---------- */
export function exportJSON(entries?: EvidenceLogEntry[]): string {
  const data = entries || loadHistory();
  return JSON.stringify(data, null, 2);
}

/* ---------- Export CSV ---------- */
export function exportCSV(entries?: EvidenceLogEntry[]): string {
  const data = entries || loadHistory();
  if (data.length === 0) return '';

  const headers = [
    'id',
    'timestamp',
    'recipientType',
    'channel',
    'tone',
    'lang',
    'score_total',
    'score_completeness',
    'score_clarity',
    'score_effort',
    'score_cost',
    'score_tone',
    'output_ultra',
    'output_short',
    'output_standard',
    'tags',
  ];

  const rows = data.map((e) => [
    e.id,
    e.t,
    e.recipientType,
    e.channel,
    e.tone,
    e.lang,
    e.score.total,
    e.score.completeness,
    e.score.clarity,
    e.score.effort,
    e.score.cost,
    e.score.tone,
    csvEscape(e.finalOutput.ultra),
    csvEscape(e.finalOutput.short),
    csvEscape(e.finalOutput.standard),
    e.tags.join(';'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function csvEscape(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/* ---------- Blob download helper ---------- */
export function downloadBlob(content: string, filename: string, mime = 'application/json'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- Draft auto-save ---------- */
const DRAFT_KEY = 'ask4help_draft';

export function saveDraft(draft: AskDraft): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): AskDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AskDraft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
