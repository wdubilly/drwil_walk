# Chantier : une ville plus lisible et moins austère dans le casque

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-ville.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/souq.test.ts
  - app/src/city/buildings.test.ts
  - app/src/xr/*
  - app/e2e/*
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
  - README.md
-->

## 1. Besoin

Sur un vrai Quest 3, la ville est d'une seule couleur orange en formes plates (retour du 2026-10-31). Le demandeur
veut un rendu plus lisible, sans perdre le passthrough ni la sécurité-visibilité.

## Critères d'acceptation

- Les voies de l'extrait OpenStreetMap sont dessinées sur le sol, d'une teinte distincte du sol, avec une largeur
  selon leur classe (hypothèse : principales plus larges) — `APP-003`
- Les bâtiments ne sont plus d'une seule teinte : la teinte varie d'un bâtiment à l'autre (hypothèse : trois ou
  quatre tons de la palette de l'itinéraire, choisis de façon déterministe) — `APP-003`
- Chaque itinéraire a sa palette (sol, voies, bâtiments) ; l'accueil et la mention restent lisibles — `APP-003`
- Le fondu de sécurité agit sur la ville entière, voies et bâtiments teintés compris : tête baissée, tout s'efface
  [humain] — `APP-001`
- Aucun ciel ni fond opaque : `scene.background` reste nul, le réel reste visible [humain] — `APP-001`
- Les chemins de marche existants restent verts dans le Quest 3 émulé — `QUA-020`

## 2. Hors périmètre

- Ciel ou fond virtuel (seulement s'il est tranché en intention, `docs/intentions/rendu-ville.md`).
- Types de bâtiments par balise OSM : exigerait de relancer les extractions Overpass (réseau).
- Textures de façade, ombres portées, Google Photorealistic 3D Tiles (`docs/intentions/google-3d-tiles.md`).
- Pause, recalibrage, panneau d'infos (`docs/intentions/commandes-panneau.md`).

## 3. Contraintes

- Aucun nouvel appel réseau : on n'utilise que les extraits déjà versionnés dans `app/data/`.
- Tenir 72 images par seconde : voies et bâtiments restent fusionnés en peu de maillages (couleurs par sommet, pas
  un maillage par bâtiment).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- `setCityOpacity` (`APP-001`) doit continuer à rendre toute la scène transparente.

## 4. Décisions

- 2026-10-31, retour du demandeur : rendu actuel jugé « moche », « mono couleur orange, formes plates ».
- 2026-10-31, hypothèses de cadrage de l'agent, à corriger au lancement si besoin : pas de ciel (passthrough
  conservé) ; variation de teinte déterministe sans nouvelle donnée ; palette par itinéraire.
- Contrats concernés : `APP-001`, `APP-003`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : ciel optionnel, palette fine et types de bâtiments restent des questions de `docs/intentions/rendu-ville.md`, hors de ce chantier)*

## 6. Lots

- **Lot 1 — voies et teintes** [AI] : dessiner les voies, varier la teinte des bâtiments, palettes par itinéraire,
  matériaux à couleurs par sommet. Sortie : tests verts, `run-checks` vert.
- **Lot 2 — e2e et doc** [AI] : e2e à jour, docs et contrats à jour. Sortie : CI verte.
- **Lot 3 — essai réel** [human] : marcher sur le Quest 3, juger le rendu et le fondu de sécurité.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : aucun.
- **Prochaine étape** : [AI] lot 1.
