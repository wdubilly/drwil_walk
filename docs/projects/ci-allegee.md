# Chantier : alléger la CI sans retirer aucun contrôle

**Statut** : cadré le 2026-11-07, révisé le 2026-11-11 (kit drwil 0.11.1 : shards et rejeu évité sur PR).
**Risque** : HIGH
**Maturité** : à affiner
**Intention** : `docs/intentions/e2e-ci-seulement.md`

<!-- scope
files:
  - .github/workflows/ia-first.yml
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/deployment.md
-->

## 1. Besoin

Les derniers runs de la CI GitHub sont verts mais durent 13 à 19 minutes, et un commit poussé sur une branche avec PR
déclenche deux runs (`push` et `pull_request`), un troisième au merge. Réduire ce temps et ces doublons **sans retirer ni
affaiblir aucun contrôle** : l'e2e Playwright reste lancé en CI, le rejeu avec les hooks de la branche principale aussi.

## Critères d'acceptation

- Un commit poussé sur une branche avec PR ne lance qu'un run de contrôles complet, et la branche principale garde le sien
- Un push qui rend un run en cours périmé l'annule, sans jamais annuler un run de la branche principale
- Les contrôles qui tournent en CI sont exactement les mêmes qu'avant (e2e, couverture, secrets, rejeu des hooks de la
  branche principale) : le workflow n'en retire aucun — `QUA-013`
- Le contrôle e2e est découpé en tranches parallèles (`shards`, kit 0.11.1) : la CI joue une tranche par job, le job `checks`
  agrège leurs verdicts, et une tranche manquante, en double ou en échec fait échouer l'agrégation — `QUA-013`
- En local, `run-checks` et `drwil verify` jouent toujours l'e2e en un seul passage (aucune tranche n'est sautée)
- La durée d'un run de référence, avant et après, est relevée dans le journal du chantier [human]

Le chantier crée le contrat manuel « la CI reste complète quand on l'allège » dans `docs/contracts.md` (le texte est
préparé, hors dépôt : `docs/contracts.md` ne se commite qu'en BUILD) et y rattache les critères sans identifiant ci-dessus.

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Conditionner l'e2e aux fichiers de `app/` : touche la garantie e2e obligatoire et le contrat « un contrôle non exécuté n'a
  pas réussi » (`QUA-013`) ; refusé sauf accord explicite du demandeur.
- La variable `DRWIL_SKIP=e2e` et le verdict local « couvert par la CI » : évolution du kit drwil, dans une PR du kit
  (`docs/intentions/e2e-ci-seulement.md`). Les shards et le rejeu évité sur PR, eux, existent depuis le kit 0.11.1 et
  entrent dans ce chantier.
- Toute modification de `app/` ou des contrôles eux-mêmes.

## 3. Constraints

- Un chantier qui touche la CI ou `.drwil/` est HIGH ; le rejeu avec les hooks de la branche principale sur PR ne doit pas
  être affaibli : une PR qui allège un contrôle ne se valide pas elle-même.
- Aucun contrôle ne devient « non exécuté » : l'installation de gitleaks, de diff-cover, des dépendances `app/` et de
  Chromium reste en place, seule leur installation peut être mise en cache.
- Un cache ne doit jamais masquer une version : versions épinglées conservées, clé de cache dérivée des verrous.

## 4. Décisions

- 2026-11-07 : pistes retenues, dans cet ordre : limiter `push` à la branche principale, annuler les runs périmés
  (`concurrency` avec `cancel-in-progress`), mettre en cache npm et les navigateurs Playwright.
- 2026-11-07 : l'e2e n'est **pas** conditionné à `app/` dans ce chantier.
- 2026-11-11 : le kit 0.11.1 découpe un contrôle lent en tranches (`shards: N`, 2 à 16, la commande lit `DRWIL_SHARD_INDEX` et
  `DRWIL_SHARD_TOTAL`) et ne rejoue plus sur une PR un contrôle lent dont les fichiers sont inchangés (verdict repris, vérifié
  par empreinte). Le contrôle e2e actuel est `npm run e2e` (`playwright test`, `workers: 1`, une vingtaine de fichiers dans
  `app/e2e/`, environ 415 s) : Playwright sait se limiter à une tranche par `--shard=i/N`.
- 2026-11-11 : N = 2 tranches pour l'e2e (décidé par le demandeur). Mesure sur un run de référence de `master` : job `checks`
  16 min 45 s, `.githooks/run-checks.mjs` 909 s dont l'e2e environ 400 s, installation par job environ 90 s (dépendances de `app/` 45 s,
  Chromium 31 s). Le reste des contrôles (environ 500 s) ne se découpe pas : avec N = 2 une tranche fait environ 200 s plus
  l'installation, ce qui sort l'e2e du chemin critique ; N = 4 ne réduirait pas le temps total et coûterait plus de minutes.
  Gain estimé : environ 5 minutes sur `run-checks` (à relever dans le journal du chantier).

## 5. Points à décider

- [decision] Le workflow `.github/workflows/ia-first.yml` n'a pas de zone du projet (marqueurs `drwil-project-begin/end`) : les
  étapes ajoutées à la main (diff-cover, dépendances de `app/`, Chromium, captures) seraient supprimées par une montée du kit.
  Les ajouter dans une zone du projet avant les shards ? (à vérifier : `npx drwil doctor`, point « Traces d'une montée »)

## 6. Incréments

- **Incrément 1 — doublons et runs périmés** [AI] : `on` limité à la branche principale pour `push`, `concurrency` par
  référence. Critère de sortie : une PR de test ne déclenche qu'un run complet par commit, et la CI est verte.
- **Incrément 2 — caches** [AI] : cache npm (`setup-node`) et cache des navigateurs Playwright. Critère de sortie : durée du run
  de référence relevée avant et après, CI verte, aucun contrôle « non exécuté ».
- **Incrément 3 — shards de l'e2e** [AI] : déclarer `shards: 2` sur le contrôle `e2e` de `.drwil/ia-first.json`, et lui faire lire
  `DRWIL_SHARD_INDEX` / `DRWIL_SHARD_TOTAL` (`--shard=i/N`). Critère de sortie : sur une PR de test, 2 jobs jouent chacun leur
  tranche, `checks` agrège 2 verdicts, une tranche retirée à la main fait échouer l'agrégation, et `drwil verify` joue toujours
  l'e2e en un seul passage.

## 7. Reprise

- **Dernier état** (2026-11-11) : brief révisé pour le kit 0.11.1 (shards, rejeu évité), rien d'implémenté ; un point à décider.
- **Travail non commité** : la révision de ce brief, sur la branche `fiche/ci-allegee-shards`.
- **Prochaine étape** : [decision] le demandeur tranche la zone du projet du workflow, puis lance le chantier (`/drwil-start`).
