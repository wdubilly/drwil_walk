# Chantier : des bâtiments détaillés (façades procédurales)

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-facades-batiments.md`

<!-- scope
files:
  - app/scripts/osm-tags.ts
  - app/scripts/extract-souq.ts
  - app/data/*
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/render/*
  - app/e2e/*
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Des façades variées à hauteur d'homme, au lieu de blocs extrudés : fenêtres, portes, vitrines, corniches, détails de toiture,
selon le type de bâtiment, le nombre d'étages et la largeur de façade. Des valeurs de repli cohérentes quand OpenStreetMap ne
dit ni la hauteur, ni le type, ni les étages, sans jamais produire de géométrie invalide ni de répétition visible.

## Critères d'acceptation

- Les extraits de `app/data/` conservent l'identifiant OSM de chaque bâtiment, la balise `building` et le nombre
  d'étages ; un bâtiment sans ces balises reçoit une valeur de repli cohérente, jamais une géométrie invalide — `APP-008`
- Les façades sont produites par code (sans texture) : fenêtres, volets, portes, balcons et corniche selon le type, les
  étages et la largeur — `APP-008`
- Quatre familles architecturales existent (provençale, maison de village, bâtiment ancien, construction récente) ; la famille
  dépend de la région de l'itinéraire : la provençale n'est utilisée que pour une ville de Provence, jamais à Pune ni à Doha —
  `APP-008`
- Couleurs, matériaux, fenêtres, volets, portes, balcons et détails varient dans une famille ; la hauteur, la largeur et le
  nombre d'étages d'OpenStreetMap règlent le nombre et l'emplacement des ouvertures, avec repli cohérent si une valeur manque —
  `APP-008`
- L'identifiant OSM du bâtiment sert de graine déterministe : deux chargements donnent exactement les mêmes façades —
  `APP-008`
- Deux bâtiments voisins partagent une cohérence de famille et de palette sans jamais avoir la même façade — `APP-008`
- La génération reste légère : un plafond de triangles et de matériaux par bâtiment, pas de texture photographique —
  `APP-008`
- Les bâtiments gardent leur provenance OpenStreetMap et leur attribution — `APP-003`
- Les façades se règlent par le profil graphique (détail réduit ou supprimé en « performance ») et gardent un repli sans
  détail — `APP-008`
- Les façades ne masquent pas le réel visible : tête baissée, la ville s'efface comme avant [human] — `APP-001`
- La marche se rejoue sur les quatre itinéraires avec les façades, sans erreur WebGL, sous les budgets de triangles — `QUA-020`
- Le rendu des façades à hauteur d'homme sur un vrai Quest 3, à 72 images par seconde [human] — `APP-001`

## Contrats modifiés

*(aucun : les façades enrichissent la géométrie sans changer le parcours ni la sécurité)*

## 2. Hors périmètre

- Les textures photographiques et PBR : le demandeur choisit des façades procédurales d'abord (2026-11-03) ; elles viendront
  dans une fiche à part.
- Une ville de Provence : aucune n'existe encore parmi les itinéraires ; la famille provençale est livrée prête, sans ville.
- Le chargement par cellules et les niveaux de détail (`docs/intentions/rendu-lod-cellules.md`).
- Le retrait du code Google dormant.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Les extraits restent légers (poids dans le navigateur du casque) ; licence ODbL et attribution conservées (`APP-003`).
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Dépend des profils graphiques (`docs/projects/journal.md`) pour son réglage.

## 4. Décisions

- 2026-11-03 : façades **procédurales d'abord**, sans texture.
- 2026-11-03 : **relancer les extractions** pour conserver `building` et le nombre d'étages (change `app/data/`).
- 2026-11-03 : quatre familles architecturales (provençale, maison de village, bâtiment ancien, construction récente), choisies
  **selon la région de l'itinéraire** ; la provençale seulement en Provence, jamais à Pune ni à Doha.
- 2026-11-03 : l'**identifiant OSM** sert de graine déterministe ; cohérence entre voisins sans façades identiques ;
  génération légère, **textures photographiques réservées à une évolution ultérieure**.
- 2026-11-03 : **quelques monuments en glTF**, source et licence à choisir (lot 4, geste humain).

## 5. Points à trancher

- [human] Les monuments en glTF : choisir lesquels, d'où ils viennent et leur licence (CC0 de préférence).
- [human] Le rendu à hauteur d'homme sur un vrai Quest 3.

## 6. Lots

- **Lot 1 — données** [AI] : relancer les extractions pour garder `building` et les étages ; contrôle de poids. Sortie : tests
  verts, fichiers de `app/data/` relus.
- **Lot 2 — moteur de façades** [AI] : graine tirée de l'identifiant OSM (vérifier qu'il traverse la lecture des extraits),
  fenêtres, volets, portes, balcons, corniches, repli, plafonds de triangles. Sortie : tests verts, couverture 100 %.
- **Lot 3 — familles et voisinage** [AI] : les quatre familles, choix par région, palette cohérente entre voisins sans
  façades identiques. Sortie : tests verts.
- **Lot 4 — profils, e2e et doc** [AI] : réglage par profil, e2e des quatre itinéraires, docs. Sortie : CI verte.
- **Lot 5 — monuments glTF** [human] : choisir les monuments et leur licence, puis les intégrer dans une fiche à part.

## 7. Reprise

- **Dernier état** (2026-11-03) : lots 1 à 4 livrés sur la branche `workstream/rendu-facades-batiments` (données, moteur, familles et voisinage, profils, e2e chemin 23, docs, contrat `APP-008`) ; le lot 5 (monuments glTF) reste [human].
- **Travail non commité** : voir `git status` ; le commit, la clôture et la PR suivent.
- **Prochaine étape** : [human] essai au casque (`docs/intentions/essai-casque-facades-batiments.md`), choix des monuments (`docs/intentions/facades-textures-monuments.md`).
