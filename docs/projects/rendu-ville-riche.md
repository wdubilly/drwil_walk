# Chantier : une ville plus riche (sol, végétation, toits, noms de rues)

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt

<!-- scope
files:
  - app/scripts/osm-tags.ts
  - app/scripts/extract-souq.ts
  - app/data/*
  - app/src/city/*
  - app/src/city/roads.test.ts
  - app/src/city/buildings.test.ts
  - app/src/city/props.test.ts
  - app/src/city/souq.test.ts
  - app/src/city/souq-data.test.ts
  - app/src/xr/*
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Un testeur trouve le rendu beaucoup plus beau avec les dégradés d'`osm-enrichi`, mais il manque de la verdure au sol, des
toits plus variés et les noms des rues. Sa maquette « améliorations légères à fort impact » (reçue le 2026-10-31)
propose sept familles ; le demandeur retient quatre : sol et route, végétation au sol, toits et bâtiments, noms des rues.

## Critères d'acceptation

- Le sol et la route montrent trottoirs et passages piétons tirés des voies d'OpenStreetMap, et le chemin suivi se
  distingue par son contraste ; les marquages au sol sont ceux d'`ambiance-cartoon` — `APP-003`
- Le sol montre de l'herbe, des parcs, des jardins et des haies tirés de l'occupation du sol d'OpenStreetMap ; l'extrait
  figé porte ces balises — `APP-003`
- Les bâtiments ont des toits plus variés (deux pans selon la balise OSM) et des auvents ; la couleur des toits suit le matériau toon
  d'`ambiance-cartoon`, sans augmenter le nombre de
  maillages au-delà d'un budget fixé — `APP-003`
- Les noms des rues s'affichent dans la scène, lisibles, tirés de la balise `name` de l'extrait — `APP-003`
- Tout ce qui s'ajoute (sol, végétation, toits, noms) est effacé par le fondu tête baissée et reste hors de la zone tapis
  [humain] — `APP-001`
- Les quatre extraits versionnés portent les nouvelles balises, et l'extraction d'un trajet libre les lit aussi — `APP-003`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le rendu riche — `QUA-020`

## Contrats modifiés

- `APP-003` — les bâtiments viennent de l'extrait OpenStreetMap : le sol, la végétation, les noms de rues et les toits en
  viennent aussi ; la règle de l'attribution ne change pas (approuvé le 2026-10-31).
- `QUA-020` — chemins e2e à jour pour le rendu riche.

## 2. Hors périmètre

- Le ciel dégradé, le soleil, la brume et les collines de la maquette : un fond opaque cacherait le réel, ce qui
  affaiblit `APP-001` ; décision du 2026-10-31 de garder le passthrough sans ciel.
- Fenêtres, marquages au sol, matériau toon et arbres du pack Quaternius : `docs/projects/journal.md`.
- Mobilier supplémentaire (poubelles, feux), voitures, silhouettes, monuments : reporté.
- Le relief du sol : `docs/intentions/osm-enrichi.md`.
- Une attribution plus discrète : l'attribution est obligatoire (`APP-003`), son aspect ne change pas ici.

## 3. Contraintes

- Tenir 72 images par seconde : maillages fusionnés, un budget d'éléments par catégorie, les plus proches du parcours
  d'abord (comme `app/src/city/props.ts`). Les noms de rues sont plafonnés en nombre et en distance.
- Relancer les extractions Overpass pour conserver les balises : réseau intermittent, plusieurs essais possibles, extraits
  relus ; taille du dépôt à surveiller.
- Aucun appel réseau dans le casque pour les quatre itinéraires figés (`APP-003`).
- `APP-001` ne doit pas régresser : rien de ce chantier ne masque le tapis.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : sol et route, végétation au sol, toits et bâtiments, noms des rues ;
  le reste de la maquette n'est pas retenu pour ce chantier.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : balises exactes (par exemple
  `landuse=grass`, `leisure=park`, `highway=crossing`, `barrier=hedge`, `roof:shape`), budgets d'éléments, formes, couleurs,
  police et taille des noms.
- À lancer après `ambiance-cartoon`, qui fixe le style (matériau toon, routes, arbres du pack) que ce chantier complète en géométrie. Dépend d'`osm-enrichi` (livré, `docs/projects/journal.md`) ; touche `app/src/city/` comme `corniche-west-bay` : à lancer
  avant ou après lui, jamais en même temps.
- Contrats concernés : `APP-001`, `APP-003`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : balises, budgets et formes sont des choix techniques de l'agent)*

## 6. Lots

- **Lot 1 — extraction** [AI] : conserver les balises utiles (sol, végétation, `name`, `roof:shape`), relancer les quatre
  extractions, lire les mêmes balises pour un trajet libre. Sortie : tests verts, extraits relus.
- **Lot 2 — sol et route** [AI] : trottoirs, passages piétons, lignes, chemin contrasté. Sortie : `run-checks` vert.
- **Lot 3 — végétation au sol** [AI] : herbe, parcs, jardins, haies. Sortie : `run-checks` vert.
- **Lot 4 — toits et bâtiments** [AI] : toits à deux pans, auvents. Sortie : `run-checks` vert.
- **Lot 5 — noms de rues** [AI] : étiquettes plafonnées, fondu de sécurité. Sortie : `run-checks` vert.
- **Lot 6 — e2e et doc** [AI] : e2e, docs, contrats à jour. Sortie : CI verte.
- **Lot 7 — essai réel** [human] : juger le rendu et les 72 images par seconde sur le Quest 3.

## 7. Reprise

- **Dernier état** (2026-11-01) : lots 1 à 6 faits par l'agent (extraits, sol et route, verdure, toits, noms de rues, e2e et docs) ; lot 7 (essai réel au Quest 3) à faire par l'humain.
- **Travail non commité** : aucun une fois la clôture faite (branche `workstream/rendu-ville-riche`).
- **Prochaine étape** : [human] lot 7, voir `docs/intentions/essai-casque-ville-riche.md`.
