# Chantier : le rendu photoréaliste Google 3D Tiles, en option

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/google-3d-tiles.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/google-tiles.ts
  - app/src/city/google-tiles.test.ts
  - app/src/xr/*
  - app/src/ui/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/e2e/*
  - app/package.json
  - app/package-lock.json
  - .env.example
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
  - README.md
  - INSTALL.md
  - docs/guide-utilisateur.md
-->

## 1. Besoin

Le rendu OpenStreetMap est jugé « moche », mono-couleur et plat, sur un vrai Quest 3. Le demandeur veut un rendu
**photoréaliste** : les Google Photorealistic 3D Tiles, déjà prévues par `MISSION.md`, sur les quatre itinéraires.

## Critères d'acceptation

- L'accueil propose le rendu « Google 3D » ou « OpenStreetMap » ; sans clé, ou si les tuiles ne se chargent pas, le
  rendu OpenStreetMap s'affiche et la raison est dite à l'écran (jamais d'échec silencieux) — `QUA-002`
- Avec une clé valide, les tuiles Google s'affichent autour du parcours, alignées sur la boucle de l'itinéraire — `APP-002`
- Le fondu de sécurité efface les tuiles Google comme la ville OSM : tête baissée, tout s'efface, et la scène n'a
  toujours ni ciel ni fond opaque [humain] — `APP-001`
- L'attribution exigée par Google s'affiche à l'accueil et dans le casque, en plus de celle d'OpenStreetMap — `APP-003`
- La clé n'est jamais dans le dépôt : lue depuis `.env.local` (`VITE_GOOGLE_MAPS_API_KEY`), `.env.example` ne porte qu'une
  valeur fictive — `SEC-007`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec un jeu de tuiles factice local, sans appel à Google — `QUA-020`

## 2. Hors périmètre

- Choisir son propre itinéraire : `docs/intentions/itineraire-libre.md`, chantier suivant.
- Unity + Cesium for Unity : non retenu, la pile reste TypeScript, Vite, three.js.
- Héberger un relais pour cacher la clé : aucun serveur en v0.1.

## 3. Contraintes

- Le rendu OSM reste le plan B obligatoire de `MISSION.md` et le rendu par défaut tant qu'aucune clé n'est fournie.
- Tenir 72 images par seconde sur Quest 3 : budget d'erreur et de mémoire des tuiles à régler (à mesurer au lot 4).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun test n'appelle Google : l'e2e sert un jeu de tuiles factice local.
- Dépendance ajoutée (hypothèse : `3d-tiles-renderer`) : licence compatible et sans vulnérabilité connue (`SEC-012`, `SEC-006`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur (« oui pour tout ») : accès réseau pendant la marche accepté ; clé Google
  acceptée, payante au-delà d'un quota ; l'OSM reste en option ; pas d'Unity.
- 2026-10-31, hypothèses de cadrage de l'agent, à corriger au lancement si besoin : bibliothèque `3d-tiles-renderer` ;
  clé restreinte par référent et par API dans la console Google [human], donc visible dans le client ; alignement des
  tuiles sur le repère local par l'origine de la boucle ; la couverture de Pune et de Doha est à vérifier (lot 1).
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-002`, `QUA-004`, `QUA-020`, `SEC-007`.

## Contrats modifiés

- `APP-003` — la mention « aucun appel réseau dans le casque » tombe pour le rendu Google (décision du demandeur du
  2026-10-31) : le rendu OpenStreetMap reste sans réseau ; l'attribution Google s'ajoute à celle d'OpenStreetMap.
- `QUA-020` — chemin e2e ajouté pour le rendu Google avec tuiles factices.

## 5. Points à trancher

*(aucun : la couverture de Pune et de Doha se juge au lot 1)*

## 6. Lots

- **Lot 1 — clé et couverture** [human] : créer la clé « Map Tiles API », la restreindre (référent, API), la mettre dans
  `.env.local`, vérifier la couverture de Pune et de Doha. Sortie : clé utilisable, couverture constatée.
- **Lot 2 — rendu Google en option** [AI] : bibliothèque, alignement sur la boucle, choix à l'accueil, repli OSM avec
  message. Sortie : tests verts, `run-checks` vert.
- **Lot 3 — fondu, attribution, e2e** [AI] : fondu de sécurité sur les tuiles, attributions, e2e avec tuiles factices,
  docs. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : marcher sur le Quest 3 avec la clé ; juger la netteté à hauteur d'yeux, le fondu de
  sécurité et les 72 images par seconde.

## 7. Reprise

- **Dernier état** (2026-10-31) : lots 2 et 3 faits côté agent (rendu Google en option, repli OpenStreetMap avec message, fondu, mentions, e2e sur tuiles factices, docs) ; lots 1 et 4 restent humains (intentions créées).
- **Travail non commité** : aucun une fois la clôture poussée.
- **Prochaine étape** : [human] `docs/intentions/cle-google-couverture.md`, puis `docs/intentions/essai-casque-google.md`.
