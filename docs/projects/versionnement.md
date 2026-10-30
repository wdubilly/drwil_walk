# Garantie : dépôt, forge, CI et protection de la branche principale

**Statut** : ouvert le 2026-10-30 — garantie bloquante, écrite par `drwil guarantees`.
**Risque** : HIGH
**Maturité** : à affiner
**Garantie** : bloquante

<!-- scope
files:
  - .drwil/ia-first.json
-->

## 1. Besoin

Un projet gouverné a un dépôt Git, une forge (GitHub ou GitLab), une CI qui rejoue les contrôles du hook et une branche principale protégée (fusion par PR/MR, contrôles requis, sans contournement même pour les administrateurs). Il manque :

- pas de dépôt distant `origin` sur GitHub ou GitLab
- pas de CI déclarée (`npx drwil init --ci github` ou `--ci gitlab`)

## Critères d'acceptation

- `drwil guarantees` ne signale plus rien sur le dépôt, la forge, la CI ni la protection de branche — contrat à créer

## 4. Décisions

- Garantie obligatoire, sans dérogation : un contrôle non exécuté n'est jamais passé (`QUA-013`), aucun contrôle n'est contourné (`QUA-019`).

## Points à trancher

- [décision] Accord pour poser la protection de la branche principale (`drwil guarantees --protect`) ?

## 5. Lots

- **Lot 1 — résoudre la garantie** : voir le besoin ci-dessus, puis relancer `npx drwil guarantees`.

## 6. Reprise

- **Dernier état** : écrite par `drwil guarantees` ; tant qu'elle n'est pas résolue, `drwil verify` est en FAIL et `/drwil-start` ne propose qu'elle.
