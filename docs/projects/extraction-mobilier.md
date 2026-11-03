# Chantier : réextraire les quatre quartiers (poubelles et panneaux)

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/extraction-mobilier-manquant.md`

<!-- scope
files:
  - app/data/*.json
  - app/scripts/*.ts
  - app/scripts/*.test.ts
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
-->

## 1. Besoin

Les quatre extraits figés datent du 2026-10-31 et ne portent ni poubelle ni panneau : ces balises n'étaient pas demandées à
Overpass à l'époque. Le code les lit désormais (`app/scripts/osm-tags.ts`, `app/scripts/extract-souq.ts`), mais rien ne
s'affichera tant
que les fichiers de `app/data/` n'auront pas été réécrits. Les relancer amène ce mobilier là où OpenStreetMap en porte.

## Critères d'acceptation

- Les quatre extraits sont réécrits par les scripts existants, avec les balises complètes — `APP-003`
- Le mobilier nouvellement apporté (poubelles, panneaux) est relevé par ville, avant et après, dans la preuve du chantier
- Les bancs existants sont **remplacés** par ceux de l'extraction, jamais fusionnés : aucune donnée ne survit à sa
  suppression dans OpenStreetMap — `APP-003`
- Chaque point des tracés `app/data/*-boucle.json` reste un sommet d'une voie de son extrait (test existant, non-régression)
- Le poids total de `app/data/` reste sous le plafond vérifié par les tests
- Les quatre villes se chargent et se parcourent comme avant, sans trou ni bâtiment disparu

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Les lampadaires : absents d'OpenStreetMap dans ces quartiers, une extraction n'y changera rien
  (`docs/projects/lampadaires-generes.md`).
- Toute modification du rendu ou du placement du mobilier (livré par `APP-009`).
- La généralisation des quatre scripts d'extraction en un seul (`docs/intentions/villes-a-parcourir.md`).

## 3. Contraintes

- L'extraction demande un **accès réseau** à Overpass : hors marche, jamais depuis l'application (aucun flux réseau pendant
  l'utilisation).
- Overpass est un service public : espacer les requêtes, ne pas les relancer en boucle.
- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).

## 4. Décisions

- 2026-11-03 : **réextraire** les quatre quartiers, et accepter le diff des données.
- 2026-11-03 : les bancs sont **remplacés**, pas fusionnés — la ville doit rester attribuable à OpenStreetMap (`APP-003`).
  Une perte importante et inattendue rouvrirait la question ; le diff est relu avant d'être commité.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — relevé avant** [AI] : compter le mobilier par ville et par type dans les extraits actuels. Sortie : le tableau
  de départ.
- **Lot 2 — extraction** [AI] : relancer les quatre commandes `npm run extract*`, relire le diff (poids, comptes, tracés).
  Sortie : quatre fichiers réécrits, tests verts.
- **Lot 3 — preuve et doc** [AI] : relevé après, comparaison, documentation à jour. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucune extraction lancée.
- **Travail non commité** : la fiche.
- **Prochaine étape** : lot 1, le relevé avant extraction.
