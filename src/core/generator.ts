/* ============================================================
   generator.ts — Final message generator (multi-channel, CN/EN)
   ============================================================ */

import type { AskDraft, GeneratedOutput } from './schema';
import phraseBankEn from '../data/phrase_bank_en.json';
import phraseBankZh from '../data/phrase_bank_zh.json';

type PhraseBank = typeof phraseBankEn;

function getBank(lang: string): PhraseBank {
  return lang === 'zh' ? phraseBankZh : phraseBankEn;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val || '…');
  }
  return result;
}

/* ---------- Generate all 3 output formats ---------- */
export function generateOutput(draft: AskDraft): GeneratedOutput {
  const standard = generateStandard(draft);
  const short = generateShort(draft);
  const ultra = generateUltra(draft);
  const subjectLine = draft.channel === 'email' ? generateSubjectLine(draft) : undefined;

  return { short, standard, ultra, subjectLine };
}

/* ---------- Standard version (structured, bullets) ---------- */
function generateStandard(draft: AskDraft): string {
  const bank = getBank(draft.lang);
  const isZh = draft.lang === 'zh';

  const sections: string[] = [];

  // Salutation
  const salutations = bank.salutations[draft.tone] || bank.salutations['polite'];
  sections.push(fillTemplate(pick(salutations), { name: '' }).replace(/\s*\{name\}\s*/g, '').trim());

  sections.push('');

  // Goal
  if (draft.goal.trim()) {
    const goalPhrase = fillTemplate(pick(bank.goal_starters), { goal: draft.goal.trim() });
    sections.push(isZh ? `**目标：** ${goalPhrase}` : `**Goal:** ${goalPhrase}`);
  } else {
    sections.push(isZh ? '**目标：** [请补充你的目标]' : '**Goal:** [Please add your goal]');
  }

  // Context
  if (draft.context.trim()) {
    const ctxPhrase = fillTemplate(pick(bank.context_phrases), { context: draft.context.trim() });
    sections.push(isZh ? `**背景：** ${ctxPhrase}` : `**Context:** ${ctxPhrase}`);
  }

  // Tried
  const realTried = draft.tried.filter((t) => t.trim());
  if (realTried.length > 0) {
    sections.push(isZh ? '**已尝试：**' : '**What I\'ve tried:**');
    realTried.forEach((t) => sections.push(`  • ${t.trim()}`));
  } else {
    sections.push(isZh ? '**已尝试：** [建议添加你已尝试的方法]' : '**What I\'ve tried:** [Consider adding what you\'ve tried]');
  }

  // Block
  if (draft.block.trim()) {
    const blockPhrase = fillTemplate(pick(bank.block_phrases), { block: draft.block.trim() });
    sections.push(isZh ? `**卡点：** ${blockPhrase}` : `**Where I\'m stuck:** ${blockPhrase}`);
  }

  // Ask
  if (draft.askDetail.trim()) {
    const askPhrases = bank.ask_phrases[draft.askType] || bank.ask_phrases['direction'];
    const askPhrase = fillTemplate(pick(askPhrases), { detail: draft.askDetail.trim() });
    sections.push(isZh ? `**请求：** ${askPhrase}` : `**Ask:** ${askPhrase}`);
  } else {
    sections.push(isZh ? '**请求：** [请补充具体请求]' : '**Ask:** [Please specify your request]');
  }

  // Timebox
  const timePhrase = fillTemplate(pick(bank.timebox_phrases), { min: String(draft.timeboxMin) });
  sections.push(isZh ? `**时间：** ${timePhrase}` : `**Time:** ${timePhrase}`);

  // Deadline
  if (draft.deadline) {
    sections.push(isZh ? `**截止日期：** ${draft.deadline}` : `**Deadline:** ${draft.deadline}`);
  }

  // Links
  if (draft.links.length > 0) {
    sections.push(isZh ? '**参考链接：**' : '**References:**');
    draft.links.forEach((l) => sections.push(`  • ${l.label}: ${l.url}`));
  }

  sections.push('');

  // Exit option
  sections.push(pick(bank.exit_options));

  sections.push('');

  // Closing
  const closings = bank.closings[draft.tone] || bank.closings['polite'];
  sections.push(pick(closings));

  return formatForChannel(sections.join('\n'), draft.channel);
}

/* ---------- Short version (≤ 6 lines) ---------- */
function generateShort(draft: AskDraft): string {
  const bank = getBank(draft.lang);
  const isZh = draft.lang === 'zh';

  const lines: string[] = [];

  // Salutation
  const salutations = bank.salutations[draft.tone] || bank.salutations['polite'];
  lines.push(fillTemplate(pick(salutations), { name: '' }).replace(/\s*\{name\}\s*/g, '').trim());

  // Goal + Context combined
  const goalLine = draft.goal.trim() || (isZh ? '[目标]' : '[Goal]');
  const contextBit = draft.context.trim() ? ` ${draft.context.trim()}` : '';
  lines.push(`${goalLine}.${contextBit}`);

  // Tried + Block combined
  const triedBit = draft.tried.filter((t) => t.trim()).join(', ');
  if (triedBit || draft.block.trim()) {
    lines.push(
      isZh
        ? `已尝试：${triedBit || '—'}。卡点：${draft.block.trim() || '—'}`
        : `Tried: ${triedBit || '—'}. Stuck at: ${draft.block.trim() || '—'}`,
    );
  }

  // Ask
  const askPhrases = bank.ask_phrases[draft.askType] || bank.ask_phrases['direction'];
  lines.push(fillTemplate(pick(askPhrases), { detail: draft.askDetail.trim() || '…' }));

  // Timebox + exit
  lines.push(fillTemplate(pick(bank.timebox_phrases), { min: String(draft.timeboxMin) }));

  // Closing
  const closings = bank.closings[draft.tone] || bank.closings['polite'];
  lines.push(pick(closings));

  return formatForChannel(lines.join('\n'), draft.channel);
}

/* ---------- Ultra-short (1–2 lines) ---------- */
function generateUltra(draft: AskDraft): string {
  const isZh = draft.lang === 'zh';
  const goal = draft.goal.trim() || (isZh ? '[目标]' : '[goal]');
  const ask = draft.askDetail.trim() || (isZh ? '[请求]' : '[ask]');

  if (isZh) {
    return `你好，关于 ${goal}——${ask}。大约需要 ${draft.timeboxMin} 分钟。如果不方便也没关系。谢谢！`;
  }
  return `Hi — regarding ${goal}: ${ask}. ~${draft.timeboxMin} min. No worries if busy. Thanks!`;
}

/* ---------- Subject line (email) ---------- */
function generateSubjectLine(draft: AskDraft): string {
  const bank = getBank(draft.lang);
  const subjectOptions = bank.subject_lines[draft.tone] || bank.subject_lines['polite'];
  const topic = draft.goal.trim().slice(0, 40) || (draft.lang === 'zh' ? '问题' : 'a question');
  return fillTemplate(pick(subjectOptions), {
    topic,
    course: '',
    deadline: draft.deadline || '',
  }).replace(/\s*—\s*$/, '');
}

/* ---------- Channel formatting ---------- */
function formatForChannel(text: string, channel: string): string {
  switch (channel) {
    case 'slack':
      // Convert markdown bold to Slack bold
      return text.replace(/\*\*(.*?)\*\*/g, '*$1*');
    case 'issue':
      // Keep markdown
      return text;
    case 'in_person':
      // Strip markdown, add script cues
      return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^/gm, '');
    case 'email':
    default:
      return text;
  }
}
