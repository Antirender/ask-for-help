/* ============================================================
   schema.ts — Data types for Ask-for-Help
   ============================================================ */

export type Lang = 'en' | 'zh' | 'fr' | 'mix';

export type RecipientType =
  | 'Professor'
  | 'TA'
  | 'Teammate'
  | 'Mentor'
  | 'Support'
  | 'Forum'
  | 'Other';

export type Channel = 'slack' | 'email' | 'issue' | 'in_person';

export type Tone = 'direct' | 'polite' | 'warm' | 'urgent';

export type AskType = 'answer' | 'direction' | 'review' | 'confirm' | 'recommend';

export type TimeboxMin = 2 | 5 | 10 | 15 | 20;

export interface LinkItem {
  label: string;
  url: string;
}

export interface AskDraft {
  id: string;
  lang: Lang;
  recipientType: RecipientType;
  channel: Channel;
  tone: Tone;
  goal: string;
  context: string;
  tried: string[];
  block: string;
  askType: AskType;
  askDetail: string;
  timeboxMin: TimeboxMin;
  deadline: string | null;
  links: LinkItem[];
  attachmentsNote: string | null;
}

export interface ScoreSummary {
  completeness: number; // 0–20
  clarity: number;      // 0–20
  effort: number;       // 0–20
  cost: number;         // 0–20
  tone: number;         // 0–20
  total: number;        // 0–100
  tips: string[];
}

export interface GeneratedOutput {
  short: string;
  standard: string;
  ultra: string;
  subjectLine?: string;
}

export interface EvidenceLogEntry {
  id: string;
  t: string; // ISO 8601
  draftId: string;
  recipientType: RecipientType;
  channel: Channel;
  tone: Tone;
  lang: Lang;
  score: ScoreSummary;
  finalOutput: GeneratedOutput;
  tags: string[];
}

/* ---------- Template preset type ---------- */
export interface TemplatePreset {
  id: string;
  recipientType: RecipientType;
  channel: Channel;
  tone: Tone;
  lang: Lang;
  label: string;
  description: string;
  defaults: Partial<AskDraft>;
}

/* ---------- Defaults / factories ---------- */
let _counter = 0;
export function uid(): string {
  return `ask_${Date.now()}_${++_counter}`;
}

export function emptyDraft(): AskDraft {
  return {
    id: uid(),
    lang: 'en',
    recipientType: 'Professor',
    channel: 'email',
    tone: 'polite',
    goal: '',
    context: '',
    tried: [],
    block: '',
    askType: 'direction',
    askDetail: '',
    timeboxMin: 5,
    deadline: null,
    links: [],
    attachmentsNote: null,
  };
}
