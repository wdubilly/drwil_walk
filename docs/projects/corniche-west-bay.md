# Chantier : la Corniche de Doha jusqu'à West Bay, départ au musée

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/corniche-west-bay.md`

<!-- scope
files:
  - app/scripts/extract-corniche.ts
  - app/scripts/extract-souq.ts
  - app/data/doha-corniche.json
  - app/data/doha-corniche-boucle.json
  - app/src/route/*
  - app/src/route/path.test.ts
  - app/src/route/itineraries.test.ts
  - app/src/city/*
  - app/src/city/cities.test.ts
  - app/src/xr/*
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Le parcours « Doha Corniche » marche aujourd'hui sur un aller-retour d'environ 4 km (2 km à l'aller). Il part du point relié
le plus proche du Musée d'art islamique, faute de voie reliant le musée à la Corniche dans l'extrait OpenStreetMap
(174 m d'écart), et n'atteint pas West Bay, à environ 3,5 km du départ. Le demandeur veut un parcours qui part du musée et
va jusqu'aux tours de West Bay.

## Critères d'acceptation

- Le parcours part du Musée d'art islamique : un court raccord relie le musée au réseau de voies de la Corniche — `APP-002`
- Le parcours atteint les tours de West Bay : l'aller fait environ 5 à 6 km, l'aller-retour environ 10 à 12 km — `APP-002`
- Le raccord ajouté à la main est le seul segment du tracé qui ne suit pas une voie OpenStreetMap ; il est nommé, borné en
  longueur et testé comme tel — `APP-002`
- Les bâtiments du parcours allongé viennent de l'extrait OpenStreetMap figé, avec l'attribution — `APP-003`
- Le parcours allongé tient 72 images par seconde : le nombre de bâtiments affichés reste borné — `QUA-020`
- La Corniche est rejouée de bout en bout dans le Quest 3 émulé, avec son nouveau tracé — `QUA-020`
- Le parcours est relu par le demandeur et essayé au casque [humain] — `APP-002`

## Contrats modifiés

- `APP-002` — former criterion : « le tracé de la Corniche fait entre 3,5 et 4,5 km en aller-retour et chacun de ses points
  est un sommet d'une voie de l'extrait OpenStreetMap ». Raison : la Corniche fait environ 10 à 12 km en aller-retour, et un
  raccord de quelques centaines de mètres entre le musée et la Corniche n'est pas une voie OSM ; les autres itinéraires ne
  changent pas (approuvé le 2026-10-31).
- `QUA-020` — le parcours (7), la Corniche, est rejoué avec le tracé allongé.

## 2. Hors périmètre

- Les trois autres itinéraires figés et le trajet libre.
- Corriger la carte OpenStreetMap elle-même (ajouter la voie manquante à OSM).
- Un second parcours plus court de la Corniche : le tronçon de 2 km est remplacé, pas conservé.
- Le rendu (teintes, arbres) : déjà livré par le chantier osm-enrichi (`docs/projects/journal.md`).

## 3. Contraintes

- 72 images par seconde sur Quest 3 : l'extrait grossit d'environ trois à quatre fois (756 bâtiments pour 2 km aujourd'hui) ;
  il faut borner ce qui est affiché autour de la position. La méthode est un choix de l'agent, à mesurer.
- Un extrait Overpass volumineux : le réseau est intermittent, plusieurs essais possibles ; l'extrait versionné est relu.
  Limite de taille du dépôt à surveiller.
- Aucun appel réseau dans le casque pour les quatre itinéraires figés (`APP-003`).
- `APP-001` ne doit pas régresser : rien de ce chantier ne touche le fondu de sécurité.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : allonger l'aller jusqu'aux tours de West Bay ; relier à la main le réseau du
  musée à celui de la Corniche.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : emprise de l'extraction, point de
  raccord et sa longueur exacte, méthode pour borner les bâtiments affichés, ce qui est conservé du tronçon actuel.
- Dépend du chantier osm-enrichi, livré le 2026-10-31 (`docs/projects/journal.md`) : l'extrait porte désormais les arbres et le mobilier.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : l'emprise, le raccord et la méthode de bornage sont des choix techniques de l'agent)*

## 6. Lots

- **Lot 1 — extraction et tracé** [AI] : étendre l'emprise, relancer l'extraction, tracer le parcours du musée à West Bay avec
  son raccord. Sortie : extraits relus, tests verts.
- **Lot 2 — poids du rendu** [AI] : borner les bâtiments affichés autour de la position, mesurer. Sortie : `run-checks` vert.
- **Lot 3 — contrats, e2e et doc** [AI] : `APP-002` et `QUA-020` à jour, e2e de la Corniche, docs. Sortie : CI verte.
- **Lot 4 — relecture et essai réel** [human] : relire le tracé, l'essayer sur le Quest 3, juger la cadence.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1.
