# Intention : retirer les alias d'extraction par ville

**Statut** : proposée le 2026-11-03.

## Besoin

Après le chantier `extraction-generique`, `app/scripts/extract-pune.ts`, `app/scripts/extract-corniche.ts` et `app/scripts/extract-fc-road.ts` ne sont
plus que des alias de `app/scripts/cities.ts`. Ils n'existent que parce que leurs tests (`app/src/city/extract-*.test.ts`),
hors du périmètre de ce chantier, les importent. Les retirer finit la généralisation : un seul test paramétré par ville.

## Existant

Lu le 2026-11-03.

- Les alias exportent `PUNE_BBOX`, `CORNICHE_BBOX`, `FC_ROAD_BBOX`, leurs agents et `extractPune`, `extractCorniche`, `extractFcRoad`.
- Les tests ne s'exécutent que sous `app/src/` (Vitest ne lit pas `app/scripts/`).
- `app/AGENTS.md` décrivait encore l'ancienne organisation : corrigé le 2026-11-03, hors chantier.

## Questions à trancher

*(aucune : tranchées le 2026-11-03)*

- Un seul test paramétré sur `CITIES` remplace les trois fichiers de test, sans perdre la vérification de l'emprise
  (décision du demandeur, 2026-11-03).

## Cadrée

Cette intention est cadrée en fiche : `docs/projects/retirer-alias-extraction.md` (2026-11-03).
