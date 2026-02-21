# Ask for Help – Smart Message Composer

> 中文版本: [README_zh.md](README_zh.md) · Version française: [README_fr.md](README_fr.md)

A fully offline, privacy-first web tool that guides students and professionals through writing clear, context-rich help requests — with a heuristic pseudo-AI engine, Markov n-gram variation, 5-dimension scoring, and local history/export.

No server. No sign-in. No data leaves your browser.

---

## Features

| Feature | Detail |
|---|---|
| **9-step guided wizard** | Seed → Goal → Context → Tried → Blocked → Ask → Timebox → Attachments → Review |
| **Offline pseudo-AI** | Rule-based heuristics that detect vague language, missing context, unclear asks, and more |
| **Markov trigram generator** | Generates alternative phrasings from a curated corpus without any API |
| **5-dimension scoring** | Completeness · Clarity · Effort · Cost · Tone (0–100, colour-coded) |
| **Multi-format output** | Standard / Short / Ultra-short × 4 channels (email, Slack/Discord, issue/forum, in-person) |
| **Trilingual** | Full English, Chinese, and French support (phrase banks, templates, UI) |
| **Global language & theme** | Language and light/dark mode are set once in the header — no per-page toggles |
| **Deferred validation** | Warnings appear only after you press Next, never mid-typing |
| **SVG icon system** | Native inline SVG icons throughout — no emoji, no icon font dependency |
| **18 built-in templates** | Presets for professor email, TA Slack, code review, teammate DM, French templates, and more |
| **Local history & export** | Evidence log stored in `localStorage`; export as JSON or CSV |
| **Accessibility** | WCAG 2.1 AA — font-size slider, high-contrast mode, reduced-motion toggle, focus-visible ring |
| **MD3 design** | Material Design 3 tokens, light/dark theme, responsive from 320px to 1440px+ |

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Build for Production

```bash
npm run build
# → output in dist/
```

Static bundle, no back-end. Deploy `dist/` to any static host (GitHub Pages, Netlify, Vercel, etc.).

### Deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

Set the **Pages source** to the `gh-pages` branch in repo settings.

---

## Project Structure

```
app/src/
├── core/
│   ├── schema.ts           # TypeScript types (Lang now includes 'fr')
│   ├── machine.ts          # Wizard state-machine reducer
│   ├── heuristics.ts       # Pseudo-AI suggestion rules + rewrite helpers
│   ├── markov.ts           # Trigram Markov chain
│   ├── generator.ts        # Multi-format output generator
│   ├── scoring.ts          # 5-dimension scoring
│   └── storage.ts          # localStorage persistence + CSV/JSON export
├── data/
│   ├── templates.json      # 18 preset templates (EN + ZH + FR)
│   ├── phrase_bank_en.json
│   ├── phrase_bank_zh.json
│   ├── phrase_bank_fr.json # New: French phrase bank
│   ├── markov_corpus_en.txt
│   └── markov_corpus_zh.txt
├── styles/
│   ├── tokens.css          # MD3 design tokens
│   ├── themes.css          # Light / dark / high-contrast (with header variables)
│   └── components.css      # Component styles + responsive breakpoints
├── routes/
│   ├── Home.tsx
│   ├── Builder.tsx         # Main wizard — syncs with global language
│   ├── Library.tsx         # Templates + phrase bank (uses global lang)
│   ├── History.tsx
│   └── About.tsx
└── ui/
    ├── AppShell.tsx        # Header: theme + lang toggle, nav with SVG icons
    ├── Icons.tsx           # New: inline SVG icon library (~40 icons)
    ├── Wizard.tsx          # Stepper with deferred validation
    ├── FieldCard.tsx
    ├── PreviewPane.tsx
    ├── SuggestionsPanel.tsx
    ├── TemplatePicker.tsx
    ├── HistoryTable.tsx
    └── Accessibility.tsx
```

---

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run typecheck` | TypeScript check only (no emit) |

---

## Tech Stack

- **Vite 7** — build tool and dev server
- **React 19** — UI rendering
- **TypeScript 5.9** — static type checking
- **CSS custom properties** — Material Design 3 tokens, no CSS framework
- **localStorage** — all persistence; no cookies, no network requests

---

## Privacy

All processing happens in your browser. Nothing is sent to any server. Draft data persists in `localStorage` only on **your** device. Clear browser data or use the in-app "Clear History" button to remove it.

---

## License

MIT


---

## Quick Start

```bash
# Install dependencies (one-time)
npm install

# Start dev server at http://localhost:5173
npm run dev
```

Open `http://localhost:5173` in your browser. No build required for development.

---

## Build for Production

```bash
npm run build
# → output in dist/
```

The build is a self-contained static bundle (no back-end). Deploy the `dist/` folder to any static host.

### Deploy to GitHub Pages

```bash
npm run build
# Then push dist/ to your gh-pages branch, or use gh-pages npm package:
npx gh-pages -d dist
```

Set the **Pages source** to the `gh-pages` branch in your repo settings.

---

## Project Structure

```
app/
├── index.html
├── vite.config.ts
├── src/
│   ├── App.tsx                 # Hash router (5 routes)
│   ├── main.tsx                # Entry point + CSS imports
│   ├── core/
│   │   ├── schema.ts           # All TypeScript types
│   │   ├── machine.ts          # Wizard state-machine reducer
│   │   ├── heuristics.ts       # Pseudo-AI suggestion rules + rewrite helpers
│   │   ├── markov.ts           # Trigram Markov chain
│   │   ├── generator.ts        # Multi-format output generator
│   │   ├── scoring.ts          # 5-dimension scoring
│   │   └── storage.ts          # localStorage persistence + CSV/JSON export
│   ├── data/
│   │   ├── templates.json      # 10 preset templates (EN + ZH)
│   │   ├── phrase_bank_en.json # English phrase chunks
│   │   ├── phrase_bank_zh.json # Chinese phrase chunks
│   │   ├── markov_corpus_en.txt
│   │   └── markov_corpus_zh.txt
│   ├── styles/
│   │   ├── tokens.css          # MD3 design tokens
│   │   ├── themes.css          # Light / dark / high-contrast themes
│   │   └── components.css      # Component styles
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── Builder.tsx         # Main wizard page
│   │   ├── Library.tsx         # Templates + phrase bank browser
│   │   ├── History.tsx         # Evidence log
│   │   └── About.tsx           # Method + accessibility settings
│   └── ui/
│       ├── AppShell.tsx
│       ├── Wizard.tsx
│       ├── FieldCard.tsx
│       ├── PreviewPane.tsx
│       ├── SuggestionsPanel.tsx
│       ├── TemplatePicker.tsx
│       ├── HistoryTable.tsx
│       └── Accessibility.tsx
└── dist/                       # Production build output (git-ignored)
```

---

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run typecheck` | TypeScript check only (no emit) |

---

## Tech Stack

- **Vite 7** — build tool and dev server
- **React 19** — UI rendering
- **TypeScript 5.9** — static type checking
- **CSS custom properties** — Material Design 3 tokens, no CSS framework
- **localStorage** — all persistence; no cookies, no network requests

---

## Privacy

All processing happens in your browser. Nothing is sent to any server. Draft data persists in `localStorage` only on **your** device. Clear browser data or use the in-app "Clear History" button to remove it.

---

## License

MIT
