# Chantier : alléger la CI sans retirer aucun contrôle

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : prêt
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
- La durée d'un run de référence, avant et après, est relevée dans le journal du chantier [human]

Le chantier crée le contrat manuel « la CI reste complète quand on l'allège » dans `docs/contracts.md` (le texte est
préparé, hors dépôt : `docs/contracts.md` ne se commite qu'en BUILD) et y rattache les critères sans identifiant ci-dessus.

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Conditionner l'e2e aux fichiers de `app/` : touche la garantie e2e obligatoire et le contrat « un contrôle non exécuté n'a
  pas réussi » (`QUA-013`) ; refusé sauf accord explicite du demandeur.
- La variable `DRWIL_SKIP=e2e` et le verdict local « couvert par la CI » : évolution du kit drwil, dans une PR du kit
  (`docs/intentions/e2e-ci-seulement.md`).
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

## 5. Points à décider

*(aucun)*

## 6. Incréments

- **Incrément 1 — doublons et runs périmés** [AI] : `on` limité à la branche principale pour `push`, `concurrency` par
  référence. Critère de sortie : une PR de test ne déclenche qu'un run complet par commit, et la CI est verte.
- **Incrément 2 — caches** [AI] : cache npm (`setup-node`) et cache des navigateurs Playwright. Critère de sortie : durée du run
  de référence relevée avant et après, CI verte, aucun contrôle « non exécuté ».

## 7. Reprise

- **Dernier état** (2026-11-07) : brief cadré, rien d'implémenté.
- **Travail non commité** : le brief, l'intention et l'index.
- **Prochaine étape** : [decision] le demandeur lance le chantier (`/drwil-start`).
