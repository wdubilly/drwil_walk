# Intention : demander à Overpass les nœuds `highway=stop|give_way` que la lecture reconnaît déjà

**Statut** : proposée le 2026-11-04.

## Besoin

La lecture des balises range `highway=stop` et `highway=give_way` parmi les panneaux, mais la requête ne demande jamais ces
nœuds : un panneau « stop » ou « cédez le passage » porté par OpenStreetMap sans balise `traffic_sign` n'arrive pas dans un
extrait embarqué.

## Existant

Lu le 2026-11-04 : `app/scripts/osm-tags.ts` (`propKind`) reconnaît `traffic_sign` et `highway=stop|give_way` ;
`app/scripts/extract-souq.ts` (`PROP_NODES`) ne demande que `node["traffic_sign"]` pour les panneaux.
Le parcours libre a été retiré le 2026-11-05. Un comptage
Overpass du 2026-11-04 ne trouve aucun nœud `traffic_sign` ni `highway=stop|give_way` dans les quatre emprises figées :
l'écart ne change aucun extrait actuel, seulement les villes à venir.

## Questions à trancher

- Ajouter ces deux nœuds à `PROP_NODES` pour les prochaines villes générées hors casque ?
- Ou retirer `highway=stop|give_way` de la lecture, pour que lecture et requête disent la même chose ?
