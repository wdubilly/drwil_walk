# Garantie : couverture de test de la couche `app`

**Statut** : ouvert le 2026-10-30 — garantie bloquante, écrite par `drwil guarantees`.
**Risque** : HIGH
**Maturité** : à affiner
**Garantie** : bloquante

<!-- scope
files:
  - .drwil/ia-first.json
-->

## 1. Besoin

drwil garantit une couverture de test à 100 % (lignes, branches, fonctions, instructions selon ce que l'outil mesure) sur chaque couche. Cette couche n'a pas encore son contrôle :

- pile non détectée : outil de couverture inconnu

## Critères d'acceptation

- Le contrôle de couverture de la couche est déclaré, cité par le contrat de couverture du projet et vert — contrat à créer

## 4. Décisions

- Garantie obligatoire, sans dérogation : un contrôle non exécuté n'est jamais passé (`QUA-013`), aucun contrôle n'est contourné (`QUA-019`).

- 2026-10-30, décision humaine du demandeur : couverture mesurée par c8 autour de Vitest (`npm test`), à 100 % sur lignes, branches, fonctions et instructions, **sans aucune exclusion** (y compris le code d'amorçage three.js/WebXR, testé avec des doublures).

## Points à trancher

*(aucun : décisions prises le 2026-10-30)*

## 5. Lots

- **Lot 1 — résoudre la garantie** : voir le besoin ci-dessus, puis relancer `npx drwil guarantees`.

## 6. Reprise

- **Dernier état** : écrite par `drwil guarantees` ; tant qu'elle n'est pas résolue, `drwil verify` est en FAIL et `/drwil-start` ne propose qu'elle.
