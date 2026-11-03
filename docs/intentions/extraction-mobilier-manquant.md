# Intention : réextraire les quatre quartiers pour y amener lampadaires, poubelles et panneaux

**Statut** : proposée le 2026-11-03.

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

## Questions à trancher

- [decision] Réextraire les quatre quartiers (et accepter le diff des données) ou rester sur les extraits du 2026-10-31 ?
- Le poids des extraits reste-t-il sous le plafond vérifié par les tests une fois le mobilier ajouté ?
