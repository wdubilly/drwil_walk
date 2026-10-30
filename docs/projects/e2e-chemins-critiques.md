# Garantie : test de bout en bout des chemins critiques

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
  - app/playwright.config.ts
  - app/playwright.config.test.ts
  - app/src/main.ts
  - app/src/main.test.ts
  - app/src/route/*
  - app/src/safety/*
  - app/src/xr/*
  - app/src/city/*
  - app/src/ui/*
  - app/e2e/*
  - app/AGENTS.md
  - docs/architecture.md
  - docs/features.md
  - docs/contracts.md
  - docs/contracts-catalog.md
  - docs/recipes/run-locally.md
  - docs/intentions/*
  - INSTALL.md
  - README.md
-->

## 1. Besoin

drwil exige un test de bout en bout (e2e) des chemins critiques, rejoué par un contrôle (`catalog:QUA-020`). Il manque :

- E2E : aucun contrôle `e2e` déclaré pour rejouer le test des chemins critiques

## Critères d'acceptation

- Les chemins critiques nommés par le demandeur (entrée en réalité mixte, marche à la vitesse réglée, fondu tête baissée) sont couverts par un test e2e rejoué par le contrôle `e2e` — `QUA-020`
- La sécurité-visibilité tête baissée, l'opacité bornée et la session `immersive-ar` sont prouvées par le contrôle `app-001` ; la zone tapis, pas encore codée, reste à vérifier par l'humain sur le Quest 3 [human] — `APP-001`

## Contrats modifiés

- `APP-001` — ancien critère : « **Manual** : contrôle à compléter au premier chantier […] D'ici là, vérification humaine sur le Quest 3 » — raison : premier chantier qui code le module safety ; le contrat reçoit son **Check** et ses **Tests** comme son propre champ **Manual** le prévoit, la partie zone tapis (non codée) restant manuelle (consigne du demandeur au lancement, 2026-10-30)

## 2. Hors périmètre

- Zone tapis (volume transparent défini à la manette, `localStorage`) et vignette réelle : chantiers suivants.
- Ville réelle (3D Tiles Google, repli OpenStreetMap), itinéraires GPS, pause, recalibrage, panneau d'infos en XR : chantiers suivants.

## 4. Décisions

- Garantie obligatoire, sans dérogation : un contrôle non exécuté n'est jamais passé (`QUA-013`), aucun contrôle n'est contourné (`QUA-019`).

- 2026-10-30, décision humaine du demandeur : e2e avec Playwright et un Quest 3 émulé (IWER), 3 chemins critiques : (1) accueil → entrée en réalité mixte, session `immersive-ar` ; (2) marche : la position avance à la vitesse réglée, le joystick change la vitesse de ±0,1 km/h ; (3) sécurité APP-001 : tête baissée au-delà de 25°, la ville devient transparente.

## Points à trancher

*(aucun : décisions prises le 2026-10-30)*

## 5. Lots

- **Lot 1 — résoudre la garantie** : voir le besoin ci-dessus, puis relancer `npx drwil guarantees`.
  Première tranche verticale qui rend les chemins réels : écran d'accueil (vitesse, opacité, rappel de sécurité,
  bouton « Entrer en réalité mixte »), session `immersive-ar`, rue simple (sol et blocs), marche en ligne droite à la
  vitesse réglée, joystick droit ±0,1 km/h, module safety (fondu tête baissée, opacité bornée) ; e2e Playwright + IWER.

## 6. Reprise

- **Dernier état (2026-10-30)** : lot 1 codé et commité sur `workstream/e2e-chemins-critiques` : première tranche
  verticale (accueil, session `immersive-ar`, rue simple, marche, joystick, fondu tête baissée), contrôles `app-001`
  et `e2e` déclarés, contrat QUA-020 créé, APP-001 câblé (champ **Manual** réduit à la zone tapis), CI qui installe
  Chromium. `drwil guarantees` : toutes les garanties tenues. `run-checks` vert, couverture c8 à 100 %, e2e 3 chemins
  verts.
- **Bloquant** : `drwil verify` en FAIL pour des raisons hors chantier, traitées par l'humain dans drwil : contrats
  MANUAL en attente d'attestation (SEC-006, QUA-006, QUA-009, QUA-015, QUA-019, APP-001) et contrôle
  `coverage-diff-app` réclamé par `guarantees.layers.app: "existing"`. La clôture n'est donc pas faite.
- **Travail non commité** : aucun.
- **Étape suivante** : humain : attester les contrats MANUAL (`drwil attest <ID>`) et régler le défaut
  `coverage-diff-app` côté drwil, puis verify, clôture et fusion de la PR.
