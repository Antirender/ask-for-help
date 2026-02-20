/* ============================================================
   machine.ts — Infinite State Machine for the Builder Wizard
   ============================================================ */

import type { AskDraft } from './schema';

/* ---------- Step definitions ---------- */
export const STEPS = [
  'seed',
  'goal',
  'context',
  'tried',
  'block',
  'ask',
  'timebox',
  'attachments',
  'review',
] as const;

export type StepId = (typeof STEPS)[number];

export interface StepMeta {
  id: StepId;
  label: string;
  labelZh: string;
  required: boolean;
  description: string;
  descriptionZh: string;
}

export const STEP_META: StepMeta[] = [
  {
    id: 'seed',
    label: 'Setup',
    labelZh: '基本设置',
    required: true,
    description: 'Choose who you are asking, how, and in what tone.',
    descriptionZh: '选择你要问谁、用什么方式、什么语气。',
  },
  {
    id: 'goal',
    label: 'Goal',
    labelZh: '目标',
    required: true,
    description: 'What does "done" look like? One sentence.',
    descriptionZh: '"完成"是什么样子？一句话描述。',
  },
  {
    id: 'context',
    label: 'Context',
    labelZh: '背景',
    required: false,
    description: '1–2 sentences of background.',
    descriptionZh: '1-2 句背景说明。',
  },
  {
    id: 'tried',
    label: 'Tried',
    labelZh: '已尝试',
    required: false,
    description: 'What you already attempted (reduces back-and-forth).',
    descriptionZh: '你已经尝试了什么（减少来回沟通）。',
  },
  {
    id: 'block',
    label: 'Block',
    labelZh: '卡点',
    required: false,
    description: 'Where exactly are you stuck?',
    descriptionZh: '你具体卡在了哪里？',
  },
  {
    id: 'ask',
    label: 'Ask',
    labelZh: '请求',
    required: true,
    description: 'What do you need from them?',
    descriptionZh: '你需要对方做什么？',
  },
  {
    id: 'timebox',
    label: 'Timebox',
    labelZh: '时间',
    required: false,
    description: 'How much time will this take? Any deadline?',
    descriptionZh: '预计需要多长时间？有截止日期吗？',
  },
  {
    id: 'attachments',
    label: 'Links',
    labelZh: '附件',
    required: false,
    description: 'Add links or screenshot notes (optional).',
    descriptionZh: '添加链接或截图说明（可选）。',
  },
  {
    id: 'review',
    label: 'Review',
    labelZh: '预览',
    required: true,
    description: 'Preview, score, and export your request.',
    descriptionZh: '预览、评分和导出你的请求。',
  },
];

/* ---------- Validation per step ---------- */
export type ValidationResult = { ok: boolean; warnings: string[] };

export function validateStep(step: StepId, draft: AskDraft): ValidationResult {
  const w: string[] = [];
  switch (step) {
    case 'seed':
      // always valid — has defaults
      break;
    case 'goal':
      if (!draft.goal.trim()) w.push('Goal is empty — what does "done" look like?');
      break;
    case 'context':
      if (!draft.context.trim()) w.push('Context is empty. Adding background helps the reader.');
      break;
    case 'tried':
      if (draft.tried.length === 0 || draft.tried.every((t) => !t.trim()))
        w.push('No attempts listed. Showing effort avoids "have you tried…" replies.');
      break;
    case 'block':
      if (!draft.block.trim()) w.push('Block is empty. Describe where exactly you got stuck.');
      break;
    case 'ask':
      if (!draft.askDetail.trim()) w.push('Ask detail is empty — what specifically do you need?');
      break;
    case 'timebox':
      // always valid (has default)
      break;
    case 'attachments':
      // always optional
      break;
    case 'review':
      break;
  }
  return { ok: w.length === 0, warnings: w };
}

/* ---------- State machine reducer ---------- */
export interface WizardState {
  currentStep: number; // index into STEPS
  visited: Set<number>;
  draft: AskDraft;
}

export type WizardAction =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'JUMP'; step: number }
  | { type: 'UPDATE_DRAFT'; patch: Partial<AskDraft> }
  | { type: 'RESET'; draft: AskDraft }
  | { type: 'NOT_SURE' }; // skip forward, marking gaps

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'NEXT': {
      const next = Math.min(state.currentStep + 1, STEPS.length - 1);
      const visited = new Set(state.visited);
      visited.add(next);
      return { ...state, currentStep: next, visited };
    }
    case 'BACK': {
      const prev = Math.max(state.currentStep - 1, 0);
      return { ...state, currentStep: prev };
    }
    case 'JUMP': {
      const idx = Math.max(0, Math.min(action.step, STEPS.length - 1));
      const visited = new Set(state.visited);
      visited.add(idx);
      return { ...state, currentStep: idx, visited };
    }
    case 'UPDATE_DRAFT':
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case 'RESET':
      return {
        currentStep: 0,
        visited: new Set([0]),
        draft: action.draft,
      };
    case 'NOT_SURE': {
      // Jump forward to review, marking all as visited
      const visited = new Set<number>();
      for (let i = 0; i < STEPS.length; i++) visited.add(i);
      return { ...state, currentStep: STEPS.length - 1, visited };
    }
    default:
      return state;
  }
}

export function initialWizardState(draft: AskDraft): WizardState {
  return {
    currentStep: 0,
    visited: new Set([0]),
    draft,
  };
}
