# Chantier : jalon de généralisation — Pune Vieille ville avec le même moteur que le souk Waqif

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (ensemble : `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/src/city/region-palette.ts
  - app/src/city/facade-family.ts
  - app/src/city/facade-palettes.ts
  - app/src/city/souq.ts
  - app/src/city/material-library.ts
  - app/src/city/cities.ts
  - app/src/city/traffic-catalog.ts
  - app/src/city/souq.test.ts
  - app/src/city/facade-family.test.ts
  - app/src/city/facade-palettes.test.ts
  - app/src/city/cities.test.ts
  - app/src/city/traffic-catalog.test.ts
  - app/assets/figurants-catalogue.json
  - app/assets/materials/pune-vieille-ville.json
  - app/data/pune-vieille-ville.json
  - app/scripts/materials-areas.ts
  - app/e2e/ville-riche.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Prouver que le générateur est général : **Pune Vieille ville** (`app/data/pune-vieille-ville.json`) est générée avec le
**même moteur** que le souk Waqif, **sans retouche de code**, en complétant seulement les paramètres de la région `inde`
(aujourd'hui provisoire : une palette dans `app/src/city/region-palette.ts`, familles de façades et figurants au repli). Le jalon de la
recette (`docs/intentions/recette-visuelle-promenade.md`) : deux quartiers très différents, ambiances reconnues d'emblée.
Existant : région `inde` détectée par `regionOf` ; palette de façades et tables de figurants provisoires ; aucune
bibliothèque de matériaux pour Pune (`LIBRARIES`), ni sols, végétation ou mobilier propres à la région. Manque : tous les
paramètres `inde` en données, et la preuve d'absence de code propre à une ville.

## Critères d'acceptation

- Les bâtiments de Pune Vieille ville viennent de l'extrait embarqué, avec l'attribution OpenStreetMap — `APP-003`
- Les façades de Pune utilisent les paramètres régionaux `inde` (famille, palette), déterministes, variées entre voisins,
  sans texture et réglées par le profil — `APP-008`
- Les matériaux de Pune viennent d'une bibliothèque en données ou du repli de région, appliqués automatiquement — `APP-012`
- Les figurants de Pune viennent des tables `inde` du catalogue (densités, côté de conduite), jamais devant l'utilisateur —
  `APP-014`
- Aucun fichier de `app/src/` ne cite Pune, Doha ou le souk par son nom pour décider d'un rendu (vérifié par recherche
  dans le dépôt, repli de région sinon) — `APP-012`
- Pune et le souk montrent la même chose sur Quest, PC et tablette — `APP-015`
- Tête baissée, tout s'efface et la zone tapis reste vide — `APP-001`
- Les deux quartiers sont reconnaissables au casque l'un de l'autre [human] — `APP-012`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Pune FC Road et Doha Corniche : le catalogue complet vient après ce jalon (`docs/intentions/villes-a-parcourir.md`).
- Monuments, eau, piétons animés, sons, relief : composants de rang 5 de la recette.
- Toute nouvelle extraction OSM, toute ville nouvelle créée par `npm run city`.

## 3. Contraintes

- **Dépend des chantiers `docs/projects/gen-02-*` à `docs/projects/gen-07-*`** (format de la recette, sols, rez-de-chaussée,
  matériaux, placement, végétation) : ils doivent être livrés ; ce chantier ne les refait pas.
- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par ville ou par région, jamais code propre à une ville ; un seul moteur ; mêmes contenus sur Quest, PC
  et tablette (`APP-015`) ; si une retouche de code est nécessaire, c'est un **défaut du moteur** à rendre général, pas
  une exception, et le jalon n'est pas atteint tant qu'elle reste.
- Champ **origine** pour chaque donnée régionale : relevé (OSM, photo) ou ajouté par règle.
- Budget mesuré au casque (appels de rendu, poids des données), sans plafond imposé ; repli quand une donnée manque.

## 4. Décisions

- 2026-11-07 : jalon fixé : **souk Waqif et Pune Vieille ville**, même moteur, sans retouche de code.
- 2026-11-07 : paramètres régionaux complétés plutôt que des exceptions codées.

- 2026-11-07 : photos de référence de Pune : **Panoramax d'abord**, repli de région si insuffisant.
- 2026-11-07 : une retouche de code **généralisante** est acceptée pendant le jalon ; une exception propre à Pune est un
  échec.

## 5. Points à décider

- [decision] Quelles valeurs `inde` : palette de façades, sols, essences, mobilier, côté de conduite (gauche), densités de
  figurants ? À valider sur des références visuelles apportées par le demandeur.

## 6. Incréments

- **Incrément 1 — références et valeurs `inde`** [human] : fournir ou valider les références. Sortie : points 1 et 2 tranchés.
- **Incrément 2 — paramètres régionaux en données** [AI] : palette, familles, figurants, matériaux, sans toucher au code.
  Sortie : tests verts, `git diff` limité aux données et tests.
- **Incrément 3 — preuve d'absence de code par ville** [AI] : test de non-régression et e2e Pune. Sortie : CI verte,
  `APP-001` et `APP-015` passent.
- **Incrément 4 — essai au casque des deux quartiers** [human] : comparer l'ambiance. Sortie : contrat `[human]` attesté.

## 7. Reprise

- **Dernier état (2026-11-07)**: cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : attendre la livraison de gen-02 à gen-07, puis [human] valider les références de Pune.
