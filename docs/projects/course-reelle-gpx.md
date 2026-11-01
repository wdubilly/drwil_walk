# Chantier : rejouer une vraie course (fichier GPX ou points intermédiaires, longue distance)

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/course-reelle-entrainement.md`

<!-- scope
files:
  - app/src/route/gpx.ts
  - app/src/route/gpx.test.ts
  - app/src/route/providers.ts
  - app/src/route/valhalla.ts
  - app/src/route/valhalla.test.ts
  - app/src/route/routes-api.ts
  - app/src/route/routes-api.test.ts
  - app/src/city/free-route.ts
  - app/src/city/free-route.test.ts
  - app/src/ui/free-trip.ts
  - app/src/ui/free-trip.test.ts
  - app/src/ui/map-picker.ts
  - app/src/ui/map-picker.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/home.css
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

Le demandeur veut **rejouer chez lui le parcours d'une vraie course** : courir ou marcher à l'abri quand il pleut, ou
s'entraîner sur le même parcours virtuel pour savoir s'il peut tenir la distance (exemple : Vidauban → Sainte-Maxime). Le
trajet libre actuel ne le permet pas : il refuse tout chemin de plus de 5 km, ne lit aucun fichier de tracé, et charge
toute la ville d'un coup à l'accueil.

## Critères d'acceptation

- Un fichier GPX donné à l'accueil devient le parcours de la marche : il est lu en entier, validé, et un fichier illisible ou
  vide est refusé en disant pourquoi — `APP-002`
- On peut aussi poser des points intermédiaires sur la carte de l'accueil, entre le départ et l'arrivée, que le routage à pied
  relie ; GPX et points intermédiaires se choisissent l'un ou l'autre — `APP-002`
- La limite de 5 km est levée : un parcours de plusieurs dizaines de kilomètres est accepté, et seul un plafond technique de
  requête, dit à l'écran quand il est atteint, reste — `APP-002`
- La ville d'un trajet libre se charge par bandes le long du tracé, devant la position, les bandes passées sont libérées, et le
  nombre de bâtiments gardés en mémoire est plafonné (testé) — `APP-003`
- Une bande qui ne se charge pas est dite à l'écran et la marche continue sur le sol seul — `QUA-002`
- Aucun fichier ni point n'est envoyé à un service ni conservé : le GPX est lu dans le navigateur — `APP-002`
- Un GPX long est rejoué de bout en bout dans le Quest 3 émulé : les bandes se chargent au fil de la marche, la marche s'arrête
  à l'arrivée en le disant — `QUA-020`
- La fluidité à 72 images par seconde sur une longue distance, avec le chargement des bandes, est jugée sur un vrai Quest 3
  [human] — `APP-001`

## Contrats modifiés

- `APP-003` — pour un trajet libre, les bâtiments d'OpenStreetMap sont chargés « à l'accueil quand le trajet se prépare (jamais
  pendant la marche) » : ils seront chargés par bandes le long du tracé, pendant la marche, devant la position. Les quatre
  itinéraires figés n'appellent toujours pas le réseau dans le casque (à approuver à la validation de cette fiche).
- `APP-002` — le trajet libre accepte un GPX et des points intermédiaires, sans limite de 5 km (à approuver à la validation de
  cette fiche).
- `QUA-020` — chemin e2e du GPX long et des bandes.

## 2. Hors périmètre

- La reprise d'une séance là où elle s'est arrêtée, l'allure ou le temps cible, le partage ou l'export d'un parcours : ils
  restent dans `docs/intentions/course-reelle-entrainement.md`, à trancher.
- Le dénivelé : aucune source d'élévation, le parcours se rejoue à plat.
- La minicarte pendant la marche (`docs/projects/carte-position-casque.md`) et la version PC (`docs/projects/version-pc.md`).
- Le rendu Google 3D pour un long parcours.

## 3. Contraintes

- Les instances publiques d'OpenStreetMap (routage, adresses, Overpass) limitent les demandes : une bande par demande, au
  plus quelques demandes à la fois, un retard dit à l'écran, jamais d'insistance ; l'usage reste modéré.
- Le chargement des bandes ne doit jamais bloquer une image ni masquer le tapis : il se fait en avance sur la position, hors de
  l'image courante, et `APP-001` ne régresse pas.
- Aucune donnée personnelle conservée ni envoyée : le tracé d'une course peut en être une, il reste dans la page.
- Les quatre itinéraires figés restent sans appel réseau dans le casque (`APP-003`).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-11-01, décisions humaines du demandeur : le parcours se fournit par un fichier GPX ou par des points intermédiaires
  (les deux) ; pas de limite fixe de distance ; la ville se charge par bandes.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : largeur et longueur d'une bande,
  avance de chargement, plafond de bâtiments, plafond technique de requête, format du GPX accepté (pistes et itinéraires).
- À lancer après `ambiance-cartoon`, `rendu-ville-riche` et `corniche-west-bay` : tous touchent la ville, jamais en même temps.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : la reprise de séance et l'allure cible sont reportées à l'intention)*

## 6. Lots

- **Lot 1 — lecture du GPX** [AI] : lecture dans le navigateur, validation, refus dit. Sortie : tests verts.
- **Lot 2 — points intermédiaires et longue distance** [AI] : routage à pied entre points, plafond de 5 km levé, plafond
  technique dit. Sortie : `run-checks` vert.
- **Lot 3 — ville par bandes** [AI] : chargement devant la position, libération, repli sur le sol. Sortie : `run-checks` vert.
- **Lot 4 — e2e et doc** [AI] : e2e GPX long, docs, contrats à jour. Sortie : CI verte.
- **Lot 5 — essai réel** [human] : un vrai parcours long au casque, fluidité et chargement des bandes avec les instances
  publiques.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/retours-carte-poste`.
- **Prochaine étape** : [AI] lot 1.
