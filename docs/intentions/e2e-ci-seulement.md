# Intention : l'e2e Playwright tourne en CI seulement, plus sur le poste du demandeur

**Statut** : proposée le 2026-11-07 ; cadrage, rien n'est décidé ni planifié. Touche le kit drwil, pas seulement ce dépôt.

## Besoin

Exprimé par le demandeur le 2026-11-07 : arrêter de lancer l'e2e Playwright en local, il consomme trop de ressources
(Chromium sans interface, SwiftShader, plus de 7 minutes). La CI GitHub suffit à le faire tourner, avec ses captures à
télécharger. Le contrôle doit rester visible et obligatoire : il ne disparaît pas, il change de lieu.

## Existant

Lu le 2026-11-07.

- Le check `e2e` est déclaré dans `.drwil/ia-first.json` (`npm run e2e`, `paths: ["app/**"]`, `degradable: false`).
- `paths` ne sert qu'au pre-commit : le check y est différé hors de `app/**`. Avec `node .githooks/run-checks.mjs` ou
  `npx drwil verify --agent` lancés à la main, tout tourne ; seul un « OK » dont les fichiers n'ont pas changé est
  réemployé.
- La CI (`.github/workflows/ia-first.yml`) installe Chromium puis lance `.githooks/run-checks.mjs`, e2e compris.
- Le moteur n'a aucun moyen de dire « ce check tourne en CI seulement » : pas de `ciOnly`, de `--skip` ni de variable. Retirer
  le check de la configuration serait un contournement (`QUA-019`) et contredirait la garantie e2e obligatoire
  (`npx drwil guarantees`, `QUA-020`).
- `degradable` ne répond pas au besoin : il signale « non exécuté » si l'outil manque, il n'empêche pas de lancer le check
  quand l'outil est là (`QUA-013`).

## Piste

Une variable d'environnement locale `DRWIL_SKIP` (décidée le 2026-11-07, voir plus bas) : en local, le check nommé est
classé « couvert par la CI » (visible,
jamais un succès silencieux) ; en CI, il est exécuté et son absence échoue. `.githooks/check-control-coverage.mjs` continue de
vérifier le job CI sur les mêmes `paths`. Elle exige d'amender `QUA-013` et `QUA-020` et d'ouvrir une PR dans le kit drwil.

## Contournement provisoire

Pour un changement de docs seul : commiter (le pre-commit diffère l'e2e), laisser la CI le jouer, et ne pas lancer
`drwil verify --agent` ni `.githooks/run-checks.mjs` complets ; lancer `node .githooks/check-docs.mjs`. Un changement qui touche
`app/` garde l'e2e au pre-push et en CI.

## Décisions du demandeur (2026-11-07)

- **Mécanisme** : une variable d'environnement locale, `DRWIL_SKIP=e2e` (pas de propriété `ciOnly`). Le check est alors
  classé « couvert par la CI », visible dans le rapport, jamais un succès silencieux ; en CI la variable est ignorée.
- **Verdict** : `GOVERNANCE: PASS` local vaut « vérifié » avec l'e2e marqué « couvert par la CI ».
- **Autres checks lourds** : tous ceux qui sont lourds peuvent suivre, retenus d'après leur durée mesurée.
- **Pre-push** : l'e2e est laissé entièrement à la CI.

## Allègement de la CI (demandé le 2026-11-07)

Les 8 derniers runs sont verts mais durent 13 à 19 minutes. Pistes, à réaliser par un chantier :

- **Doublons** : `on: [push, pull_request]` lance deux runs par commit poussé sur une branche avec PR, plus un troisième au
  merge. Piste : `push` limité à `master` (`on: { push: { branches: [master] }, pull_request: {} }`) ; la PR garde sa
  vérification complète et le rejeu avec les hooks de la branche principale.
- **Annulation des runs périmés** : un `concurrency` avec `cancel-in-progress` sur la branche, pour ne pas finir un run
  qu'un nouveau push rend inutile.
- **Cache** : cache npm (`actions/setup-node`) et des navigateurs Playwright, pour raccourcir l'installation.
- **E2E conditionné à `app/`** : ne le lancer que si `app/` change. Piste la plus risquée : elle touche `QUA-013` (la CI doit
  rester complète) et la garantie e2e obligatoire ; à ne retenir qu'avec l'accord explicite du demandeur.

Chaque piste se mesure : durée avant et après, sur un run de référence.

Réalisé le 2026-11-11 par le chantier `ci-allegee` (journal `docs/projects/journal.md`, PR #96) : doublons, runs périmés, caches,
`runAt: ["ci"]` et tranches e2e. Run de référence : environ 17 minutes avant (médiane des 8 derniers runs de `master`), environ
7 minutes après. Reste ouverte la piste « e2e conditionné à `app/` » (refusée sans accord du demandeur) et `DRWIL_SKIP`.

## Questions à trancher

*(aucune)* ; à vérifier à la réalisation : que `DRWIL_SKIP` reste impossible à activer en CI, et que l'amendement de
`QUA-013` et `QUA-020` soit accepté par les mainteneurs du kit.