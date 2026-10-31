# Chantier : choisir son propre itinéraire

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : à affiner
**Intention** : `docs/intentions/itineraire-libre.md`

<!-- scope
files:
  - app/src/route/*
  - app/src/city/*
  - app/src/city/free-route.ts
  - app/src/city/free-route.test.ts
  - app/src/xr/*
  - app/src/ui/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/e2e/*
  - app/package.json
  - app/package-lock.json
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
  - README.md
  - docs/guide-utilisateur.md
-->

## 1. Besoin

Le demandeur veut marcher sur **n'importe quel trajet** : il choisit un départ et une arrivée, l'application calcule le
chemin à pied et charge la ville autour.

## Critères d'acceptation

- L'accueil propose « Itinéraire libre » en plus des quatre cartes ; le demandeur y choisit un départ et une arrivée — `QUA-020`
- Le chemin à pied entre les deux points est calculé par un service de routage, puis la marche le suit à la vitesse
  réglée ; en cas d'échec du calcul, une raison est dite à l'écran (jamais silencieux) — `QUA-002`
- Un trajet libre ne boucle pas : à l'arrivée la marche s'arrête et le dit — `APP-002`
- La ville autour du trajet vient du rendu Google 3D (chantier google-3d-tiles) ou, à défaut, de bâtiments
  OpenStreetMap chargés pour le trajet, avec l'attribution de la source — `APP-003`
- Le fondu de sécurité reste actif sur un trajet libre [humain] — `APP-001`
- Le parcours libre est rejoué de bout en bout dans le Quest 3 émulé, service de routage factice — `QUA-020`

## 2. Hors périmètre

- Le rendu photoréaliste lui-même : `docs/projects/google-3d-tiles.md`, à livrer avant ce chantier.
- Enregistrer ou partager des trajets, comptes, historique : aucune donnée personnelle conservée.
- Navigation guidée, virages annoncés, pause et recalibrage (`docs/intentions/commandes-panneau.md`).

## 3. Contraintes

- Dépend de `google-3d-tiles` (accès réseau, clé et chargement de la ville hors extrait) : à lancer après lui.
- Aucune donnée personnelle conservée : les points choisis ne sont ni enregistrés ni envoyés ailleurs qu'au service de routage.
- Trajet borné en longueur (hypothèse : 5 km au plus) pour limiter les chargements.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun test n'appelle un service externe : routage et tuiles factices en e2e.

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur (« oui pour tout ») : accès réseau pendant la marche accepté, clé
  Google acceptée.
- 2026-10-31, hypothèses de cadrage de l'agent, à corriger au lancement : routage par l'API Google Routes (mode piéton,
  même clé) ; départ et arrivée choisis en touchant une carte à l'accueil ; aller simple, arrêt à l'arrivée ; 5 km au plus.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-002`, `QUA-004`, `QUA-020`.

## Contrats modifiés

- `APP-002` — un itinéraire libre ne boucle pas : la marche s'arrête à l'arrivée ; les quatre itinéraires figés gardent leur boucle.
- `APP-003` — la ville d'un trajet libre ne vient pas d'un extrait versionné, mais du rendu Google ou d'un chargement OpenStreetMap.

## 5. Points à trancher

- [decision] Service de routage, aller simple ou retour, mode de choix des points, longueur maximale : voir
  `docs/intentions/itineraire-libre.md`. À trancher avant de passer la fiche à « prêt ».

## 6. Lots

- **Lot 1 — choix des points et routage** [AI] : carte à l'accueil, appel du service, tracé en points GPS dans le
  repère local. Sortie : tests verts, routage factice.
- **Lot 2 — marche libre** [AI] : marche sur un tracé calculé, arrêt à l'arrivée, ville autour du trajet. Sortie :
  `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : chemin e2e, docs à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : marcher un trajet libre sur le Quest 3, tapis à vitesse lente.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : aucun.
- **Prochaine étape** : [decision] trancher les points du § 5, puis lancer après `google-3d-tiles`.
