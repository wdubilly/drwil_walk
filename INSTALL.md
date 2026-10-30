# Installation by someone else

Prérequis, clonage et premier lancement de drwil_walk.

## 1. Prerequisites

- Node.js 24 et npm 11 (l'outil de licences exige ces versions).
- Git ; gitleaks pour le contrôle des secrets au commit (sinon le contrôle est « non exécuté »).
- Un Meta Quest 3 sur le même réseau local que le poste, pour essayer la page en réalité mixte.

## 2. Clone and configure

```bash
git clone https://github.com/wdubilly/drwil_walk.git
cd drwil_walk
npm ci              # outillage de gouvernance (drwil), à la racine
npm ci --prefix app # l'application
(cd app && npx playwright install chromium)  # navigateur des tests de bout en bout (contrôle e2e)
```

La clé Google Maps (tuiles 3D) n'est pas encore utilisée par le code ; elle sera lue dans le fichier .env de app/
(`VITE_GOOGLE_MAPS_API_KEY`), jamais commitée.

Once per clone, enable the governance hooks (checks at commit and push):

```bash
git config core.hooksPath .githooks
```

## 3. First startup and check

Lancer et vérifier : `docs/recipes/run-locally.md`. Contrôles de la couche (tests, couverture, typage, lint,
licences, e2e) : section « Check » de `app/AGENTS.md`.

## 4. Using an AI tool other than Claude

`AGENTS.md` is the shared entry point; tool-specific files (e.g.
`CLAUDE.md`, `GEMINI.md` — if present) only point to it. A new tool: have
it read `AGENTS.md` first, without duplicating its content.
