# Garantie : test de bout en bout des chemins critiques

**Statut** : ouvert le 2026-10-30 — garantie bloquante, écrite par `drwil guarantees`.
**Risque** : HIGH
**Maturité** : à affiner
**Garantie** : bloquante

<!-- scope
files:
  - .drwil/ia-first.json
-->

## 1. Besoin

drwil exige un test de bout en bout (e2e) des chemins critiques, rejoué par un contrôle (`catalog:QUA-020`). Il manque :

- E2E : aucun contrôle `e2e` déclaré pour rejouer le test des chemins critiques

## Critères d'acceptation

- Les chemins critiques nommés par le demandeur sont couverts par un test e2e rejoué par le contrôle `e2e` — contrat à créer

## 4. Décisions

- Garantie obligatoire, sans dérogation : un contrôle non exécuté n'est jamais passé (`QUA-013`), aucun contrôle n'est contourné (`QUA-019`).

## Points à trancher

- [décision] Quels sont les chemins critiques, et avec quel outil e2e de la pile les tester ?

## 5. Lots

- **Lot 1 — résoudre la garantie** : voir le besoin ci-dessus, puis relancer `npx drwil guarantees`.

## 6. Reprise

- **Dernier état** : écrite par `drwil guarantees` ; tant qu'elle n'est pas résolue, `drwil verify` est en FAIL et `/drwil-start` ne propose qu'elle.
