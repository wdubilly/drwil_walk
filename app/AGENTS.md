# app layer context

Read `../AGENTS.md` first: do not repeat what it already says. The detail
of each contract (rule, proof) is in `docs/contracts.md` (from the root):
do not copy it here.

## Context

Couche unique : l'application WebXR entière (TypeScript strict, Vite, three.js), cadrée le 2026-10-30.
Aucun code écrit à cette date : l'organisation ci-dessous est celle à suivre au premier chantier.

- Code dans src/, un dossier par module : xr/ (session `immersive-ar`, manettes), city/ (3d-tiles-renderer,
  repli OSM), route/ (itinéraires, déplacement à vitesse réglée), safety/ (fondu tête baissée, zone tapis,
  opacité, vignette), ui/ (accueil, panneau d'infos).
- La logique (calculs de vitesse, d'opacité, de zone, de trajectoire) est en **fonctions pures**, séparée du rendu
  three.js : c'est elle que les tests unitaires couvrent à 100 %.
- Les itinéraires sont des données (liste de points GPS par itinéraire), pas du code.
- La vitesse passe par une interface `SpeedSource` (réglage manuel en v0.1, Bluetooth plus tard).
- Tests unitaires à côté du code (`*.test.ts`), e2e Playwright dans e2e/ avec un casque émulé (IWER).
- Clé Google lue via `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`, jamais en dur.

## Test pitfalls

*(optional: pitfalls already met while testing this layer, so as not to
meet them again — one per line, dated if useful.)*

## Layer contracts

| ID | Subject | Reference file |
|---|---|---|
| APP-001 | Sécurité-visibilité : le réel reste visible (tête baissée, zone tapis) | module `safety/` (à écrire) |

## Style guide and recipes

- `docs/recipes/refactor-without-breaking.md` pour toute restructuration.
- `docs/recipes/run-locally.md` pour lancer l'application (à compléter au premier chantier).

## Check

Depuis `app/` (commandes à créer au premier chantier) : `npm test` (Vitest + couverture), `npm run typecheck`
(`tsc --noEmit`), `npm run lint`, `npm run build`, `npm run e2e` (Playwright). Depuis la racine,
`node .githooks/run-checks.mjs` les lance toutes.
