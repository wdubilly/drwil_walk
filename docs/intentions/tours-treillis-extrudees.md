# Intention : les tours en treillis extrudées en blocs pleins

**Statut** : proposée le 2026-11-03.

## Besoin

Un bâtiment balisé `building=tower` est extrait comme n'importe quel autre et extrudé en prisme plein depuis son emprise
au sol. Pour une tour en treillis, le résultat est faux : une masse pleine là où il n'y a que de la structure ajourée.

Relevé le 2026-11-03 sur la tour Eiffel (OpenStreetMap, voie 5013364) : `building=tower`, `height=330`, `man_made=tower`.
Extraite telle quelle, elle donnerait **un bloc plein d'environ 125 m de côté et 330 m de haut**. Et comme `tower` n'est
reconnu par aucune des familles de `app/src/city/facade-family.ts`, et que 330 m dépassent de loin le seuil des six
étages, elle recevrait la famille `recent` : un gratte-ciel de verre de 330 mètres, fenêtres dessinées comprises.

Le cas n'est pas propre à Paris : pylônes, châteaux d'eau, tours de télécommunication et minarets élancés relèvent du même
défaut partout.

## Existant

Lu le 2026-11-03.

- `app/scripts/extract-souq.ts` (`buildQuery`) demande `way["building"]` sans distinction : toute tour balisée `building`
  entre dans l'extrait.
- `buildingHeightM` lit la balise `height` : 330 m seraient repris tels quels.
- `app/src/city/buildings.ts` extrude l'emprise en prisme plein (`ExtrudeGeometry`), sans cas particulier.
- `app/src/city/facade-family.ts` : `tower` n'est ni dans `OLD_KINDS`, ni dans `HOUSE_KINDS`, ni dans `MODERN_KINDS` ; au
  delà de `TALL_FLOORS` (6), la famille est `recent`.
- Aucun des quatre itinéraires livrés ne contient de tour en treillis : le défaut est latent, jamais vu.

## Pistes

- Une **géométrie produite par règle** pour les tours en treillis (piliers, étages, flèche) : léger, cohérent avec le reste
  de la ville produite par code, mais approximatif sur une silhouette connue.
- Un **modèle 3D** chargé comme monument : fidèle, mais demande un fichier extérieur et sa licence
  (`docs/intentions/facades-textures-monuments.md`).
- **Écarter** les `man_made=tower` de l'extraction : le plus simple, mais laisse un vide là où quelque chose existe.

## Questions à trancher

- [decision] Laquelle des trois pistes, et vaut-elle d'être traitée avant qu'un itinéraire contienne une tour ?
- Faut-il un plafond de hauteur sur les bâtiments extrudés, pour qu'aucune erreur de balise ne produise un bloc démesuré ?
- `building=tower` mérite-t-il sa propre famille de façades, ou une absence de façade ?
