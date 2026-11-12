# Chantier : matériaux — palette de repli sans photos, textures compressées, jugement au casque

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (ensemble : `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/src/city/material-library.ts
  - app/src/city/material-variation.ts
  - app/src/city/material-mesh.ts
  - app/src/city/region-palette.ts
  - app/src/city/material-library.test.ts
  - app/src/city/material-variation.test.ts
  - app/src/city/material-mesh.test.ts
  - app/src/city/materials-run.test.ts
  - app/scripts/materials-areas.ts
  - app/scripts/materials-run.ts
  - app/scripts/materials-textures.ts
  - app/assets/materials/doha-souq-waqif.json
  - app/assets/PROVENANCE.md
  - app/e2e/materiaux-souk.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Rendre l'apparence des murs fiable **même sans photo de rue** : aujourd'hui seul le souk Waqif a une bibliothèque de
matériaux (`app/assets/materials/doha-souq-waqif.json`, branchée par `LIBRARIES` dans `app/src/city/material-library.ts`) ; ailleurs,
les teintes OpenStreetMap et la palette de région (`app/src/city/region-palette.ts`, `golfe` et `inde` seulement, sinon « ailleurs »)
restent seules. La recette d'un quartier (`docs/intentions/recette-visuelle-promenade.md`) exige un **repli** par région
quand les photos manquent, une **compression des textures** pour le Quest 3 (aujourd'hui JPEG 256 px décompressés en
mémoire graphique, aucun chargeur KTX2) et un **jugement au casque** avant de généraliser
(`docs/intentions/essai-casque-materiaux-souk.md`, `docs/intentions/textures-compressees-quest.md`,
`docs/intentions/identite-visuelle-quartiers.md`).

## Critères d'acceptation

- Un quartier sans photo ni bibliothèque reçoit des matériaux de repli de sa région, appliqués automatiquement, sans code
  propre à une ville — `APP-012`
- Une région sans repli propre prend celui d'« ailleurs » ; une donnée de matériau illisible ne casse pas la ville —
  `APP-012`
- Le repli reste dans les bornes du contrat (nombre de matériaux, mémoire graphique, textures embarquées, CC0 avec
  provenance) et sans appel réseau pendant la marche — `APP-012`
- Les matériaux de repli diffèrent entre bâtiments voisins et sont déterministes (identifiant OSM) — `APP-012`
- Le profil « performance » retire tout placage, le profil de rendu règle le reste — `APP-012`
- Tête baissée, les matériaux (repli compris) s'effacent avec la ville — `APP-001`
- Les trois plateformes montrent les mêmes matériaux — `APP-015`
- Le souk et un quartier au repli sont reconnaissables au casque, images par seconde relevées [human] — `APP-012`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Les sols, rez-de-chaussée et façades (chantiers voisins de la recette), le placage de photos en perspective.
- Les couleurs tirées de vraies photos (`docs/intentions/couleurs-photos-souk.md`).
- Tout plafond chiffré imposé d'avance : la mesure sert à juger.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par ville ou par région, jamais du code propre à une ville ; un seul moteur ; mêmes contenus sur Quest,
  PC et tablette (`APP-015`).
- Chaque matériau porte un champ **origine** : relevé (photo OSM/Panoramax) ou ajouté par règle (repli).
- Budget mesuré au casque, pas de plafond imposé ; repli quand une donnée manque (photo, texture, région).
- Textures CC0 seulement, provenance dans `app/assets/PROVENANCE.md`.
- Existant : bornes d'`APP-012` (3 matériaux, 4 Mo) à confirmer ou à relever après mesure.

## 4. Décisions

- 2026-11-07 : la recette vit en **données de région avec surcharge par quartier**, champ d'origine relu par les preuves.
- 2026-11-07 : **pas de budget chiffré** par quartier ; la mesure reste exigée.

- 2026-11-12 : repli = **palette de couleurs de `app/src/city/region-palette.ts` seule** (pas de bibliothèque JSON par région ; le souk garde ses photos).
- 2026-11-12 : **transcodeur KTX2 (WebAssembly servi avec la page) intégré dans ce chantier** ; sa taille et sa maintenance sont à consigner dans le journal.
- 2026-11-12 : texture à hauteur d'homme : **512 px**.
- 2026-11-12 : bornes d'`APP-012` (3 matériaux, 4 Mo) **conservées** : aucun contrat modifié.

## 5. Points à décider

Aucun : tranchés le 2026-11-12 (voir « Décisions »).

## 6. Incréments

- **Incrément 1 — mesure et jugement du souk** [human] : séance casque sur le souk (`docs/intentions/seance-casque-parcours.md`),
  images par seconde, jugement des matériaux. Sortie : relevé écrit et points 1 à 4 tranchés.
- **Incrément 2 — repli par région en données** [AI] : format avec origine, repli « ailleurs », test des cas manquants.
  Sortie : tests verts, `APP-012` et `APP-001` passent.
- **Incrément 3 — compression KTX2** [AI], seulement si décidée : chargeur, transcodeur, e2e. Sortie : CI verte, poids mesuré.
- **Incrément 4 — essai au casque du repli** [human] : un quartier sans photo. Sortie : jugement noté, contrat `[human]` attesté.

## 7. Reprise

- **Dernier état (2026-11-12)**: lot 2 (repli par région en données) fait : `loadRecipe` (`app/src/city/region-palette.ts`) charge la recette
  embarquée en écartant un élément illisible (repli quartier → région → « ailleurs »), tests `APP-012` dans `app/src/city/material-library.test.ts`,
  docs à jour. Le format avec origine, la palette de région et « ailleurs » existaient déjà (gen-02) ; aucune bibliothèque JSON par région.
- **Travail non commité** : aucun.
- **Prochaine étape** : lot 3 (compression KTX2, [AI]), puis lots [humain] 1 et 4 (séance casque).
