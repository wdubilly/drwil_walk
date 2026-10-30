# Projet : socle de la couche `app` (fichiers livrés)

**Statut** : référence — socle de la couche `app` livré par les garanties couverture, e2e et versionnement, 2026-10-30.
**Risque** : HIGH

<!-- scope
files:
  - app/eslint.config.js
  - app/eslint.config.test.ts
  - app/index.html
  - app/playwright.config.test.ts
  - app/playwright.config.ts
  - app/src/safety/visibility.test.ts
  - app/src/safety/visibility.ts
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
