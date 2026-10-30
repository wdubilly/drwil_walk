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
