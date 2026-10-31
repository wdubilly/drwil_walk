# Chantier : marcher dans la Vieille ville de Pune (Shaniwar Wada → Dagdusheth)

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

Le demandeur veut parcourir la **Vieille ville de Pune** dans le casque, de Shaniwar Wada au temple Dagdusheth Halwai Ganpati : c'est l'itinéraire **par défaut** de `MISSION.md`. Même méthode que le souk : bâtiments OpenStreetMap extrudés, extrait figé.

## Critères d'acceptation

- La carte de l'itinéraire passe à `available: true` (`app/src/route/itineraries.ts`) ; elle se choisit et démarre
  la marche sur son propre tracé.
- La marche suit le parcours GPS de la boucle : distance parcourue = vitesse réglée × temps, reprise au départ à la
  fin — `APP-002`
- Les bâtiments affichés sont ceux de l'extrait OpenStreetMap versionné de cet itinéraire, avec la mention
  « © contributeurs OpenStreetMap » à l'accueil et dans le casque — `APP-003`
- Le fondu de sécurité reste actif sur cet itinéraire — `APP-001`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé, avec captures d'écran — `QUA-020`
- L'itinéraire choisi à l'accueil (`data-route`) détermine la ville et le tracé : `app/src/xr/experience.ts` le lit enfin, et le souk reste sélectionnable sans régression sur `APP-002` et `APP-003`.

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
- 2026-10-31, hypothèses de cadrage de l'agent, à corriger au lancement si besoin : départ à Shaniwar Wada, passage par Budhwar Peth jusqu'au temple Dagdusheth Ganpati, retour par une rue voisine (environ 1,5 km) ; les points sont des sommets de voies OSM.
- Cette fiche est la **première** : elle câble le choix d'itinéraire dans `app/src/xr/experience.ts` (jusqu'ici ignoré, voir `docs/intentions/autres-itineraires.md`), que les deux suivantes réutilisent.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-020` (repris).

## 5. Points à trancher

*(aucun : la couverture OSM des bâtiments se juge à la relecture humaine du lot 1)*

## 6. Lots

- **Lot 0 — câblage du choix** [AI] : `app/src/xr/experience.ts` charge la ville et le tracé de l'itinéraire choisi (le souk est le premier cas). Sortie : tests verts, souk inchangé.
- **Lot 1 — extrait et tracé** [AI] : script d'extraction Overpass, GeoJSON versionné, boucle en points GPS
  tirés des voies OSM. Sortie : tests verts, extrait et tracé relus par le demandeur [human].
- **Lot 2 — ville et marche** [AI] : bâtiments extrudés, marche sur la boucle, attribution, carte disponible.
  Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : chemin e2e, captures, docs à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : marcher sur le Quest 3, tapis à vitesse lente.

## 7. Reprise

- **Dernier état** (2026-10-31) : fiche cadrée, rien de codé.
- **Travail non commité** : aucun.
- **Prochaine étape** : [AI] lancer le chantier (`/drwil-start`).
