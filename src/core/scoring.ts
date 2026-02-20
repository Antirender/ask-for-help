/* ============================================================
   scoring.ts — Explainable quality score for AskDraft
   ============================================================ */

import type { AskDraft, ScoreSummary, Tone, Channel } from './schema';

/* Each dimension: 0–20, total 0–100 */

export function scoreDraft(draft: AskDraft): ScoreSummary {
  const completeness = scoreCompleteness(draft);
  const clarity = scoreClarity(draft);
  const effort = scoreEffort(draft);
  const cost = scoreCost(draft);
  const tone = scoreTone(draft);
  const total = completeness + clarity + effort + cost + tone;
  const tips = generateTips(draft, { completeness, clarity, effort, cost, tone });

  return { completeness, clarity, effort, cost, tone, total, tips };
}

/* ---------- Completeness (0–20) ---------- */
function scoreCompleteness(d: AskDraft): number {
  let s = 0;
  if (d.goal.trim()) s += 4;
  if (d.context.trim()) s += 3;
  if (d.tried.some((t) => t.trim())) s += 4;
  if (d.block.trim()) s += 3;
  if (d.askDetail.trim()) s += 4;
  if (d.timeboxMin) s += 2;
  return s;
}

/* ---------- Clarity (0–20) ---------- */
function scoreClarity(d: AskDraft): number {
  let s = 0;

  // Goal clarity: not too short, not too long
  const goalLen = d.goal.trim().length;
  if (goalLen > 10 && goalLen < 200) s += 5;
  else if (goalLen > 0) s += 2;

  // Has a specific ask type (not just "help me")
  if (d.askType) s += 5;

  // Ask detail present and specific
  const askLen = d.askDetail.trim().length;
  if (askLen > 10) s += 5;
  else if (askLen > 0) s += 2;

  // Block is specific
  if (d.block.trim().length > 10) s += 5;
  else if (d.block.trim()) s += 2;

  return Math.min(20, s);
}

/* ---------- Effort (0–20): shows what was already tried ---------- */
function scoreEffort(d: AskDraft): number {
  const real = d.tried.filter((t) => t.trim());
  if (real.length >= 3) return 20;
  if (real.length === 2) return 15;
  if (real.length === 1) return 10;
  return 0;
}

/* ---------- Cost (0–20): respects recipient's time ---------- */
function scoreCost(d: AskDraft): number {
  let s = 0;

  // Has timebox
  if (d.timeboxMin) s += 8;

  // Total content length reasonable
  const total = (d.goal + d.context + d.tried.join(' ') + d.block + d.askDetail).length;
  if (total < 500) s += 6;
  else if (total < 800) s += 3;

  // Has links (shows self-service)
  if (d.links.length > 0) s += 3;

  // Deadline info (helps them prioritize)
  if (d.deadline) s += 3;

  return Math.min(20, s);
}

/* ---------- Tone (0–20): matches channel/urgency ---------- */
function scoreTone(d: AskDraft): number {
  let s = 10; // baseline

  // Appropriate tone for channel
  const goodCombos: Record<Channel, Tone[]> = {
    email: ['polite', 'urgent'],
    slack: ['direct', 'warm', 'urgent'],
    issue: ['direct', 'polite'],
    in_person: ['polite', 'warm'],
  };

  if (goodCombos[d.channel]?.includes(d.tone)) s += 5;

  // Appropriate tone for recipient
  const formalRecipients = ['Professor', 'Support', 'Mentor'];
  if (formalRecipients.includes(d.recipientType) && (d.tone === 'polite' || d.tone === 'urgent')) {
    s += 5;
  } else if (!formalRecipients.includes(d.recipientType)) {
    s += 5; // any tone OK for peers
  }

  return Math.min(20, s);
}

/* ---------- Actionable tips ---------- */
function generateTips(
  d: AskDraft,
  scores: { completeness: number; clarity: number; effort: number; cost: number; tone: number },
): string[] {
  const tips: string[] = [];
  const isZh = d.lang === 'zh';

  if (scores.completeness < 15) {
    const missing: string[] = [];
    if (!d.goal.trim()) missing.push(isZh ? '目标' : 'goal');
    if (!d.context.trim()) missing.push(isZh ? '背景' : 'context');
    if (!d.tried.some((t) => t.trim())) missing.push(isZh ? '已尝试' : 'tried');
    if (!d.block.trim()) missing.push(isZh ? '卡点' : 'block');
    if (!d.askDetail.trim()) missing.push(isZh ? '具体请求' : 'ask detail');
    tips.push(
      isZh
        ? `补充以下缺失信息：${missing.join('、')}`
        : `Fill in missing fields: ${missing.join(', ')}`,
    );
  }

  if (scores.clarity < 12) {
    tips.push(
      isZh
        ? '让请求更具体——用一句话说明你需要对方做什么。'
        : 'Make your ask more specific — state exactly what you need in one sentence.',
    );
  }

  if (scores.effort < 10) {
    tips.push(
      isZh
        ? '至少添加一项你已尝试的——这能减少来回沟通。'
        : 'Add at least one thing you\'ve already tried — it reduces back-and-forth.',
    );
  }

  if (scores.cost < 12) {
    tips.push(
      isZh
        ? '添加时间估计让对方知道需要投入多少时间。'
        : 'Add a timebox so they know how much time to invest.',
    );
  }

  if (scores.tone < 15) {
    tips.push(
      isZh
        ? '检查语气是否匹配你的沟通方式和对象。'
        : 'Check if tone matches your channel and recipient.',
    );
  }

  return tips.slice(0, 3);
}

/* ---------- Score color ---------- */
export function scoreColor(total: number): string {
  if (total >= 80) return 'var(--clr-success)';
  if (total >= 60) return 'var(--clr-primary)';
  if (total >= 40) return 'var(--clr-warning)';
  return 'var(--clr-error)';
}

export function scoreLabel(total: number, lang: string): string {
  if (lang === 'zh') {
    if (total >= 80) return '优秀';
    if (total >= 60) return '良好';
    if (total >= 40) return '还行';
    return '需改进';
  }
  if (total >= 80) return 'Excellent';
  if (total >= 60) return 'Good';
  if (total >= 40) return 'Fair';
  return 'Needs work';
}
