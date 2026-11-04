# Intention : demander à Overpass les nœuds `highway=stop|give_way` que la lecture reconnaît déjà

**Statut** : proposée le 2026-11-04.

## Besoin

La lecture des balises range `highway=stop` et `highway=give_way` parmi les panneaux, mais la requête ne demande jamais ces
nœuds : un panneau « stop » ou « cédez le passage » porté par OpenStreetMap sans balise `traffic_sign` n'arrive ni dans un
extrait figé ni dans un trajet libre.

## Existant

Lu le 2026-11-04 : `app/scripts/osm-tags.ts` (`propKind`) reconnaît `traffic_sign` et `highway=stop|give_way` ;
`app/scripts/extract-souq.ts` (`PROP_NODES`) ne demande que `node["traffic_sign"]` pour les panneaux, et
`app/src/city/free-route.ts` reprend la même liste pour le trajet libre (requête réseau faite à l'accueil). Un comptage
Overpass du 2026-11-04 ne trouve aucun nœud `traffic_sign` ni `highway=stop|give_way` dans les quatre emprises figées :
l'écart ne change aucun extrait actuel, seulement les villes et trajets à venir.

## Questions à trancher

- Ajouter ces deux nœuds à `PROP_NODES`, sachant que le trajet libre en hérite (requête un peu plus longue à l'accueil) ?
- Ou retirer `highway=stop|give_way` de la lecture, pour que lecture et requête disent la même chose ?
