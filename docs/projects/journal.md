# Closed projects journal

Condensed summary of each `docs/projects/` brief once its Status moves to
"done" (the whole brief, not just one point among several of a brief that
otherwise stays open). The detailed brief is then deleted: no more full
history in plain text in the repository, but nothing is lost —
`git log --follow -- docs/projects/<brief>.md` (or the closing commit/PR
cited below) retrieves the full text at any time.

Goal: keep `docs/projects/` light (active briefs only) without sacrificing
traceability, which stays in git anyway. See the recipe
`docs/recipes/working-with-branches.md`, "Closing" section.

One entry per closed project, most recent last.

## 2026-10-30 — Garantie : couverture de test de la couche `app`

- Socle de `app/` (TypeScript strict, Vite en HTTPS, Vitest, ESLint) et premier module de logique pure (vitesse), PR #3.
- Couverture par c8 autour de `npm test`, 100 % sur lignes, branches, fonctions et instructions, sans exclusion (contrôle `coverage-app`, contrat `QUA-004`) ; tests en threads et retrait natif des types pour que c8 mesure les vraies lignes.
- Couverture différentielle à 100 % contre `origin/master` (contrôle `coverage-diff-app`, diff-cover), exigée par drwil pour une couche `existing` ; diff-cover installé en CI.
- Contrôles `typecheck-app`, `lint-app`, `licenses-app` câblés ; `QUA-006` et `QUA-009` restent manuels (intentions ouvertes).
- Fiche de référence `docs/projects/socle-app.md` (décision humaine) : couvre les fichiers du socle de `app/`, qui sans elle n'auraient plus de fiche une fois les garanties closes (rappel de périmètre `QUA-016` bloquant).
- Branche `workstream/couverture-app`. Preuve de clôture : `docs/preuves/couverture-app.md`.

## 2026-10-30 — Garantie : test de bout en bout des chemins critiques

- Première tranche verticale (PR #4) : écran d'accueil, session `immersive-ar`, rue simple, marche à la vitesse réglée, joystick ±0,1 km/h, module safety (fondu tête baissée, opacité bornée).
- Test e2e Playwright avec Quest 3 émulé (IWER) des 3 chemins critiques : entrée en réalité mixte, marche et réglage de vitesse, fondu tête baissée au-delà de 25° (contrôle `e2e`, contrat `QUA-020`, les chemins critiques sont testés de bout en bout).
- Contrat `APP-001` (sécurité-visibilité : le réel reste visible) câblé au contrôle `app-001` ; la zone tapis, pas encore codée, reste à vérifier par l'humain sur le Quest 3 (attesté).
- Branche `workstream/e2e-chemins-critiques`. Preuve de clôture : `docs/preuves/e2e-chemins-critiques.md`.

## 2026-10-30 — Garantie : dépôt, forge, CI et protection de la branche principale

- Dépôt GitHub `wdubilly/drwil_walk` (branche par défaut `master`), CI GitHub `.github/workflows/ia-first.yml` (job `checks` qui rejoue `node .githooks/run-checks.mjs`), modèle de PR et empreinte des fichiers installés, PR #1 et #2.
- Protection de `master` posée par `npx drwil guarantees --protect` (fusion par PR, contrôles requis, sans contournement administrateur) : le contrat `QUA-017` (pas de travail direct sur la branche principale) est tenu ; carte `docs/architecture.md` citant `.github/workflows/` (`QUA-040`).
- `npx drwil guarantees` : « Versionnement : dépôt, forge github, CI et protection de `master` en place » ; `npx drwil verify --evidence` : `GOVERNANCE: PASS` (21 contrats, 15 PASS, 6 attestés).
- Branche `workstream/versionnement`.
