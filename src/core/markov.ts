/* ============================================================
   markov.ts — Trigram Markov chain for phrase variation
   ============================================================ */

const START = '__START__';
const END = '__END__';

export interface MarkovModel {
  ngrams: Map<string, Map<string, number>>;
  n: number;
  lang: 'en' | 'zh';
}

/* ---------- Build model from corpus text ---------- */
export function buildMarkovModel(corpusText: string, lang: 'en' | 'zh', n = 3): MarkovModel {
  const ngrams = new Map<string, Map<string, number>>();

  const lines = corpusText.split('\n').filter((l) => l.trim());

  for (const line of lines) {
    const tokens = tokenize(line, lang);
    if (tokens.length < n) continue;

    // Prepend START tokens
    const padded = [...Array(n - 1).fill(START), ...tokens, END];

    for (let i = 0; i <= padded.length - n; i++) {
      const key = padded.slice(i, i + n - 1).join(' ');
      const next = padded[i + n - 1];
      if (!ngrams.has(key)) ngrams.set(key, new Map());
      const followers = ngrams.get(key)!;
      followers.set(next, (followers.get(next) || 0) + 1);
    }
  }

  return { ngrams, n, lang };
}

/* ---------- Tokenize ---------- */
function tokenize(text: string, lang: string): string[] {
  if (lang === 'zh') {
    // For Chinese: character bigrams (simple approach)
    // The corpus uses space-separated words for simplicity
    const tokens = text.trim().split(/\s+/);
    return tokens.length > 1 ? tokens : [...text.trim()];
  }
  return text.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/* ---------- Generate text ---------- */
export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number; // 0–1, higher = more random
  seed?: string[]; // starting words to bias the output
  bannedTokens?: Set<string>;
}

export function generatePhrase(model: MarkovModel, options: GenerateOptions = {}): string {
  const {
    maxTokens = 20,
    temperature = 0.5,
    seed,
    bannedTokens = new Set(),
  } = options;

  const n = model.n;
  const output: string[] = [];

  // Initialize context
  let context: string[];
  if (seed && seed.length >= n - 1) {
    context = seed.slice(-(n - 1));
    output.push(...seed);
  } else {
    context = Array(n - 1).fill(START);
  }

  for (let i = 0; i < maxTokens; i++) {
    const key = context.join(' ');
    const followers = model.ngrams.get(key);

    if (!followers || followers.size === 0) break;

    const next = weightedSample(followers, temperature, bannedTokens);
    if (!next || next === END) break;

    output.push(next);
    context = [...context.slice(1), next];
  }

  if (model.lang === 'zh') {
    return output.join('');
  }
  return output.join(' ');
}

/* ---------- Weighted random sample with temperature ---------- */
function weightedSample(
  dist: Map<string, number>,
  temperature: number,
  banned: Set<string>,
): string | null {
  const entries = [...dist.entries()].filter(([token]) => !banned.has(token));
  if (entries.length === 0) return null;

  // Apply temperature
  const weights = entries.map(([, count]) => Math.pow(count, 1 / Math.max(temperature, 0.1)));
  const total = weights.reduce((a, b) => a + b, 0);

  let r = Math.random() * total;
  for (let i = 0; i < entries.length; i++) {
    r -= weights[i];
    if (r <= 0) return entries[i][0];
  }

  return entries[entries.length - 1][0];
}

/* ---------- Variant generation for specific sections ---------- */
export function generateVariant(
  model: MarkovModel,
  section: 'salutation' | 'closing' | 'request' | 'timebox' | 'subject',
  _context?: string,
): string {
  const seedMap: Record<string, string[][]> = {
    salutation:
      model.lang === 'en'
        ? [['I', 'am', 'writing'], ['Hi'], ['Hello'], ['I', 'wanted']]
        : [['您好'], ['你好'], ['打扰了']],
    closing:
      model.lang === 'en'
        ? [['Thank', 'you'], ['I', 'appreciate'], ['Looking', 'forward']]
        : [['感谢'], ['谢谢'], ['期待']],
    request:
      model.lang === 'en'
        ? [['Could', 'you'], ['Would', 'you'], ['I', 'need']]
        : [['能否'], ['请问'], ['希望']],
    timebox:
      model.lang === 'en'
        ? [['This', 'should'], ['I', 'think'], ['Even']]
        : [['大概需要'], ['估计'], ['应该不会']],
    subject:
      model.lang === 'en'
        ? [['Quick', 'question'], ['Help', 'needed'], ['Request']]
        : [['关于'], ['请教'], ['问题']],
  };

  const seeds = seedMap[section] || seedMap['request'];
  const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];

  const result = generatePhrase(model, {
    seed: randomSeed,
    maxTokens: 15,
    temperature: 0.6,
    bannedTokens: new Set(['http', 'https', 'www', '@', '#']),
  });

  // Fallback if result is too short
  if (result.length < 3) {
    return model.lang === 'en' ? 'Thank you for your time.' : '感谢您的时间。';
  }

  return result;
}

/* ---------- Predict next missing field ---------- */
export function predictNextMissingField(
  filledFields: Set<string>,
): string | null {
  // Typical completion order based on frequency analysis
  const typicalOrder = [
    'goal',
    'context',
    'tried',
    'block',
    'askDetail',
    'timeboxMin',
  ];

  for (const field of typicalOrder) {
    if (!filledFields.has(field)) return field;
  }
  return null;
}
