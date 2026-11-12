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
  - docs/contracts.md
  - app/package.json
  - app/package-lock.json
  - app/src/city/material-ktx2.ts
  - app/src/city/material-ktx2.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/vite.config.ts
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
- Tête baissée, les matériaux (repli compris) s'effacent avec la ville [human] — `APP-001`
- Les trois plateformes montrent les mêmes matériaux — `APP-015`
- Le souk et un quartier au repli sont reconnaissables au casque, images par seconde relevées [human] — `APP-001`

## Contrats modifiés

- `APP-012` règle (3) : les textures peuvent être des KTX2 embarqués en `data:` en plus des JPEG (décision du demandeur, 2026-11-12, sondage des limites).

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
- 2026-11-12 : bornes d'`APP-012` (3 matériaux, 4 Mo) **conservées**.
- 2026-11-12 (sondage des limites du lot 3) : le demandeur fait traiter dans ce chantier l'encodeur KTX2 (dépendance `app/package.json`), la règle (3) d'`APP-012` (KTX2 en `data:` accepté) et le câblage du chargeur (`app/src/ui/home.ts`) ; le bloc scope est élargi en conséquence.

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

- **Dernier état (2026-11-12)**: lot 3 (compression KTX2) fait. Encodeur `ktx2-encoder` 0.6.0 (MIT, Basis Universal en WebAssembly,
  pur Node, dépendance de développement de `app/package.json`) dans `app/scripts/materials-textures.ts` (`prepareKtx2Material`) :
  couleur et normale en ETC1S (≈ 60 Ko chacune ; UASTC pesait 330 Ko par normale), 512 px sans agrandir, mipmaps comprises.
  Souk régénéré à couleurs et teintes identiques (`app/assets/materials/doha-souq-waqif.json` : 113 Ko → 413 Ko ; le paquet de la page grossit d'autant).
  Chargeur `app/src/city/material-ktx2.ts` (octets décodés puis `KTX2Loader.parse`, formats GPU sondés par un contexte GL jetable, échec dit
  par `console.error`), branché dans `app/src/ui/home.ts`. Transcodeur servi avec la page par le plugin `basisTranscoder` de `app/vite.config.ts`
  sous `/basis/` (dev et build) : 527 Ko de WebAssembly + 57 Ko de JavaScript (≈ 200 Ko compressés), copiés de `three/examples/jsm/libs/basis/`.
  Maintenance : le transcodeur suit la version de three.js (monter `three` monte le transcodeur) ; l'encodeur n'est lancé que sur PC de
  développement (`npm run materials:library`), jamais dans le casque ; le format KTX2 est stable, un fichier déjà encodé reste lisible.
  `APP-012` règle (3) étendue (KTX2 et JPEG en `data:`), règle (4) : un KTX2 compte 1 octet par pixel (2,1 Mo pour le souk, sous 4 Mo).
  Preuves : tests `APP-012` (`app/src/city/material-ktx2.test.ts`, `app/src/city/material-library.test.ts`, `app/src/city/materials-run.test.ts`, `app/src/ui/home.test.ts`), e2e du souk
  dans Chromium (transcodage réel, seul `/basis/` est demandé en plus de la page). Non jugé au casque : rendu des normales en ETC1S.
- **Travail non commité** : aucun.
- **Prochaine étape** : lots [humain] 1 et 4 (séance casque), puis vérification et clôture.
