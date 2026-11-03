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
  (`app/scripts/extract-souq.ts`, `app/scripts/extract-pune.ts`, `app/scripts/extract-corniche.ts`,
  `app/scripts/extract-fc-road.ts`), lancé par une commande
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

- [decision] Quelles villes exactement, et surtout **quel quartier et quelle rue de départ** dans chacune ? Un itinéraire se
  choisit au niveau du quartier, pas de la ville (le Trastevere n'est pas l'EUR).
- [decision] Combien d'itinéraires au total vise-t-on ? Le poids des extraits et le temps de chargement en dépendent.
- [decision] Ajoute-t-on une famille de façades par région avant ces villes, en même temps, ou accepte-t-on des quartiers
  génériques dans un premier temps ?
- [decision] Généralise-t-on l'extraction en un seul script paramétré avant d'ajouter des villes, ou recopie-t-on le modèle
  existant une fois de plus ?
- Le plafond de poids des extraits vérifié par les tests tient-il à sept itinéraires, ou faut-il charger les villes à la
  demande ?
- Faut-il un ordre : une ville d'abord, jugée au casque, avant d'engager les suivantes ?
