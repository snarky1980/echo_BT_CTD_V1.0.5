# Email Assistant v8 (imported from v6)

[![Deploy to GitHub Pages](https://github.com/snarky1980/email-assistant-v8-fixed/actions/workflows/deploy.yml/badge.svg)](https://github.com/snarky1980/email-assistant-v8-fixed/actions/workflows/deploy.yml)

Live demo: https://snarky1980.github.io/email-assistant-v8-fixed/

This repository starts from the email-assistant v6 codebase and is ready for you to continue work toward v8.

## ⚠️ UI FREEZE - DO NOT MODIFY

**CRITICAL**: The current UI design (mint/sage gradients with pills pattern) is the CANONICAL design and must NOT be changed.

- **Canonical commit**: `d208852` - "UX: variables popup movable/resizable + Outlook compose button (mailto) + admin filters"
- **Protected elements**:
  - Main banner with mint/sage/teal gradients
  - Pills pattern design for language and category selection
  - Color scheme: emerald, teal, sage, mint (NOT blue/indigo)
  - Visual banner layout with images
  - Resizable Variables popup
  - "Ouvrir dans Outlook" / "Open in Outlook" button

**Before making ANY UI changes**:
1. Create a feature branch
2. Test locally first
3. Get approval before merging to main
4. Never directly edit color classes without documenting the reason

If you need to revert to the canonical UI: `git reset --hard d208852`

Two ways to run locally:

- Static server (simple, no build step): serves the current folder and the JSON data file.
- Vite dev server (HMR): for active React development in `src/`.

## Quick start: static server

Serve the project root with any static server. Examples (Linux/macOS):

```bash
# from the project root
npx http-server -p 5173 .
# then open in your browser
# http://localhost:5173/
```

The app will load the pill UI and fetch `public/complete_email_templates.json` (served at `/complete_email_templates.json`).

One-command option using the provided script:

```bash
npm run serve:static
```

## React dev workflow (Vite)

```bash
npm install
npm run dev
# open http://localhost:5173/
```

This runs the Vite dev server with HMR using `index.html` and the React entry in `src/main.jsx`.

### One-command local dev (avoid wrong folder)

If you also have an older folder like `~/email-assistant-v8-`, make sure you always run from the fixed repo `~/email-assistant-v8-fixed`.

Two easy options:

1) Using npm --prefix from anywhere

```bash
npm --prefix "$HOME/email-assistant-v8-fixed" run dev
```

2) Add a zsh alias (put this in ~/.zshrc)

```bash
alias eav8='cd "$HOME/email-assistant-v8-fixed" && npm run dev'
```

Then start dev with:

```bash
eav8
```

### Port conflicts and auto-retry

The dev server binds to port 5173 with `strictPort: true`.

- Free the port and start:

```bash
npm run dev:clean
```

- Auto-retry on alternate ports 5174/5175 if 5173 is busy:

```bash
npm run dev:retry
```

## Production preview (optional)

```bash
npm run build
npm run preview -- --port 5175
# open http://localhost:5175/
```

Notes:
- If `index.html` uses classic scripts, Vite won’t bundle them, but the React SPA still builds fine. The static server path remains supported.

## Admin Console

A static Admin Console helps edit templates/variables without coding.

- Open: http://localhost:5173/admin.html (same static server)
- Import: Load any existing `complete_email_templates.json` (auto-loads from project root if present)
- Edit: templates, variables, and metadata (FR/EN supported)
- Export: downloads a validated `complete_email_templates.json`; replace the one in the repo and commit

Validation warns about duplicate IDs, unknown categories, missing variables, and unlisted placeholders `<<Var>>`. Warnings don’t block export.

Tip: Keep the main app open at `/` while editing in `/admin.html` to preview changes after updating the JSON file and reloading.
# Deployment fix

- Les déploiements sont maintenant gérés automatiquement par le workflow GitHub Actions `Deploy to GitHub Pages`. Évitez de lancer `npm run deploy` tant que le workflow est en cours, sinon GitHub rejette le second déploiement comme déjà en cours.

## In-app help centre (FR/EN)

- Un bouton **Aide / Help** apparaît désormais dans la bannière principale à droite du sélecteur de langue.
- Le bouton est compact afin de ne pas augmenter la hauteur de la bannière. Il remplace l’ancienne version en pied de page.
- Le centre d'aide s'ouvre dans une fenêtre superposée et reste au-dessus des autres panneaux (y compris le popup Variables) jusqu'à ce que vous le fermiez.
- Le contenu est entièrement bilingue et couvre :
  - un parcours de prise en main rapide ;
  - une FAQ axée sur la synchronisation des variables et le bouton Outlook ;
  - une liste de dépannage pas-à-pas pour les problèmes courants ;
  - des liens directs vers la documentation du dépôt (README, notes d'implantation, guide développeur, aide hors ligne).
- Le bouton « Nous écrire / Contact support » ouvre votre agent de messagerie par défaut avec un sujet prérempli.

### Modifier l'adresse de support

- Par défaut, l’adresse utilisée est `translationbureau@tpsgc-pwgsc.gc.ca`.
- Vous pouvez la remplacer sans toucher au code en définissant la variable d’environnement **`VITE_SUPPORT_EMAIL`** avant de lancer le build Vite :

```bash
VITE_SUPPORT_EMAIL="mon-equipe@exemple.gc.ca" npm run dev
```

- Lors du déploiement (CI ou GitHub Pages), ajoutez la même variable dans l’environnement où la commande `npm run build` est exécutée.

## Support rapide

- Les sections **FAQ**, **Dépannage**, et **Ressources** du centre d’aide compilent les réponses issues de `TROUBLESHOOTING.md`, `IMPLEMENTATION_CHANGES.md`, et `docs/DEVELOPER-GUIDE.md`.
- Le bouton **Réinitialiser** rappelé dans la FAQ restaure les exemples du modèle, y compris les valeurs du popup Variables.
- Le centre d’aide documente aussi le nouvel état d’**épingle** du popup, la synchronisation immédiate à l’ouverture et les gestes-clavier utiles.

## Saisie rapide dans l’objet (FR) / Fast subject editing (EN)

- Cliquer sur une pastille (variable) dans l’objet sélectionne désormais tout son contenu, comme dans le corps du message. Cela facilite le remplacement immédiat.
- Le comportement s’applique aux pastilles vides et remplies; l’éditeur maintient la mise au point visuelle sur la pastille active.
