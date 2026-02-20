# Ask for Help – Smart Message Composer

> 中文版本请见: [README_zh.md](README_zh.md)

A fully offline, privacy-first web tool that guides students and professionals through writing clear, context-rich help requests — with a heuristic pseudo-AI engine, Markov n-gram variation, 5-dimension scoring, and local history/export.

No server. No sign-in. No data leaves your browser.

---

## Features

| Feature | Detail |
|---|---|
| **10-step guided wizard** | Seed → Goal → Context → Tried → Blocked → Ask → Timebox → Attachments → Channel/Tone → Review |
| **Offline pseudo-AI** | 10 rule-based heuristics that detect vague language, missing context, unclear asks, and more |
| **Markov trigram generator** | Generates alternative phrasings from a curated corpus without any API |
| **5-dimension scoring** | Clarity · Effort · Specificity · Respect · Brevity (0–100, colour-coded) |
| **Multi-format output** | Standard / Short (≤7 lines) / Ultra-short (≤3 lines) × 4 channels (email, chat, forum, in-person) |
| **Bilingual** | Full English and Chinese support (phrase banks, templates, UI) |
| **Local history & export** | Evidence log stored in `localStorage`; export as JSON or CSV |
| **Accessibility** | WCAG 2.1 AA — font-size slider, high-contrast mode, reduced-motion toggle, focus-visible ring |
| **MD3 design** | Material Design 3 tokens, light/dark theme toggle |

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
