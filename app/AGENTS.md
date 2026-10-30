# app layer context

Read `../AGENTS.md` first: do not repeat what it already says. The detail
of each contract (rule, proof) is in `docs/contracts.md` (from the root):
do not copy it here.

## Context

Couche unique : l'application WebXR entière (TypeScript strict, Vite, three.js), cadrée le 2026-10-30.
Socle posé le 2026-10-30 (configuration, point d'entrée, vitesse), puis une première tranche verticale : accueil,
session `immersive-ar`, rue simple, marche en ligne droite, joystick, fondu tête baissée (carte :
`docs/architecture.md`). Restent à écrire : la vraie ville (city/), les itinéraires GPS, la zone tapis et la vignette.

- Code dans src/, un dossier par module : xr/ (session `immersive-ar`, manettes), city/ (3d-tiles-renderer,
  repli OSM), route/ (itinéraires, déplacement à vitesse réglée), safety/ (fondu tête baissée, zone tapis,
  opacité, vignette), ui/ (accueil, panneau d'infos).
- La logique (calculs de vitesse, d'opacité, de zone, de trajectoire) est en **fonctions pures**, séparée du rendu
  three.js : c'est elle que les tests unitaires couvrent à 100 %.
- Les itinéraires sont des données (liste de points GPS par itinéraire), pas du code.
- La vitesse passe par une interface `SpeedSource` (réglage manuel en v0.1, Bluetooth plus tard).
- Tests unitaires à côté du code (`*.test.ts`), e2e Playwright dans e2e/ avec un casque émulé (IWER).
- Imports relatifs **avec l'extension .ts** (`import { x } from "./speed.ts"`) : les tests importent le code par
  Node lui-même (retrait natif des types), sans transformation par Vite, pour que c8 mesure les vraies lignes. Seule
  la syntaxe effaçable est permise (`erasableSyntaxOnly` : pas d'`enum`, pas de `namespace`).
- Aucune exclusion de couverture : un fichier de configuration (`vite.config.ts`, `eslint.config.js`) a son test.
- Le DOM se teste avec happy-dom (`new Window().document`) passé en paramètre, sans environnement global de test.
- Le rendu three.js est injecté (classe `Renderer` passée à `startExperience`) : les tests passent une doublure,
  seul `src/main.ts` branche le vrai `WebGLRenderer`.
- Clé Google lue via `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`, jamais en dur.

## Test pitfalls

- 2026-10-30 : c8 lit 0 % si Vitest tourne en forks (le fork est tué par signal, sa couverture V8 n'est jamais
  écrite) : garder `pool: "threads"` dans `vite.config.ts`.
- 2026-10-30 : c8 compte des branches sur des commentaires si le code passe par le module runner de Vite (positions
  décalées) : garder `experimental.viteModuleRunner: false`.
- Le point d'entrée s'exécute à l'import : son test fournit un `document` (happy-dom) et un `navigator` de
  substitution (`vi.stubGlobal`) puis l'importe dynamiquement.
- 2026-10-30 : three.js fait tourner sa boucle de page en plus de celle de la session si `setAnimationLoop` est appelé
  après `xr.setSession` (images sans `XRFrame`) : poser la boucle avant la session, et ignorer une image sans frame.

## Layer contracts

| ID | Subject | Reference file |
|---|---|---|
| APP-001 | Sécurité-visibilité : le réel reste visible (tête baissée, zone tapis) | `src/safety/visibility.ts` |

## Style guide and recipes

- `docs/recipes/refactor-without-breaking.md` pour toute restructuration.
- `docs/recipes/run-locally.md` pour lancer l'application.

## Check

Depuis `app/`, après `npm ci` :

- `npm test` : tests Vitest ; la couverture se mesure par
  `npx c8 --check-coverage --lines 100 --branches 100 --functions 100 --statements 100 --all npm test`.
- `npm run typecheck` : `tsc --noEmit` en mode strict.
- `npm run lint` : ESLint, zéro avertissement (`--max-warnings 0`).
- `npm run licenses` : licences des dépendances, liste autorisée.
- `npm run build` : typecheck puis build Vite, hors de la couche, dans le dossier dist/app de la racine (ignoré par
  Git) : sous app/, c8 compterait le bundle généré comme du code non couvert.

Depuis la racine, `node .githooks/run-checks.mjs` lance les contrôles déclarés dans `.drwil/ia-first.json`. L'e2e
(Playwright) arrivera avec la fiche `docs/projects/e2e-chemins-critiques.md`.
