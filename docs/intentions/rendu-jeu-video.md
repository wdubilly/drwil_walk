# Intention : un rendu de jeu vidéo moderne (fiche d'ensemble)

**Statut** : proposée le 2026-11-02 ; découpe d'un plan en dix lots fourni par le demandeur, cadré ici sans rien coder.

## Besoin

Le demandeur veut un bon rendu graphique : se promener « à hauteur d'homme » dans une ville détaillée et immersive, avec une
qualité inspirée des jeux vidéo modernes. Le plan fourni (audit, moteur, streaming, bâtiments, rues, données, ambiance,
sécurité XR, tests Quest 3, finitions) est découpé en intentions indépendantes, chacune devenant une fiche de chantier
quand elle sera mûre. La priorité est la qualité visible à hauteur d'homme, pas le nombre de polygones.

## Décisions du demandeur (2026-11-02)

- Google Photorealistic 3D Tiles est **abandonné** ; le retrait du code dormant, dépendances, choix et e2e a été décidé
  le 2026-11-05 et réalisé dans le recentrage du générateur.
- Style visé : « jeu vidéo moderne » (ni cartoon figé, ni photoréalisme photographique) ; à préciser par un essai au casque (`docs/intentions/essai-casque-ambiance-cartoon.md`).
- La tablette et le tactile sont dans le périmètre dès les premiers lots (`docs/intentions/rendu-tablette-tactile.md`).

## Existant

Lu le 2026-11-02 (`app/src/city/`, `app/src/xr/`) :

- Matériaux simples : `MeshToonMaterial` (`app/src/city/toon.ts`, `app/src/city/tree-pack.ts`), `MeshLambertMaterial` (`app/src/city/props.ts`), `MeshBasicMaterial` ailleurs ; aucun matériau PBR, aucune texture de façade.
- Bâtiments : une géométrie fusionnée globale (`app/src/city/buildings.ts`, `mergeGeometries`), arbres et mobilier instanciés (`app/src/city/tree-instances.ts`, `app/src/city/props.ts`).
- Aucune ombre portée, aucun LOD, aucun diagnostic de performance (ni images par seconde, ni appels de rendu) : les 72 images par seconde n'ont jamais été mesurées.
- Les quatre villes tiennent dans `app/data/` (2,8 Mo au total) : le streaming n'est pas évident à justifier pour les itinéraires figés.
- Le passthrough sans ciel virtuel est un choix tranché le 2026-10-31 (`docs/intentions/rendu-ville.md`, `APP-001`).

## Ordre proposé

Ordre fixé le 2026-11-02 par le demandeur. Le sondage de lancement trie par priorité (`[P0]` d'abord) puis par chemin ; chaque
niveau ci-dessous est donc distinct pour que l'ordre tienne. À la création d'une fiche, reporter sa priorité dans
`docs/projects/pending.md` (c'est là que l'outil la lit) ; l'index des intentions porte la même priorité entre crochets.

1. `[P0]` `docs/intentions/rendu-mesures-diagnostic.md` : sans mesure, aucun des lots suivants n'est vérifiable.
2. `[P1]` `docs/intentions/rendu-profils-graphiques.md`, puis `docs/intentions/rendu-tablette-tactile.md` (indépendantes).
3. `[P2]` `docs/intentions/rendu-facades-batiments.md`, puis `docs/intentions/rendu-lod-cellules.md` (seulement si les mesures le justifient), puis `docs/intentions/rendu-rues-mobilier.md`.
4. `[P3]` `docs/intentions/rendu-eclairage-ambiance.md`, puis `docs/intentions/rendu-sources-donnees.md` (en dernier, ou jamais).

## Règles pour toutes les fiches qui en sortent

- Tout chantier touchant `app/` est HIGH (risque physique) : la sécurité-visibilité (`APP-001`) reste un critère testé, jamais assouplie pour le rendu ; aucun élément graphique ne masque les informations de sécurité.
- Casque, PC et tablette : chaque fiche dit ce qu'elle change sur chacune des trois cibles ; un effet sans solution de repli est refusé ; WebGPU n'est pas requis.
- Aucune mesure ni validation Quest 3 n'est annoncée sans essai physique (`QUA-013`) : ce qui ne s'essaie pas ici est écrit « humain » ou « non vérifié ».
- Licences : tout modèle, texture ou jeu de données ajouté documente sa licence et sa provenance (`app/src/city/licence.ts`, `APP-003`).

## Questions à trancher

- [decision] « Jeu vidéo moderne » : quels jeux ou images servent de référence, pour fixer le niveau de détail visé ?
- Retrait du code Google dormant : décidé et réalisé le 2026-11-05.
