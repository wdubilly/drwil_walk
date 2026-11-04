# Intention : d'autres villes à parcourir (Rome, Erevan, Paris…)

**Statut** : proposée le 2026-11-03.

## Besoin

Marcher ailleurs que dans les quatre quartiers livrés : le demandeur cite Rome, Erevan et Paris, la liste restant ouverte.
Quatre itinéraires répartis sur deux villes (Pune et Doha) finissent par se connaître par cœur ; la variété des villes est
une part du plaisir de marcher.

## Existant

Lu le 2026-11-03.

- Quatre itinéraires livrés : Souq Waqif, Doha Corniche, Pune Vieille ville, Pune FC Road. Chacun tient en **deux fichiers**
  (`app/data/<ville>.json` et `app/data/<ville>-boucle.json`) et **un script d'extraction** dédié
  (`app/scripts/extract-souq.ts` et un script par ville, retirés depuis : voir plus bas), lancé par une commande
  `npm run extract:*`. Rien n'est partagé entre eux : chaque ville est recopiée à l'identique.
- Les quatre extraits pèsent **2,9 Mo** au total. Un plafond de poids est vérifié par les tests.
- Un test de non-régression exige que **chaque point du tracé de boucle soit un sommet d'une voie de l'extrait** : un
  parcours ne s'invente pas, il suit le graphe des rues.
- `app/src/city/facade-family.ts` ne connaît que **deux régions** : `provence` et `ailleurs`. Les familles de façades sont
  `provencale`, `village`, `ancien` et `recent`.
- Une intention voisine existe déjà : `docs/intentions/ville-provence.md` (une ville de Provence, pour que la famille
  provençale ait où s'exercer). Paris, à 48,8° de latitude, n'en relève pas : elle ne la couvre donc pas.
- Une autre intention couvre le trajet libre et les longues distances : `docs/intentions/course-reelle-entrainement.md`,
  `docs/projects/course-reelle-gpx.md`. Ce besoin-ci est différent : des quartiers **figés dans le dépôt**, choisis pour
  leur intérêt, sans réseau pendant la marche.

## Ce que ces villes coûteraient

- **Du poids** : à 700 Ko environ par quartier, trois villes de plus feraient passer `app/data/` de 2,9 à près de 5 Mo. Le
  plafond vérifié par les tests devra être relu — c'est la première chose à mesurer.
- **Un script de plus chacune**, sur le modèle des quatre existants. La répétition entre ces scripts devient alors difficile
  à défendre : une seule extraction paramétrée par ville serait plus saine, et c'est un préalable à discuter avant d'en
  ajouter trois.

## Ces trois villes n'auraient aucun style propre

C'est le point le plus important, et il ne saute pas aux yeux.

Rome, Erevan et Paris tomberaient toutes les trois dans la région `ailleurs`, donc dans les familles génériques `ancien` et
`recent`. Trois villes très typées — le travertin et les ocres romains, le tuf rose d'Erevan, la pierre de taille et le zinc
parisiens — s'afficheraient avec **exactement les mêmes façades que Pune et Doha**. Le dépaysement attendu n'y serait pas.

Ajouter ces villes sans toucher aux familles de façades (`APP-008`) livrerait donc des quartiers géographiquement justes et
visuellement interchangeables. Les deux sujets sont liés : c'est une décision à prendre ensemble, pas l'une après l'autre.

## Questions à trancher

- Le plafond de poids des extraits vérifié par les tests tient-il à sept itinéraires, ou faut-il charger les villes à la
  demande ? À mesurer au premier lot.
- Faut-il un ordre entre les trois villes, une jugée au casque avant d'engager les suivantes ?

## Quartiers retenus

Des centres touristiques, marchables en boucle, denses en bâtiments cartographiés :

- **Rome** — le centro storico : Piazza Navona, le Panthéon, les ruelles entre les deux. Ocres et travertin.
- **Erevan** — le centre : place de la République, rue Abovian, la Cascade. Tuf rose.
- **Paris** — le Marais : place des Vosges et les rues alentour. Pierre de taille et toits de zinc.

Paris a d'abord été envisagée au Champ de Mars, pour la tour Eiffel. Écarté le 2026-11-03 : balisée `building=tower` et
`height=330`, elle serait extrudée en bloc plein de 330 m (`docs/intentions/tours-treillis-extrudees.md`). Le Marais en est
libre.

## Décisions

- 2026-11-03 : **une famille de façades par région** avant les villes, pour qu'aucune ville n'arrive avec les façades
  génériques de Pune et Doha. Chantier : `docs/projects/facades-regions.md`. Fait le 2026-11-04 : la région se déduit de
  l'origine (Italie, Caucase, France du Nord, Inde, Golfe, Provence) et porte ses palettes (`app/src/city/facade-palettes.ts`,
  `APP-008`) ; Rome, Erevan et Paris recevront leurs teintes dès leur ajout (voir le journal, chantier `facades-regions`).
- 2026-11-03 : **généraliser l'extraction en un seul script paramétré** avant d'ajouter des villes, plutôt que de recopier
  le modèle une quatrième fois. Fait le 2026-11-03 : `app/scripts/cities.ts` décrit les villes par des données, ajouter une ville
  n'y demande plus que ses paramètres (voir le journal, chantier `extraction-generique`) ; les alias par ville sont retirés
  le 2026-11-03, un seul test paramétré sur `CITIES` vérifie chaque ville (chantier `retirer-alias-extraction`).
- 2026-11-03 : les itinéraires visés sont des **centres touristiques**.
- 2026-11-03 : **Paris reste un itinéraire comme les autres**, dans le Marais ; aucune tour à traiter.

## Ordre

`extraction-generique` → `facades-regions` → `villes-itineraires`.

## Cadrée

Cette intention est cadrée en fiche : `docs/projects/villes-itineraires.md` (2026-11-03).
