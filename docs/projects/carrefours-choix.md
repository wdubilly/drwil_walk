# Chantier : choisir sa direction à chaque carrefour

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt

<!-- scope
files:
  - app/src/route/path.ts
  - app/src/route/path.test.ts
  - app/src/route/walk.ts
  - app/src/route/walk.test.ts
  - app/src/route/network.ts
  - app/src/route/network.test.ts
  - app/src/route/itineraries.ts
  - app/src/route/itineraries.test.ts
  - app/src/city/cities.ts
  - app/src/city/cities.test.ts
  - app/src/xr/*
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/main.ts
  - app/src/main.test.ts
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

Un testeur voudrait choisir à chaque carrefour entre gauche, droite et tout droit. Aujourd'hui chaque itinéraire figé suit
un tracé unique, une boucle ou un aller-retour, lu dans `app/data/*-boucle.json` (`app/src/route/path.ts`). Le demandeur
veut que le choix se fasse **dans les quatre itinéraires figés**, en pointant la rue à prendre avec la manette.

## Critères d'acceptation

- À l'approche d'un carrefour du réseau de voies de l'extrait, les rues possibles sont signalées dans la scène, et
  l'utilisateur en choisit une en la pointant avec la manette — `APP-002`
- Sans choix avant le carrefour, la marche continue tout droit (la rue la plus proche de la direction courante) : jamais
  d'arrêt ni de choix imposé — `APP-002`
- Un choix ne déclenche qu'une action et ne change ni la vitesse réglée ni la distance déjà parcourue — `APP-002`
- Au bout d'une voie sans issue ou en bordure de l'extrait, la marche fait demi-tour : on ne sort jamais de la ville
  chargée, et les rues qui en sortent ne sont pas proposées — `APP-002`
- Sans aucun choix, la marche suit le tracé d'origine de l'itinéraire : le comportement actuel reste le comportement par
  défaut — `APP-002`
- Pointer une rue ne masque jamais le tapis : les repères de choix suivent le fondu tête baissée [humain] — `APP-001`
- Le choix à un carrefour est rejoué de bout en bout dans le Quest 3 émulé, sur un itinéraire figé — `QUA-020`

## Contrats modifiés

- `APP-002` — former criterion : « la position de marche suit le parcours GPS de la boucle de l'itinéraire choisi, et la
  boucle reprend au départ à la fin de sa longueur ». Raison : l'utilisateur peut quitter le tracé d'origine à chaque
  carrefour ; la marche suit alors le réseau de voies, sans garantie de retour au départ ; le tracé d'origine reste le défaut
  (approuvé le 2026-10-31).
- `QUA-020` — un parcours e2e de choix à un carrefour s'ajoute.

## 2. Hors périmètre

- Le trajet libre (chemin calculé par Valhalla jusqu'à une arrivée) : il garde son chemin unique et son arrêt à l'arrivée.
- Une carte ou une boussole pour s'orienter : `docs/intentions/hud-casque.md`.
- Des rues hors de l'extrait figé (aucun chargement réseau dans le casque, `APP-003`).
- Enregistrer le trajet parcouru.

## 3. Contraintes

- `APP-001` : les repères de carrefour disparaissent tête baissée et ne recouvrent pas la zone tapis.
- Un mauvais pointage en marchant ne doit pas être dangereux : un choix ambigu ou absent donne tout droit, jamais un virage
  brusque ; le changement de direction est lissé (comme `HEADING_WINDOW_M`).
- Tenir 72 images par seconde : le réseau de voies de l'extrait est déjà chargé, les repères sont peu nombreux.
- Dépend de `commandes-panneau` (lecture des boutons et du rayon de la manette) et de `zone-tapis-vignette` pour la place
  des repères ; à lancer après eux, car les trois touchent `app/src/xr/*` et `app/src/main.ts`.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : le choix se fait en pointant la rue avec la manette ; il s'applique dans les
  quatre itinéraires figés.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : distance d'approche à laquelle
  les rues sont proposées, forme des repères (flèches), tolérance de pointage, graphe des voies tiré de l'extrait
  (un nouveau module de réseau dans `app/src/route/`), demi-tour, ce que devient l'arrivée d'un aller-retour quand on a quitté le tracé.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : les réglages d'approche et de pointage sont des choix techniques de l'agent)*

## 6. Lots

- **Lot 1 — le graphe des voies** [AI] : construire le réseau navigable depuis l'extrait, trouver les carrefours et les
  rues sortantes. Sortie : tests verts.
- **Lot 2 — la marche sur le réseau** [AI] : suivre le tracé d'origine par défaut, continuer tout droit, demi-tour en
  bout de voie. Sortie : `run-checks` vert.
- **Lot 3 — repères et pointage** [AI] : flèches à l'approche, choix au rayon de la manette, un appui = une action.
  Sortie : `run-checks` vert.
- **Lot 4 — e2e, contrats et doc** [AI] : e2e du choix, `APP-002` et `QUA-020` à jour, docs. Sortie : CI verte.
- **Lot 5 — essai réel** [human] : sur le Quest 3, juger la précision du pointage en marchant et la sécurité.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1, après `commandes-panneau` et `zone-tapis-vignette`.
