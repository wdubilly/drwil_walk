# Détour : le relevé Overture lit les emprises par les alias d'extraction au lieu de CITIES (détour de docs/projects/retirer-alias-extraction.md)

**Statut** : ouvert le 2026-11-03 (détour de docs/projects/retirer-alias-extraction.md, branche detour/overture-zones-cities).
**Risque** : HIGH
**Maturité** : en cours

<!-- scope
files:
  - app/scripts/overture-coverage.ts
  - app/src/city/overture-coverage.test.ts
-->

(cadrage : la correction et son test, rien d'autre ; le cadrage de docs/projects/retirer-alias-extraction.md ne s'élargit jamais pour un détour.)

## 1. Besoin

le relevé Overture lit les emprises par les alias d'extraction au lieu de CITIES : défaut préalable rencontré pendant docs/projects/retirer-alias-extraction.md, hors de son cadrage.

## Critères d'acceptation

- le relevé Overture lit les emprises par les alias d'extraction au lieu de CITIES : corrigé, gardé par un test de non-régression vu échouer avant la correction

## 4. Décisions

- Un détour s'ouvre sans demander : le contrôle est à la fusion de sa PR. Contrats concernés : QUA-017 (pas de travail direct sur la branche principale), QUA-019 (pas de contournement).

## 7. Reprise

- PR intitulée « Détour de docs/projects/retirer-alias-extraction.md : le relevé Overture lit les emprises par les alias d'extraction au lieu de CITIES » ; avant le push, entrée de journal citant la branche detour/overture-zones-cities et suppression de cette fiche ; PR fusionnée : `node .githooks/detour.mjs resume`.
