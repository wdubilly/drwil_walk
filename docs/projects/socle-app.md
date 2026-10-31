# Projet : socle de la couche `app` (fichiers livrés)

**Statut** : référence — socle de la couche `app` livré par les garanties couverture, e2e et versionnement, 2026-10-30.
**Risque** : HIGH

<!-- scope
files:
  - app/data/souq-waqif-boucle.json
  - app/data/souq-waqif.json
  - app/e2e/chemins-critiques.test.ts
  - app/eslint.config.js
  - app/eslint.config.test.ts
  - app/index.html
  - app/package-lock.json
  - app/package.json
  - app/playwright.config.test.ts
  - app/playwright.config.ts
  - app/scripts/extract-souq.ts
  - app/src/city/attribution.test.ts
  - app/src/city/attribution.ts
  - app/src/city/buildings.test.ts
  - app/src/city/buildings.ts
  - app/src/city/canvas-double.ts
  - app/src/city/extract-souq.test.ts
  - app/src/city/licence.ts
  - app/src/city/souq-data.test.ts
  - app/src/city/souq-data.ts
  - app/src/city/souq.test.ts
  - app/src/city/souq.ts
  - app/src/main.test.ts
  - app/src/main.ts
  - app/src/route/geo.test.ts
  - app/src/route/geo.ts
  - app/src/route/itineraries.test.ts
  - app/src/route/itineraries.ts
  - app/src/route/path.test.ts
  - app/src/route/path.ts
  - app/src/route/speed.test.ts
  - app/src/route/speed.ts
  - app/src/route/walk.test.ts
  - app/src/route/walk.ts
  - app/src/safety/visibility.test.ts
  - app/src/safety/visibility.ts
  - app/src/ui/contrast.test.ts
  - app/src/ui/contrast.ts
  - app/src/ui/doha-corniche.svg
  - app/src/ui/doha-souq-waqif.svg
  - app/src/ui/home.css
  - app/src/ui/home.test.ts
  - app/src/ui/home.ts
  - app/src/ui/panel.test.ts
  - app/src/ui/panel.ts
  - app/src/ui/pune-fc-road.svg
  - app/src/ui/pune-vieille-ville.svg
  - app/src/ui/route-choice.test.ts
  - app/src/ui/route-choice.ts
  - app/src/xr/experience.test.ts
  - app/src/xr/experience.ts
  - app/src/xr/frame.test.ts
  - app/src/xr/frame.ts
  - app/src/xr/joystick.test.ts
  - app/src/xr/joystick.ts
  - app/src/xr/session.test.ts
  - app/src/xr/session.ts
  - app/tsconfig.json
  - app/vite.config.test.ts
  - app/vite.config.ts
-->

## 1. Besoin

Le socle de `app/` : configuration TypeScript, Vite, ESLint et Playwright,
page d'entrée, et module de sécurité-visibilité (APP-001) avec son test. Ces
fichiers ont été livrés par les chantiers de garantie ; une fois leurs fiches
closes, le rappel de périmètre de check-docs (QUA-016) les signalerait sans
fiche. Cette fiche de référence les couvre ; elle ne décrit aucun chantier et
n'est jamais proposée au lancement.

## 2. Hors périmètre

Toute modification de ces fichiers : elle passe par un chantier dont le bloc
`scope` les cite. Cette fiche ne sert pas de périmètre de travail.

## 3. Décisions

- 2026-10-30 (humain) : couvrir le socle de `app/` par une fiche de référence,
  sur le modèle de `docs/projects/kit-mechanics.md`, plutôt que d'affaiblir le
  rappel de périmètre (QUA-016, rappel de cadrage, bloquant). Contrats servis
  par ces fichiers : APP-001 (sécurité-visibilité, le réel reste visible),
  QUA-004 (couverture de test à 100 % de la couche app).

## Reprise

- **Dernier état** (2026-10-30) : fiche créée à la clôture de la garantie
  couverture, rien à reprendre. Un nouveau fichier de socle livré par un
  chantier s'ajoute ici à sa clôture.
- 2026-10-31 : clôture du chantier doha-souq-waqif (souk de Doha, voir le journal) : ses fichiers de code, de test et
  d'e2e s'ajoutent au périmètre ci-dessus, comme le demande la ligne précédente.
