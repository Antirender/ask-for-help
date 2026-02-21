# Ask for Help – Compositeur de messages intelligent

> English version: [README.md](README.md) · 中文版本: [README_zh.md](README_zh.md)

Un outil web entièrement hors ligne et respectueux de la vie privée, qui guide étudiants et professionnels dans la rédaction de demandes d'aide claires et structurées — avec un moteur heuristique pseudo-IA, une génération de variations Markov n-gram, un score à 5 dimensions et un historique local exportable.

Aucun serveur. Aucune connexion. Vos données ne quittent jamais votre navigateur.

---

## Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| **Assistant en 9 étapes** | Amorce → Objectif → Contexte → Tentatives → Blocage → Demande → Délai → Pièces jointes → Révision |
| **Pseudo-IA hors ligne** | Règles heuristiques qui détectent le langage vague, le contexte manquant, les demandes floues, etc. |
| **Générateur Markov trigramme** | Génère des variantes de formulations à partir d'un corpus sans aucun appel API |
| **Score à 5 dimensions** | Complétude · Clarté · Effort · Coût · Ton (0–100, code couleur) |
| **Sortie multi-format** | Standard / Court / Ultra-court × 4 canaux (courriel, Slack/Discord, ticket/forum, présentiel) |
| **Trilingue** | Support complet anglais, chinois et **français** (banques de phrases, modèles, interface) |
| **Langue & thème globaux** | La langue et le mode clair/sombre se règlent une fois dans l'en-tête |
| **Validation différée** | Les avertissements n'apparaissent qu'après avoir cliqué sur Suivant, jamais en cours de frappe |
| **Icônes SVG natives** | Système d'icônes SVG inline — aucun emoji, aucune dépendance à une police d'icônes |
| **18 modèles intégrés** | Courriel au professeur, Slack au chargé de TP, revue de code, DM coéquipier, modèles français, etc. |
| **Historique local & export** | Journal des demandes dans `localStorage` ; export JSON ou CSV |
| **Accessibilité** | WCAG 2.1 AA — curseur de taille de police, mode contraste élevé, réduction des animations, anneau de focus |
| **Design MD3** | Tokens Material Design 3, thème clair/sombre, responsive de 320 px à 1440 px et plus |

---

## Démarrage rapide

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Build de production

```bash
npm run build
# → sortie dans dist/
```

Bundle statique, sans serveur. Déployez le dossier `dist/` sur n'importe quel hébergeur statique (GitHub Pages, Netlify, Vercel, etc.).

### Déploiement sur GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

Dans les paramètres du dépôt, configurez la **source Pages** sur la branche `gh-pages`.

---

## Structure du projet

```
app/src/
├── core/
│   ├── schema.ts           # Types TypeScript (Lang inclut désormais 'fr')
│   ├── machine.ts          # Réducteur de machine à états du wizard
│   ├── heuristics.ts       # Règles pseudo-IA + helpers de réécriture
│   ├── markov.ts           # Chaîne de Markov trigramme
│   ├── generator.ts        # Générateur de sortie multi-format
│   ├── scoring.ts          # Score à 5 dimensions
│   └── storage.ts          # Persistance localStorage + export CSV/JSON
├── data/
│   ├── templates.json      # 18 modèles (EN + ZH + FR)
│   ├── phrase_bank_en.json
│   ├── phrase_bank_zh.json
│   ├── phrase_bank_fr.json # Nouveau : banque de phrases française
│   ├── markov_corpus_en.txt
│   └── markov_corpus_zh.txt
├── styles/
│   ├── tokens.css          # Tokens de design MD3
│   ├── themes.css          # Thèmes clair / sombre / contraste élevé
│   └── components.css      # Styles composants + points de rupture responsive
├── routes/
│   ├── Home.tsx
│   ├── Builder.tsx         # Wizard principal — synchronisé avec la langue globale
│   ├── Library.tsx         # Modèles + banque de phrases (langue globale)
│   ├── History.tsx
│   └── About.tsx
└── ui/
    ├── AppShell.tsx        # En-tête : bascule thème & langue, navigation SVG
    ├── Icons.tsx           # Nouveau : bibliothèque d'icônes SVG inline (~40 icônes)
    ├── Wizard.tsx          # Stepper avec validation différée
    ├── FieldCard.tsx
    ├── PreviewPane.tsx
    ├── SuggestionsPanel.tsx
    ├── TemplatePicker.tsx
    ├── HistoryTable.tsx
    └── Accessibility.tsx
```

---

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Démarrer le serveur de développement Vite |
| `npm run build` | Vérification TypeScript + build de production |
| `npm run typecheck` | Vérification TypeScript uniquement (sans émission) |

---

## Stack technique

- **Vite 7** — outil de build et serveur de développement
- **React 19** — rendu UI
- **TypeScript 5.9** — typage statique
- **CSS custom properties** — tokens Material Design 3, pas de framework CSS
- **localStorage** — toute la persistance ; pas de cookies, pas de requêtes réseau

---

## Vie privée

Tout le traitement se déroule dans votre navigateur. Rien n'est envoyé à un serveur. Les données de brouillon ne persistent dans `localStorage` que sur **votre** appareil. Effacez les données du navigateur ou utilisez le bouton « Effacer l'historique » dans l'application pour les supprimer.

---

## Licence

MIT
