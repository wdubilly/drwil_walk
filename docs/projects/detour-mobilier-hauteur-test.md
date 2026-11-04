# Détour : Le test APP-009 des extraits plafonne la hauteur du mobilier à celle d'un banc et échoue dès qu'un extrait porte une poubelle ou un panneau (détour de docs/projects/extraction-mobilier.md)

**Statut** : ouvert le 2026-11-04 (détour de docs/projects/extraction-mobilier.md, branche detour/mobilier-hauteur-test).
**Risque** : HIGH
**Maturité** : en cours

<!-- scope
files:
  - app/src/city/mobilier-data.test.ts
-->

(cadrage : la correction et son test, rien d'autre ; le cadrage de docs/projects/extraction-mobilier.md ne s'élargit jamais pour un détour.)

## 1. Besoin

Le test APP-009 des extraits plafonne la hauteur du mobilier à celle d'un banc et échoue dès qu'un extrait porte une poubelle ou un panneau : défaut préalable rencontré pendant docs/projects/extraction-mobilier.md, hors de son cadrage.

## Critères d'acceptation

- Le test APP-009 des extraits plafonne la hauteur du mobilier à celle d'un banc et échoue dès qu'un extrait porte une poubelle ou un panneau : corrigé, gardé par un test de non-régression vu échouer avant la correction

## 4. Décisions

- Un détour s'ouvre sans demander : le contrôle est à la fusion de sa PR. Contrats concernés : QUA-017 (pas de travail direct sur la branche principale), QUA-019 (pas de contournement).

## 7. Reprise

- PR intitulée « Détour de docs/projects/extraction-mobilier.md : Le test APP-009 des extraits plafonne la hauteur du mobilier à celle d'un banc et échoue dès qu'un extrait porte une poubelle ou un panneau » ; avant le push, entrée de journal citant la branche detour/mobilier-hauteur-test et suppression de cette fiche ; PR fusionnée : `node .githooks/detour.mjs resume`.
