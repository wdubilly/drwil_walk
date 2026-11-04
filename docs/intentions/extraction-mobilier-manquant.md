# Intention : réextraire les quatre quartiers pour y amener lampadaires, poubelles et panneaux

**Statut** : proposée le 2026-11-03.
**Réexaminée le 2026-11-04** : réextraction faite (chantier extraction-mobilier, voir `docs/projects/journal.md`) : 14 poubelles sur la Corniche, aucun panneau ni lampadaire dans OpenStreetMap pour les quatre emprises, bancs inchangés. Reste vivant : les lampadaires (`docs/intentions/lampadaires-generes.md`) et la requête des nœuds `highway=stop|give_way` (`docs/intentions/requete-panneaux-stop.md`).

## Besoin

Les quatre extraits figés du dépôt ne portent aucun lampadaire (relevé du 2026-11-03), ni poubelle ni panneau : ces deux
dernières balises n'étaient pas demandées à Overpass avant le chantier rendu-rues-mobilier. Le code les lit désormais, mais
rien ne s'affichera tant que les fichiers de `app/data/` n'auront pas été réécrits par une nouvelle extraction (réseau, hors
casque), à relire ensuite (poids des fichiers, attribution, non-régression des tests de sommets).

## Existant

Lu le 2026-11-03 : `app/scripts/osm-tags.ts` reconnaît `highway=street_lamp`, `amenity=bench`, `amenity=waste_basket`,
`traffic_sign` et `highway=stop|give_way` ; `app/scripts/extract-souq.ts` les demande toutes à Overpass (`PROP_NODES`). Les
fichiers `app/data/*.json` datent des extractions du 2026-10-31 et sont restés tels quels : le chantier rendu-rues-mobilier
excluait explicitement toute nouvelle extraction.

## Décisions

- 2026-11-03 : **réextraire les quatre quartiers** avec les balises complètes, pour y amener poubelles et panneaux là où
  OpenStreetMap en porte.
- 2026-11-03 : les bancs existants sont **remplacés**, pas fusionnés : la ville doit rester attribuable à OpenStreetMap
  (`APP-003`). Un banc gardé après sa suppression d'OSM serait une donnée orpheline, impossible à attribuer. Le diff est
  relu avant d'être commité ; une perte importante et inattendue rouvrirait la question.

## Questions à trancher

- Le poids des extraits reste-t-il sous le plafond vérifié par les tests une fois le mobilier ajouté ?
- Les tracés `*-boucle.json` restent-ils valides : chaque point doit rester un sommet d'une voie de l'extrait (test de
  non-régression existant).

## À savoir avant de lancer

Les lampadaires ne viendront **pas** de cette réextraction : `highway=street_lamp` était déjà demandé le 2026-10-31 et les
quatre extraits en portent zéro — ils sont absents d'OpenStreetMap dans ces quartiers. C'est l'objet d'une intention à part,
`docs/intentions/lampadaires-generes.md`.
