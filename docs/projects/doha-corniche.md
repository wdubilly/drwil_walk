# Chantier : marcher sur la Corniche de Doha (Musée d'art islamique → West Bay)

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/autres-itineraires.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/route/*
  - app/src/ui/*
  - app/src/xr/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/data/*
  - app/scripts/*
  - app/e2e/*
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
  - README.md
-->

## 1. Besoin

Le demandeur veut longer la **Corniche de Doha**, du Musée d'art islamique vers West Bay, en bâtiments OpenStreetMap extrudés. Itinéraire de front de mer, plus ouvert que les deux villes denses.

## Critères d'acceptation

- La carte de l'itinéraire passe à `available: true` (`app/src/route/itineraries.ts`) ; elle se choisit et démarre
  la marche sur son propre tracé — `QUA-020`
- La marche suit le parcours GPS de la boucle : distance parcourue = vitesse réglée × temps, reprise au départ à la
  fin — `APP-002`
- Les bâtiments affichés sont ceux de l'extrait OpenStreetMap versionné de cet itinéraire, avec la mention
  « © contributeurs OpenStreetMap » à l'accueil et dans le casque — `APP-003`
- Le fondu de sécurité reste actif sur cet itinéraire [humain] — `APP-001`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé, avec captures d'écran — `QUA-020`

## 2. Hors périmètre

- Les autres itinéraires : un chantier chacun (`docs/intentions/autres-itineraires.md`).
- Google Photorealistic 3D Tiles : `docs/intentions/google-3d-tiles.md`.
- Pause, recalibrage, panneau d'infos : `docs/intentions/commandes-panneau.md`.

## 3. Contraintes

- Aucun appel réseau dans le casque : extrait GeoJSON versionné dans `app/data/`, produit par un script Overpass
  relançable (sur le modèle de `app/scripts/extract-souq.ts`), testé et couvert.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Tenir 72 images par seconde : bâtiments fusionnés en peu de maillages, extrait limité au quartier.
- Données ODbL : attribution obligatoire (`APP-003`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : un chantier par itinéraire ; **boucle pour tous** les itinéraires.
- 2026-10-31, hypothèses de cadrage de l'agent, à corriger au lancement si besoin : la Corniche fait plusieurs kilomètres : on prend un **tronçon d'environ 2 km** depuis le Musée d'art islamique, bouclé par un **aller-retour** sur le front de mer ; les tours de West Bay ne figurent que dans l'extrait.
- Dépend de `pune-vieille-ville` (choix d'itinéraire câblé dans `app/src/xr/experience.ts`) : à lancer après elle.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-020` (repris).

## Contrats modifiés

- `APP-002` — étendu à la boucle de la Corniche (aller-retour d'environ 4 km, longueur 3,5 à 4,5 km), sans rien retirer.
- `APP-003` — étendu à l'extrait de la Corniche, même mention d'attribution.
- `QUA-020` — chemin 7 ajouté (la Corniche de Doha) ; l'itinéraire « bientôt » de l'e2e reste Pune FC Road.

## 5. Points à trancher

*(aucun : la couverture OSM des bâtiments se juge à la relecture humaine du lot 1)*

## 6. Lots

- **Lot 1 — extrait et tracé** [AI] : script d'extraction Overpass, GeoJSON versionné, boucle en points GPS
  tirés des voies OSM. Sortie : tests verts, extrait et tracé relus par le demandeur [human].
- **Lot 2 — ville et marche** [AI] : bâtiments extrudés, marche sur la boucle, attribution, carte disponible.
  Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : chemin e2e, captures, docs à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : marcher sur le Quest 3, tapis à vitesse lente.

## 7. Reprise

- **Dernier état** (2026-10-31) : lots 0 à 3 codés sur la branche `workstream/doha-corniche` (extrait OSM de 756 bâtiments, aller-retour d'environ 4 km, e2e chemin 7) ; contrôles locaux verts ; clôture en cours. Limites : départ au point relié le plus proche du musée, West Bay non atteint (`docs/intentions/corniche-west-bay.md`).
- **Travail non commité** : aucun.
- **Prochaine étape** : [human] relire l'extrait et le tracé (lot 1), puis l'essai réel sur le Quest 3, tapis à vitesse lente (lot 4).
