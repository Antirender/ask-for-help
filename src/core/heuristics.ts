/* ============================================================
   heuristics.ts — Pseudo-AI rules engine
   ============================================================ */

import type { AskDraft } from './schema';

export interface Suggestion {
  id: string;
  priority: 'do-now' | 'nice-to-have';
  message: string;
  messageZh: string;
  field?: keyof AskDraft;
  autoFix?: Partial<AskDraft>;
}

/* ---------- Rule definitions ---------- */
export function analyzeAskDraft(draft: AskDraft): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let sid = 0;
  const s = (
    priority: Suggestion['priority'],
    message: string,
    messageZh: string,
    field?: keyof AskDraft,
    autoFix?: Partial<AskDraft>,
  ): void => {
    suggestions.push({ id: `h${++sid}`, priority, message, messageZh, field, autoFix });
  };

  // --- Goal ---
  if (!draft.goal.trim()) {
    s('do-now', 'Add a goal — what does "done" look like?', '添加目标——"完成"是什么样子？', 'goal');
  } else if (draft.goal.trim().length < 10) {
    s('nice-to-have', 'Goal is very short. Try: "I want to [outcome]."', '目标太短了。试试："我想要[结果]。"', 'goal');
  }

  // --- Context ---
  if (!draft.context.trim()) {
    s('nice-to-have', 'Adding 1–2 sentences of context helps the reader understand faster.', '添加1-2句背景可以帮助读者更快理解。', 'context');
  }

  // --- Tried ---
  const realTried = draft.tried.filter((t) => t.trim());
  if (realTried.length === 0) {
    s('do-now', 'List at least one thing you tried — it prevents "have you tried…" replies.', '至少列出一项你已尝试的——可以避免对方问"你试过…吗？"', 'tried');
  }

  // --- Block ---
  if (!draft.block.trim()) {
    s('nice-to-have', 'Describe where you\'re stuck — this helps the reader focus their answer.', '描述你卡在哪里——这能帮助对方聚焦回答。', 'block');
  }

  // --- Ask ---
  if (!draft.askDetail.trim()) {
    s('do-now', 'Specify what you need — a concrete ask gets faster responses.', '说明你需要什么——具体的请求能获得更快的回应。', 'askDetail');
  }
  if (draft.askDetail.trim().toLowerCase().match(/^(help me|help|please help|帮帮我|帮忙)$/)) {
    s('do-now', '"Help me" is too vague. Pick an ask type: answer / direction / review / confirm / recommend.', '"帮帮我"太笼统了。选择一个请求类型：回答/指方向/审查/确认/推荐。', 'askType');
  }

  // --- Timebox ---
  if (draft.timeboxMin === undefined) {
    s('nice-to-have', 'Add a timebox (e.g., 5 min) — it shows respect for their time.', '添加时间估计（如5分钟）——表示你尊重对方的时间。', 'timeboxMin', { timeboxMin: 5 });
  }

  // --- Tone mismatch ---
  if (draft.tone === 'urgent' && draft.channel === 'in_person') {
    s('nice-to-have', 'Urgent + in-person can feel pressuring. Consider softening the tone.', '紧急+面对面可能会给人压力。考虑稍微缓和一下语气。');
  }
  if (draft.tone === 'warm' && draft.recipientType === 'Professor') {
    s('nice-to-have', 'Warm tone to professors can feel too casual. "Polite" might be safer.', '给教授用热情语气可能太随意了。"礼貌"可能更合适。');
  }

  // --- Length checks ---
  const totalLen = (draft.goal + draft.context + draft.tried.join(' ') + draft.block + draft.askDetail).length;
  if (totalLen > 800) {
    s('nice-to-have', 'Your request is getting long. Consider linking to details and keeping the message shorter.', '你的请求有点长了。考虑把细节放在链接中，保持消息简短。');
  }

  // Limit to 3+3
  const doNow = suggestions.filter((x) => x.priority === 'do-now').slice(0, 3);
  const niceToHave = suggestions.filter((x) => x.priority === 'nice-to-have').slice(0, 3);
  return [...doNow, ...niceToHave];
}

/* ---------- Inline rewrites ---------- */
export type RewriteStyle = 'clearer' | 'shorter' | 'more-polite' | 'more-direct';

export function rewriteText(text: string, style: RewriteStyle, lang: 'en' | 'zh'): string {
  if (!text.trim()) return text;

  switch (style) {
    case 'shorter':
      // Simple heuristic: take first sentence, trim fillers
      return shortenText(text, lang);
    case 'clearer':
      return clarifyText(text, lang);
    case 'more-polite':
      return politenText(text, lang);
    case 'more-direct':
      return directenText(text, lang);
    default:
      return text;
  }
}

function shortenText(text: string, lang: string): string {
  if (lang === 'zh') {
    const sentences = text.split(/[。！？；]/).filter(Boolean);
    return sentences.slice(0, 2).join('。') + '。';
  }
  const sentences = text.split(/[.!?]/).filter((s) => s.trim());
  return sentences.slice(0, 2).join('. ').trim() + '.';
}

function clarifyText(text: string, lang: string): string {
  if (lang === 'zh') {
    return text
      .replace(/可能|大概|也许|应该/g, '')
      .replace(/有点|稍微/g, '')
      .trim();
  }
  return text
    .replace(/\b(maybe|perhaps|sort of|kind of|I think|I guess|probably)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function politenText(text: string, lang: string): string {
  if (lang === 'zh') {
    if (!text.startsWith('请') && !text.startsWith('麻烦')) {
      return '请问，' + text;
    }
    return text;
  }
  if (!text.toLowerCase().startsWith('could') && !text.toLowerCase().startsWith('would')) {
    return 'Could you please help me with this — ' + text.charAt(0).toLowerCase() + text.slice(1);
  }
  return text;
}

function directenText(text: string, lang: string): string {
  if (lang === 'zh') {
    return text
      .replace(/^(请问，|麻烦您，|不好意思，)/g, '')
      .trim();
  }
  return text
    .replace(/^(Could you please |Would you mind |I was wondering if you could )/i, '')
    .trim();
}
