# Installation by someone else

Prérequis, clonage et premier lancement de drwil_walk.

## 1. Prerequisites

- Node.js 24 et npm 11 (l'outil de licences exige ces versions).
- Git ; gitleaks pour le contrôle des secrets au commit (sinon le contrôle est « non exécuté »).
- diff-cover 10.6 (outil Python, `pipx install diff-cover==10.6.0`) pour le contrôle de couverture différentielle
  `coverage-diff-app` (sinon le contrôle est « non exécuté »).
- Un Meta Quest 3 sur le même réseau local que le poste, pour essayer la page en réalité mixte.

## 2. Clone and configure

```bash
git clone https://github.com/wdubilly/drwil_walk.git
cd drwil_walk
npm ci              # outillage de gouvernance (drwil), à la racine
npm ci --prefix app # l'application
(cd app && npx playwright install chromium)  # navigateur des tests de bout en bout (contrôle e2e)
```

Aucune clé d'API n'est nécessaire : par défaut, la ville vient d'un extrait OpenStreetMap figé dans le dépôt.

Rendu photoréaliste Google 3D (facultatif, avec une clé « Map Tiles API » de Google, payante au-delà d'un quota) :
mettez `VITE_GOOGLE_MAPS_API_KEY=<votre clé>` dans `.env.local` (dans `app/`) (fichier ignoré par Git, jamais commité ; le modèle
fictif est `.env.example`), puis relancez `npm run dev` depuis `app/`. Restreignez la clé dans la console Google (référents
HTTP, « Map Tiles API » seule) : elle est lisible dans la page. À l'accueil, choisissez alors « Google 3D » ; sans clé, ou si
les tuiles ne se chargent pas, la marche se fait en OpenStreetMap et la raison s'affiche sur l'accueil. Ce rendu appelle le
réseau (`tile.googleapis.com`, `www.gstatic.com`) pendant la marche ; les tests, eux, n'appellent jamais Google.

Once per clone, enable the governance hooks (checks at commit and push):

```bash
git config core.hooksPath .githooks
```

Mode d'emploi pour utiliser l'application avec un Quest 3 (sans connaissance de développement) :
`docs/guide-utilisateur.md`.

## 3. First startup and check

Lancer et vérifier : `docs/recipes/run-locally.md`. Contrôles de la couche (tests, couverture, typage, lint,
licences, e2e) : section « Check » de `app/AGENTS.md`.

## 4. Using an AI tool other than Claude

`AGENTS.md` is the shared entry point; tool-specific files (e.g.
`CLAUDE.md`, `GEMINI.md` — if present) only point to it. A new tool: have
it read `AGENTS.md` first, without duplicating its content.
