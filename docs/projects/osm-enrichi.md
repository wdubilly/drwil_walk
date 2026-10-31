# Chantier : un rendu OpenStreetMap plus riche

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/osm-enrichi.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/buildings.test.ts
  - app/src/city/souq.test.ts
  - app/scripts/*
  - app/data/*
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

Le rendu OSM est jugé « moche, mono-couleur, formes plates » sur un vrai Quest 3. Le demandeur veut le rendu stylisé le plus
riche possible, sans dépendance commerciale : couleurs et matériaux des toits, arbres et mobilier urbain, ombrage.

## Critères d'acceptation

- Les couleurs et matériaux OSM des bâtiments (`building:colour`, `roof:colour`, `building:material`) teintent le bâtiment ;
  sans balise, il garde un ton de la palette de l'itinéraire — `APP-003`
- Les arbres (`natural=tree`) et du mobilier urbain simple de l'extrait s'affichent, en peu de maillages — `APP-003`
- Un ombrage par sommet (assombrissement vers le pied des bâtiments) donne du relief aux volumes — `APP-003`
- Le fondu de sécurité efface tout ce qui s'ajoute : arbres, mobilier, bâtiments teintés [humain] — `APP-001`
- Les quatre extraits versionnés portent les nouvelles balises, et l'extraction d'un trajet libre les lit aussi — `APP-003`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le rendu enrichi — `QUA-020`

## 2. Hors périmètre

- **Relief du sol** : question ouverte de `docs/intentions/osm-enrichi.md` (source d'élévation à trancher).
- Texture de façade et photogrammétrie : aucune source ouverte trouvée pour Pune et Doha.
- Les hauteurs par niveaux : déjà faites (`building:levels` sert à calculer la hauteur depuis le chantier souk).
- Les fournisseurs : `docs/projects/fournisseurs-ouverts.md`.

## 3. Contraintes

- Tenir 72 images par seconde : maillages fusionnés, arbres en instances plafonnées en nombre.
- Relancer les extractions Overpass pour conserver les balises : réseau intermittent, à retenter, extraits versionnés relus.
- Aucun appel réseau dans le casque pour les quatre itinéraires figés (`APP-003`).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : matériaux et couleurs de toit, arbres et mobilier urbain, relief, ombrage
  par sommet ; le relief est reporté dans une intention faute de source tranchée.
- 2026-10-31, choix techniques de l'agent : balises OSM exactes du mobilier urbain (bancs, lampadaires), formes
  simples, plafond du nombre d'arbres, fixés au lot 1.
- À lancer après `fournisseurs-ouverts` : les deux chantiers touchent `app/src/city/`.
- Contrats concernés : `APP-001`, `APP-003`, `QUA-001`, `QUA-004`, `QUA-020`.

## Contrats modifiés

- `APP-003` — l'extrait OSM porte aussi couleurs, matériaux, arbres et mobilier ; la règle des bâtiments et de l'attribution ne change pas.
- `QUA-020` — chemins e2e à jour pour le rendu enrichi.

## 5. Points à trancher

*(aucun : le relais du relief et la couverture des arbres sont des questions d'intention, hors de ce chantier)*

## 6. Lots

- **Lot 1 — extraction** [AI] : conserver les balises utiles, relancer les quatre extractions, lire les mêmes balises pour un
  trajet libre. Sortie : tests verts, extraits relus.
- **Lot 2 — couleurs et ombrage** [AI] : teintes issues des balises, ombrage par sommet. Sortie : `run-checks` vert.
- **Lot 3 — arbres et mobilier** [AI] : instances plafonnées, fondu de sécurité. Sortie : `run-checks` vert.
- **Lot 4 — e2e et doc** [AI] : e2e, docs, contrats à jour. Sortie : CI verte.
- **Lot 5 — essai réel** [human] : juger le rendu et les 72 images par seconde sur le Quest 3.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : aucun.
- **Prochaine étape** : [AI] lot 1, après `fournisseurs-ouverts`.
