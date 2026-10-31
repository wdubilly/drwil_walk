# Chantier : marcher dans le souk de Doha (Souq Waqif) en bâtiments OpenStreetMap

**Statut** : cadré le 2026-10-30.
**Risque** : HIGH
**Maturité** : prêt

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
  - app/package.json
  - app/package-lock.json
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - README.md
-->

## 1. Besoin

Le demandeur veut voir et parcourir **le souk de Doha (Souq Waqif)** dans le casque, à la place de la rue de test
(sol et blocs) de la première tranche. La ville est faite de **bâtiments OpenStreetMap extrudés**, sans Google, et la
marche suit un **vrai parcours** dans le souk, à la vitesse réglée.

## Critères d'acceptation

- La position de marche suit le parcours GPS de la boucle du souk : la distance parcourue est égale à la vitesse
  réglée multipliée par le temps, et la boucle reprend au départ à la fin — `APP-002`
- Les bâtiments affichés sont ceux de l'extrait OpenStreetMap versionné, et la mention « © contributeurs
  OpenStreetMap » est visible dans l'accueil et dans le casque — `APP-003`
- Le fondu de sécurité reste actif dans le souk : tête baissée au-delà de 25°, la ville devient transparente — `APP-001` [humain]
- Le parcours du souk est rejoué de bout en bout dans le Quest 3 émulé — `QUA-020`

## 2. Hors périmètre

- Les trois autres itinéraires (Pune Vieille ville, Pune FC Road, Doha Corniche) : `docs/intentions/autres-itineraires.md`.
- Le choix d'itinéraire et le style de l'accueil :. Ici, le souk remplace
  la rue de test comme seul parcours.
- Google Photorealistic 3D Tiles : `docs/intentions/google-3d-tiles.md`.
- Zone tapis, vignette, pause, boutons A/B, panneau dans le casque : `docs/intentions/zone-tapis-vignette.md`,
  `docs/intentions/commandes-panneau.md`.

## 3. Contraintes

- Aucun appel réseau dans le casque : l'extrait est un fichier GeoJSON dans le dossier data de `app/`, produit par un script
  d'extraction (Overpass) relançable, lui aussi testé et couvert.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Tenir 72 images par seconde sur le Quest 3 : bâtiments fusionnés en peu de maillages, extrait limité au quartier.
- Données sous licence ODbL : attribution obligatoire (`APP-003`).

## 4. Décisions

- 2026-10-30, décisions humaines du demandeur :
  - pas de Google Photorealistic 3D Tiles en v0.1 : la ville est uniquement en bâtiments OpenStreetMap extrudés ;
  - les bâtiments viennent d'un **extrait figé versionné dans le dépôt**, pas d'un chargement en direct ;
  - parcours : **boucle du souk**, entrée côté Corniche / place Al Koot, ruelle principale jusqu'aux écuries et
    retour, environ 1,5 km, points GPS tracés depuis les voies OpenStreetMap ;
  - le repli « sans Google » de `MISSION.md` devient la seule source de la ville.
- Contrats concernés : `APP-001` (repris tel quel), `QUA-020` (repris), `APP-002` et `APP-003` (créés ici).

## Contrats modifiés

- `QUA-020` — étendu d'un chemin : le parcours du souk rejoué dans le Quest 3 émulé (décidé au cadrage du 2026-10-30 : « Le parcours du souk est rejoué de bout en bout dans le Quest 3 émulé »)
- `APP-001` — fichiers de référence et tests mis à jour (la rue de test devient la scène du souk, `app/src/city/souq.ts`), règle inchangée (décidé au cadrage du 2026-10-30 : « repris tel quel »)

## 5. Points à trancher

*(aucun : décisions prises le 2026-10-30)*

## 6. Lots

- **Lot 1 — extrait et parcours** [AI] : script d'extraction Overpass (bâtiments et voies autour de Souq Waqif),
  GeoJSON versionné, tracé de la boucle en points GPS, conversion GPS → mètres locaux. Sortie : tests verts, extrait
  et tracé relus par le demandeur [human].
- **Lot 2 — ville et marche** [AI] : bâtiments extrudés (hauteur OSM ou par défaut), marche le long de la boucle à la
  vitesse réglée, attribution OSM, contrats `APP-002` et `APP-003` câblés. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : chemin e2e du souk, docs à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : marcher dans le souk sur le Quest 3, tapis à vitesse lente.

## 7. Reprise

- **Dernier état** (2026-10-31) : lots 1 à 3 codés sur la branche `workstream/doha-souq-waqif` (extrait OSM de 253 bâtiments et tracé de 1,45 km versionnés, scène du souk, marche en boucle, mention d'attribution, contrats `APP-002` et `APP-003`, e2e du souk) ; contrôles locaux verts ; clôture en cours.
- **Travail non commité** : voir `git status` ; rien d'important hors de la branche.
- **Prochaine étape** : [human] relire l'extrait et le tracé (lot 1), puis l'essai réel sur le Quest 3, tapis à vitesse lente (lot 4).
