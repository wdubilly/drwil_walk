# Chantier : le format de la recette en données

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (fiche d'ensemble `docs/intentions/generateur-ville-complet.md` ; absorbe `docs/intentions/palettes-regions-references.md`)

<!-- scope
files:
  - app/src/city/facade-family.ts
  - app/src/city/region-palette.ts
  - app/src/city/facade-palettes.ts
  - app/src/city/facade-family.test.ts
  - app/src/city/facade-palettes.test.ts
  - app/src/city/facades-data.test.ts
  - app/src/city/souq-data.ts
  - app/assets/figurants-catalogue.json
  - app/data/villes.json
  - app/assets/recette-regions.json
  - app/src/city/recipe-data.ts
  - app/e2e/facades-batiments.test.ts
  - app/src/city/souq.ts
  - app/src/city/facades.ts
  - app/src/city/facade-plan.ts
  - app/src/city/buildings.ts
  - app/src/city/material-mesh.ts
  - app/src/city/traffic.ts
  - app/src/city/traffic-assets.ts
  - app/src/city/traffic-assets.test.ts
  - app/src/city/traffic-catalog.test.ts
  - app/src/city/traffic-lanes.test.ts
  - app/src/city/traffic-rule.test.ts
  - app/src/city/traffic.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Décrire en **données** l'identité d'un quartier : une recette par région (par défaut) avec **surcharge par quartier**, des
valeurs de repli, et un champ d'**origine** (relevé OSM/photo, ou ajouté par règle) que les preuves relisent. Les chantiers
`gen-03` (sols) et `gen-04` (rez-de-chaussée) s'y appuient.

Existant (lu le 2026-11-07) : `regionOf` déduit la région de sept fenêtres de latitude/longitude codées
(`app/src/city/facade-family.ts`) ; les palettes de façade par région sont en code (`app/src/city/facade-palettes.ts`) ; la palette du
sol, des voies et des bâtiments vient de `app/src/city/region-palette.ts` (deux régions seulement, `golfe` et `inde`, sinon `ailleurs`) ;
les figurants ont une table de région en données (`app/assets/figurants-catalogue.json`, `golfe` réglé). Manque : un format
commun, la surcharge par quartier, l'origine des éléments, et des teintes appuyées sur des références.

## Critères d'acceptation

- La recette d'une région se lit dans des données ; une région sans entrée prend `ailleurs` sans erreur — `APP-008`
- Une surcharge de quartier l'emporte sur la région, sans code propre au quartier — `APP-008`
- Les façades restent déterministes, variées sans répétition voisine et légères avec la recette en données — `APP-008`
- Les matériaux locaux tirés de photos gardent la priorité sur le repli de la recette — `APP-012`
- Chaque élément de la recette porte son origine (relevé ou ajouté par règle) ; une preuve relit ce champ et refuse un
  élément ajouté présenté comme relevé — `APP-013`
- Les figurants lisent leur table de région dans le même format — `APP-014`
- Quest, PC et tablette montrent la même recette — `APP-015`
- La ville reste effacée tête baissée avec la recette appliquée [human] — `APP-001`
- Les teintes de chaque région sont jugées au casque ou sur captures — `APP-008`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Le contenu des sols (`gen-03`) et des rez-de-chaussée (`gen-04`) : cette fiche ne livre que le format et les régions
  existantes migrées.
- Les modèles propres aux régions (rickshaws) : `docs/intentions/ville-vivante.md`.
- Un plafond chiffré par quartier (écarté le 2026-11-07).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Un fichier de code reste sous 200 lignes (`QUA-001`) : `app/src/city/facade-palettes.ts` (146 lignes) ne doit pas grossir, les
  données sortent du code. Couverture à 100 % (`QUA-004`).
- Tout est donnée par ville/région, jamais code propre à une ville ; un seul moteur ; mêmes contenus sur trois plateformes
  (`APP-015`).
- Budget mesuré (poids des données, appels de rendu), sans plafond d'avance.
- Repli quand une donnée manque : région → `ailleurs` ; champ absent → valeur de la région ; jamais de géométrie invalide.

## 4. Décisions

- 2026-11-07 : **données de région par défaut, surcharge par quartier**.
- 2026-11-07 : **champ d'origine** dans les données, relu par les preuves.
- 2026-11-07 : jalon = souk Waqif et Pune Vieille ville, même moteur, sans retouche de code.
- 2026-11-07 : `docs/intentions/palettes-regions-references.md` est absorbée par ce chantier.
- 2026-11-07 : pas de budget chiffré par quartier ; mesure exigée.

- 2026-11-07 : le fichier de recette vit dans `app/assets/`, comme le catalogue des figurants.
- 2026-11-07 : les teintes de référence viennent de photos Panoramax d'abord, avec repli de région si elles ne suffisent
  pas (méthode de `APP-012`).

## 5. Points à décider

- [decision] Fenêtres de latitude/longitude conservées, ou régions plus fines (pays, polygones) ? Le cas de Lyon
  (trou entre Provence et France du Nord) reste ouvert.

## 6. Incréments

- **Incrément 1 — schéma de la recette** [AI] : types, lecture, repli, champ d'origine, tests. Sortie : tests verts,
  couverture 100 %.
- **Incrément 2 — migrer les régions existantes** [AI] : palettes de façade, sol et figurants lus des données, rendu
  inchangé (mêmes teintes qu'avant). Sortie : tests d'identité et e2e `facades-batiments` verts.
- **Incrément 3 — surcharge de quartier et preuve de l'origine** [AI] : un quartier surchargé, une preuve qui relit
  l'origine. Sortie : tests verts.
- **Incrément 4 — jugement des teintes** [human] : captures ou casque, souk et Pune. Sortie : verdict noté dans la fiche.

## 7. Reprise

- **Dernier état** (2026-11-11) : lot 3 fait. Une surcharge de quartier se trouve par l'emprise (`bounds`) de ses données
  (`districtAt`, `app/src/city/region-palette.ts`) ; `paletteOf` la lit. Deux quartiers livrés dans
  `app/assets/recette-regions.json` : `souq-waqif` (palette du Golfe) et `pune-vieille-ville` (jeu de façade `inde`), mêmes teintes
  qu'avant, origine `regle` : aucune teinte inventée sans référence. Preuve d'origine : `readRecipe` refuse un élément `releve`
  sans `source` (APP-013) ; test sur le fichier livré. Lots 1 et 2 : schéma, régions migrées (`app/src/city/recipe-data.ts`).
- **Limites hors cadre** : traitées le 2026-11-11 sur réponse « Traiter maintenant » de l'humain (sondage `drwil-limite`) :
  (1) les figurants lisent leur table de région (champ `figurants` de chaque entrée, avec origine) dans
  `app/assets/recette-regions.json` ; `app/assets/figurants-catalogue.json` ne garde que types et lieux ; `figurantsTable` fusionne régions
  et quartiers, `figurantsKeyOf` choisit la clé ; (2) façades et matériaux locaux lisent le quartier (`placeOf`, `district`
  passé à `planFacade`/`planAll`), mêmes teintes et même rendu qu'avant. Aucune fiche d'intention créée.
- **Travail non commité** : voir le dernier commit (figurants et façades par quartier) ; rien après.
- **Prochaine étape** : lot 4 [human] jugement des teintes (souk et Pune, captures ou casque). Les trois
  points [decision] de la section 5 restent à trancher par l'humain.
