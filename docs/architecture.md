# Architecture — drwil_walk

Au 2026-10-30. Carte du dépôt : ce qui vit où. À tenir à jour dans le même commit que le code qu'elle décrit.

## Ce que fait l'application

Une page WebXR en réalité mixte, ouverte dans le navigateur du Meta Quest 3, sans installation. L'utilisateur marche
sur un tapis de course classique (non connecté). La ville (Pune ou Doha) défile le long d'un itinéraire prédéfini, à la
vitesse qu'il règle à la manette pour qu'elle corresponde à celle du tapis. Le monde réel (tapis, rampe, console) reste
visible grâce au passthrough : la ville s'efface quand il baisse la tête, et la zone du tapis reste transparente.
Le détail fonctionnel est dans `MISSION.md`.

## Stack

Décidée le 2026-10-30 par le demandeur :

- **Langage** : TypeScript strict.
- **Build et serveur de dev** : Vite, en HTTPS (WebXR l'exige), accessible sur le réseau local pour le Quest 3.
- **3D et XR** : three.js, session WebXR `immersive-ar` (passthrough du Quest 3).
- **Ville** : bâtiments OpenStreetMap extrudés en three.js, à partir d'un extrait GeoJSON figé dans le dépôt (aucun
  appel réseau dans le casque), mention « © contributeurs OpenStreetMap » affichée (licence ODbL). Décision du
  2026-10-30 : pas de Google Photorealistic 3D Tiles en v0.1 (intention `docs/intentions/google-3d-tiles.md`).
- **Tests** : Vitest (unitaires, couverture à 100 %), Playwright avec émulation WebXR (IWER) pour l'e2e.
- **Hébergement** : application 100 % statique, aucun serveur ni base de données.

## Couches

- `app/` : l'application entière, paquet npm à part (`app/package.json`). Contexte de la couche : `app/AGENTS.md`.
  - `app/index.html` : la page servie ; elle charge le point d'entrée `app/src/main.ts`.
  - `app/src/` : le code, un dossier par module, chaque fichier de logique avec son test `*.test.ts` à côté.
    Découpage prévu : xr (session et contrôles), city (bâtiments OSM extrudés), route (itinéraires et déplacement),
    safety (visibilité du réel), ui (accueil et panneau d'infos).
  - `app/src/main.ts` : point d'entrée ; il monte l'accueil et branche le renderer three.js (`WebGLRenderer`).
  - `app/src/route/` : la vitesse de marche (`app/src/route/speed.ts` : bornage 1 à 8 km/h, pas de 0,1, conversion en m/s) et le
    déplacement (`app/src/route/walk.ts` : distance à la vitesse réglée, rue qui boucle, affichage distance et temps) et
    les quatre itinéraires de l'accueil (`app/src/route/itineraries.ts` : données, dont l'indicateur « disponible »).
  - `app/src/safety/` : la sécurité-visibilité (`app/src/safety/visibility.ts`, contrat APP-001) : inclinaison de la tête lue dans la
    pose WebXR, fondu de la ville au-delà de 25°, opacité globale bornée 30 à 100 %. Zone tapis et vignette : à écrire.
  - `app/src/xr/` : la session `immersive-ar` (`app/src/xr/session.ts`), le joystick droit (`app/src/xr/joystick.ts`, un cran de 0,1 km/h
    par poussée), l'image de marche en logique pure (`app/src/xr/frame.ts`) et l'assemblage accueil → session → boucle de rendu
    (`app/src/xr/experience.ts`, renderer injecté pour être testé avec une doublure).
  - `app/src/city/` : la rue simple (`app/src/city/street.ts` : sol et blocs three.js, opacité appliquée aux matériaux, scène sans
    fond pour le passthrough). Les bâtiments OpenStreetMap la remplaceront (fiche `docs/projects/doha-souq-waqif.md`).
  - `app/src/ui/` : l'écran d'accueil (`app/src/ui/home.ts` : vitesse, opacité, rappel de sécurité, bouton « Entrer en réalité
    mixte » ; `app/src/ui/route-choice.ts` : cartes d'itinéraire en boutons radio ; `app/src/ui/home.css` : thème sombre et
    couleurs ; `app/src/ui/contrast.ts` : mesure du contraste, contrat QUA-014), les illustrations des cartes
    (`app/src/ui/*.svg`, une par itinéraire, livrées par Vite avec l'application, sans réseau) et le panneau de marche sur la page (`app/src/ui/panel.ts` : vitesse, distance, temps, opacité de la ville).
  - `app/e2e/` : l'e2e des chemins critiques (`app/e2e/chemins-critiques.test.ts`, contrat QUA-020), Playwright sur
    Chromium avec un Quest 3 émulé par IWER, injecté par le test (jamais livré dans l'application). Il prend aussi les
    captures de l'accueil dans `dist/e2e-captures/` (ignoré par Git), publiées par la CI sous le nom `captures-accueil`.
  - Configuration, chacune testée comme le code : `app/playwright.config.ts` (e2e contre Vite sur le port 5174, en
    HTTPS, résultats hors de la couche), `app/vite.config.ts` (Vite en HTTPS sur le réseau local, build
    dans le dossier dist/app de la racine, hors de la mesure de couverture, et
    Vitest), `app/eslint.config.js` (règles des contrats de qualité), `app/tsconfig.json` (TypeScript strict).
  - Couverture : c8 autour de `npm test` (Vitest), 100 % sans exclusion. Les tests tournent en threads et le code
    est importé par Node avec retrait natif des types, pour que c8 mesure les vraies lignes des fichiers .ts :
    d'où l'extension .ts dans les imports relatifs. Les tests du DOM utilisent happy-dom (`new Window()`), sans
    environnement global. La couverture différentielle (contrôle `coverage-diff-app`, QUA-004) exige en plus
    100 % des lignes ajoutées ou modifiées par rapport à `origin/master` : c8 écrit un rapport Cobertura dans
    app/coverage/ (ignoré par Git), lu par diff-cover (outil Python).

## Gouvernance IA-first

- Instructions IA : `AGENTS.md`, puis le `AGENTS.md` de la couche touchée.
- Mission de la v0.1 : `MISSION.md`.
- Invariants : `docs/contracts.md`.
- Recettes : `docs/recipes/`.
- Contrôles : `.githooks/run-checks.mjs`, lancé au commit par `.githooks/pre-commit`. Les contrôles propres à la stack
  sont déclarés dans `.drwil/ia-first.json` (clé `checks`).
- Configuration du kit : `.drwil/ia-first.json`.
- `.github/workflows/` — CI GitHub (`.github/workflows/ia-first.yml`, écrit par `npx drwil init --ci github`) : le job `checks` rejoue
  `node .githooks/run-checks.mjs` à chaque push et PR, et sur une PR les rejoue avec les hooks de la branche principale ;
  c'est le contrôle requis par la protection de `master`. Modèle de PR : `.github/pull_request_template.md`.
  Avant les contrôles, le job installe les dépendances de `app/` (`npm ci`) et le navigateur Chromium de Playwright
  (`npx playwright install --with-deps chromium`) : les contrôles de la couche, e2e compris, tournent depuis ce dossier.
