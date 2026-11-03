# Intention : retirer les alias d'extraction par ville

**Statut** : proposée le 2026-11-03.

## Besoin

Après le chantier `extraction-generique`, `app/scripts/extract-pune.ts`, `extract-corniche.ts` et `extract-fc-road.ts` ne sont
plus que des alias de `app/scripts/cities.ts`. Ils n'existent que parce que leurs tests (`app/src/city/extract-*.test.ts`),
hors du périmètre de ce chantier, les importent. Les retirer finit la généralisation : un seul test paramétré par ville.

## Existant

Lu le 2026-11-03.

- Les alias exportent `PUNE_BBOX`, `CORNICHE_BBOX`, `FC_ROAD_BBOX`, leurs agents et `extractPune`, `extractCorniche`, `extractFcRoad`.
- Les tests ne s'exécutent que sous `src/` (Vitest ne lit pas `app/scripts/`).
- `app/AGENTS.md` (lignes sur `extract-souq.ts` et les commandes `npm run extract*`) décrit encore l'ancienne organisation.

## Questions

- Un seul test paramétré sur `CITIES` remplace-t-il les trois fichiers de test sans perdre la vérification de l'emprise ?
- `app/AGENTS.md` doit être mis à jour dans le même chantier.
