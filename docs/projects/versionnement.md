# Garantie : dépôt, forge, CI et protection de la branche principale

**Statut** : ouvert le 2026-10-30 — garantie bloquante, écrite par `drwil guarantees`.
**Risque** : HIGH
**Maturité** : à affiner
**Garantie** : bloquante

<!-- scope
files:
  - .drwil/ia-first.json
  - .drwil/installed-files.json
  - .github/workflows/ia-first.yml
  - .github/pull_request_template.md
  - docs/architecture.md
-->

## 1. Besoin

Un projet gouverné a un dépôt Git, une forge (GitHub ou GitLab), une CI qui rejoue les contrôles du hook et une branche principale protégée (fusion par PR/MR, contrôles requis, sans contournement même pour les administrateurs). Il manque :

- ~~pas de dépôt distant `origin` sur GitHub ou GitLab~~ (fait : https://github.com/wdubilly/drwil_walk, branche par défaut `master`)
- pas de CI déclarée (`npx drwil init --ci github` ou `--ci gitlab`)
- branche principale `master` non protégée (`npx drwil guarantees --protect`)

## Critères d'acceptation

- `drwil guarantees` ne signale plus rien sur le dépôt, la forge, la CI ni la protection de branche — contrat à créer

## 4. Décisions

- Garantie obligatoire, sans dérogation : un contrôle non exécuté n'est jamais passé (`QUA-013`), aucun contrôle n'est contourné (`QUA-019`).
- 2026-10-30, décision humaine du demandeur : accord pour poser la protection de la branche principale `master` avec `npx drwil guarantees --protect` (fusion par PR, contrôles requis, sans contournement administrateur).
- CI GitHub écrite par `npx drwil init --ci github` (`.github/workflows/ia-first.yml`, job `checks` qui rejoue `node .githooks/run-checks.mjs`, et le rejeu par les hooks de la branche principale sur une PR) ; le modèle de PR `.github/pull_request_template.md` et l'empreinte des fichiers installés (`.drwil/installed-files.json`) viennent avec et entrent au cadrage, ainsi que la carte `docs/architecture.md`, qui doit citer `.github/workflows/` (QUA-040).

## Points à trancher

- Aucun.

## 5. Lots

- **Lot 1 — résoudre la garantie** : voir le besoin ci-dessus, puis relancer `npx drwil guarantees`.

## 6. Reprise

- **Dernier état** : écrite par `drwil guarantees` ; tant qu'elle n'est pas résolue, `drwil verify` est en FAIL et `/drwil-start` ne propose qu'elle.
