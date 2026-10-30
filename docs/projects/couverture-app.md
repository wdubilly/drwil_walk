# Garantie : couverture de test de la couche `app`

**Statut** : ouvert le 2026-10-30 — garantie bloquante, écrite par `drwil guarantees`.
**Risque** : HIGH
**Maturité** : à affiner
**Garantie** : bloquante

<!-- scope
files:
  - .drwil/ia-first.json
  - .github/workflows/ia-first.yml
  - app/package.json
  - app/package-lock.json
  - app/tsconfig.json
  - app/index.html
  - app/vite.config.ts
  - app/vite.config.test.ts
  - app/eslint.config.js
  - app/eslint.config.test.ts
  - app/src/main.ts
  - app/src/main.test.ts
  - app/src/route/speed.ts
  - app/src/route/speed.test.ts
  - app/AGENTS.md
  - docs/architecture.md
  - docs/contracts.md
  - docs/recipes/run-locally.md
  - docs/intentions/README.md
  - docs/intentions/test-voisin-module-pur.md
  - docs/intentions/test-desactive-cite-fiche.md
  - INSTALL.md
  - README.md
-->

## 1. Besoin

drwil garantit une couverture de test à 100 % (lignes, branches, fonctions, instructions selon ce que l'outil mesure) sur chaque couche. Cette couche n'a pas encore son contrôle :

- pile non détectée : outil de couverture inconnu

## Critères d'acceptation

- Le contrôle de couverture de la couche `app` est déclaré, cité par le contrat de couverture du projet et vert à 100 % — `QUA-004`

## 4. Décisions

- Garantie obligatoire, sans dérogation : un contrôle non exécuté n'est jamais passé (`QUA-013`), aucun contrôle n'est contourné (`QUA-019`).

- 2026-10-30, décision humaine du demandeur : couverture mesurée par c8 autour de Vitest (`npm test`), à 100 % sur lignes, branches, fonctions et instructions, **sans aucune exclusion** (y compris le code d'amorçage three.js/WebXR, testé avec des doublures).

- 2026-10-30, cadrage du socle (agent, dans la stack décidée) : ce chantier pose le socle de la couche `app/` (package.json, tsconfig strict, Vite en HTTPS avec `--host`, Vitest, ESLint), un premier module réel de logique pure (module route, fichier speed.ts : bornage 1 à 8 km/h, pas de 0,1, défaut 4,0, conversion en m/s) et un point d'entrée minimal, tous testés. Les fonctionnalités de la v0.1 (XR, ville, itinéraires, sécurité, interface) restent à des chantiers à part.
- 2026-10-30, mesure par c8 (agent, pour tenir la décision « sans aucune exclusion ») : les tests Vitest tournent en threads (`pool: "threads"`) et le code est importé par Node avec retrait natif des types (`experimental.viteModuleRunner: false`). Raison : un fork Vitest est terminé par signal et n'écrit pas sa couverture V8 (c8 lisait 0 %) ; le code transformé par Vite fausse les positions (c8 lisait des branches sur des commentaires). Conséquence : les imports relatifs portent l'extension .ts (options `allowImportingTsExtensions` et `erasableSyntaxOnly` du tsconfig). Les fichiers de configuration de Vite et d'ESLint entrent dans la mesure et ont leur test.
- 2026-10-30, contrats du registre « à câbler au premier chantier » (agent) : câblés par l'outillage de la stack — `QUA-002`, `QUA-007`, `QUA-008` (ESLint, contrôle `lint-app`), `QUA-005` (`tsc --noEmit`, contrôle `typecheck-app`), `SEC-012` (license-checker-rseidelsohn avec liste autorisée, contrôle `licenses-app`). Restent MANUAL, faute d'outil prêt : `QUA-006` et `QUA-009` (un script dédié chacun), avec une intention chacun dans `docs/intentions/`.
- 2026-10-30, liste de licences autorisées de `SEC-012` (agent, à revoir par le demandeur) : licences permissives (MIT, ISC, Apache-2.0, BSD-2/3-Clause, 0BSD, BlueOak-1.0.0, CC0-1.0, CC-BY-3.0/4.0, Unlicense, Python-2.0) et MPL-2.0, copyleft faible au niveau du fichier, présent par `lightningcss` (outil de build de Vite, non distribué). Aucun copyleft fort.
- 2026-10-30, CI : `.github/workflows/ia-first.yml` installe les dépendances de `app/` (`npm ci`) avant `run-checks`, sans quoi les contrôles de la couche ne pourraient pas tourner en CI (`QUA-013`).

## Contrats cités

- `QUA-004` (créé par ce chantier, depuis `catalog:QUA-004`) : couverture de test à 100 % de la couche `app`, contrôle `coverage-app`.
- `QUA-002`, `QUA-005`, `QUA-007`, `QUA-008`, `SEC-012` : contrôle câblé par ce chantier (champ Manual retiré).
- `QUA-006`, `QUA-009` : restent MANUAL (intentions ouvertes).
- `QUA-013` (un contrôle non exécuté n'est pas passé), `QUA-019` (aucun contournement), `QUA-011` (docs à jour dans le même commit).

## 2. Hors périmètre

- Les fonctionnalités de la v0.1 (session XR, ville, itinéraires, sécurité-visibilité `APP-001`, interface) : chantiers à part.
- La garantie e2e (`docs/projects/e2e-chemins-critiques.md`) et l'audit de dépendances `SEC-006`.

## Points à trancher

*(aucun : décisions prises le 2026-10-30)*

## 5. Lots

- **Lot 1 — résoudre la garantie** : voir le besoin ci-dessus, puis relancer `npx drwil guarantees`.

## 6. Reprise

- **Dernier état** : écrite par `drwil guarantees` ; tant qu'elle n'est pas résolue, `drwil verify` est en FAIL et `/drwil-start` ne propose qu'elle.
