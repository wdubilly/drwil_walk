# Chantier : fusion des bâtiments par cellules

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-lod-cellules.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/xr/*
  - app/src/render/*
  - app/e2e/*
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - app/AGENTS.md
-->

## 1. Besoin

Pouvoir afficher plus de détail près du marcheur sans dépasser le budget du casque : au lieu d'une seule géométrie fusionnée
pour tous les bâtiments, une fusion **par cellules** de l'extrait déjà chargé, avec élimination des cellules hors champ et
niveaux de détail simples. Pas de chargement par cellules (le demandeur l'écarte : les quatre villes tiennent en 2,8 Mo).

## Critères d'acceptation

- Les bâtiments sont fusionnés par cellules ; la ville affichée est identique à la fusion globale (mêmes bâtiments, mêmes
  teintes) — `APP-010`
- Les cellules hors du champ de vision ne sont pas dessinées ; le nombre d'appels de rendu reste sous le budget fixé après
  mesure — `APP-010`
- Aucune disparition brutale de bâtiment à l'approche ; un niveau de détail réduit au loin garde la silhouette — `APP-010`
- Les cellules s'effacent comme la ville tête baissée — `APP-001`
- Les images par seconde avant et après sur un vrai Quest 3 [human] — `APP-010`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Le chargement par cellules et le préchargement dans la direction de marche (écartés le 2026-11-03).
- Les textures et les façades (`docs/projects/journal.md`).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Justifié seulement par les mesures du diagnostic (`rendu-mesures-diagnostic`, livré) : sans appels de rendu ou triangles
  trop nombreux, ne pas démarrer.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).

## 4. Décisions

- 2026-11-03 : **fusion par cellules de l'extrait déjà chargé** ; pas de chargement par cellules.
- 2026-11-03 : budget serré, **150 appels de rendu et 500 000 triangles** au plus par image, sur chacune des quatre
  villes. Repères usuels du Quest 3 pour tenir 72 images par seconde avec de la marge. Ce sont des **objectifs
  provisoires** : le chantier ne démarre pas avant les mesures réelles au Quest 3, qui peuvent les corriger.
- 2026-11-03 : le chantier vient **après les façades détaillées**, livrées le 2026-11-03.

## 5. Points à trancher

- [human] Mesurer les images par seconde sur un vrai Quest 3 avec le diagnostic de rendu.

## 6. Lots

- **Lot 1 — mesure de départ** [human] : relever images par seconde, appels et triangles sur les quatre villes.
- **Lot 2 — fusion par cellules** [AI] : géométrie par cellule, hors-champ non dessiné. Sortie : tests verts.
- **Lot 3 — niveaux de détail, e2e et doc** [AI] : LOD simple, e2e, docs. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] relever les mesures au casque (parcours groupé : `docs/intentions/seance-casque-parcours.md`), puis démarrer si le budget est dépassé.
