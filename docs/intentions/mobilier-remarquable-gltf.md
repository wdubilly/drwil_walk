# Intention : des éléments remarquables en glTF CC0 (point à trancher de rendu-rues-mobilier)

**Statut** : proposée le 2026-11-03.

## Besoin

Le mobilier courant est produit par code ; un élément particulier ou remarquable (fontaine, kiosque, horloge, abribus, statue)
gagnerait à venir d'un modèle glTF CC0, dont la licence et la provenance seraient documentées comme celles du pack d'arbres
(`app/assets/PROVENANCE.md`, `APP-003`). Reste à choisir lesquels et où les prendre.

## Existant

Lu le 2026-11-03 : aucun modèle glTF de mobilier n'est livré (`APP-009`) ; le chargement et l'allègement d'un pack glTF CC0
existent déjà pour les arbres (`app/src/city/tree-pack.ts`, `app/scripts/prepare-nature-pack.ts`), et pourraient servir de
modèle. Les balises OpenStreetMap des extraits ne portent aujourd'hui aucun de ces éléments.

## Questions à trancher

- [human] Quels éléments remarquables, sur quels itinéraires, et depuis quelle source CC0 ?
- Combien de triangles et de maillages leur accorder sans sortir des budgets de la ville ?
