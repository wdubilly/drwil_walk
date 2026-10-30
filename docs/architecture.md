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
- **Ville** : 3d-tiles-renderer avec Google Photorealistic 3D Tiles (clé lue dans `.env`, jamais commitée). Repli
  automatique sur des bâtiments OpenStreetMap si la clé ou la couverture manque.
- **Tests** : Vitest (unitaires, couverture à 100 %), Playwright avec émulation WebXR (IWER) pour l'e2e.
- **Hébergement** : application 100 % statique, aucun serveur ni base de données.

## Couches

- `app/` : l'application entière (code, tests, configuration Vite). Contexte de la couche : `app/AGENTS.md`.
  Découpage prévu en modules : xr (session et contrôles), city (tuiles 3D et repli OSM), route (itinéraires et
  déplacement), safety (visibilité du réel), ui (accueil et panneau d'infos).

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
