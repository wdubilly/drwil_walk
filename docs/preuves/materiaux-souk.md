# Preuve du chantier facades-materiaux-souk : inventaire des photos, couleurs et budget

Relevés du 2026-11-04 par le chantier facades-materiaux-souk (`docs/projects/journal.md`, contrat `APP-012`). La preuve
de clôture du chantier est écrite à part par `node .githooks/close.mjs`.

## Inventaire des photos de rue du souk Waqif (`SEC-007`)

Commande (depuis `app/`, hors casque) : `npm run materials:inventory -- doha-souq-waqif`. Le script interroge Panoramax
(`https://api.panoramax.xyz/api/search`, boîte du tracé élargie) et ne garde que les photos à moins de 30 m de la boucle
`app/data/souq-waqif-boucle.json` ; sous 20 photos, il se replie sur Mapillary **seulement** si un jeton est fourni dans
la variable `MAPILLARY_TOKEN` (jamais dans le dépôt). Sortie lue le 2026-11-04 :

- Panoramax : 0 photo(s) à moins de 30 m du tracé (seuil de suffisance : 20).
- Mapillary : non interrogé (sans jeton).
- Retenues : 0 photo(s).

**Couverture réelle : nulle.** Aucune photo n'est relevée ; `app/assets/materials/doha-souq-waqif-photos.json` est une
liste vide. Le relevé Mapillary attend le jeton du demandeur (`docs/intentions/couleurs-photos-souk.md`).

## Couleurs de la bibliothèque

Faute de photo, `npm run materials:library -- doha-souq-waqif` a recoloré les textures avec les couleurs **provisoires**
de la palette du souk (`app/src/city/cities.ts`), et la bibliothèque le dit (`colours.source = "provisoire"`) :
`#e3cfa5`, `#d2b48c`, `#c99a6b`, `#efe0c0`. Matériaux : enduit `#efe0c0` (ambientCG `Plaster001`), pierre `#d2b48c`
(`Bricks106A`), bois `#c99a6b` (`Planks037A`), tous CC0 (`app/assets/PROVENANCE.md`). Relecture des couleurs par le
demandeur : **non faite** (critère [human]).

## Budget mesuré

- Fichier embarqué `app/assets/materials/doha-souq-waqif.json` : 113 Ko (6 JPEG 256 × 256 px en base64).
- Mémoire graphique estimée (`textureBytes`, mipmaps comprises) : 3 matériaux × 2 textures × 256² × 4 octets × 4/3
  ≈ 1,05 Mo, sous le plafond de 4 Mo (`MAX_TEXTURE_BYTES`).
- Diagnostic de rendu, version PC au souk, profil équilibré (e2e `app/e2e/materiaux-souk.test.ts`, Chromium) :
  « Textures en mémoire » **3** avec OpenStreetMap, **9** avec les matériaux locaux (+6 : couleur et relief des trois
  matériaux).
- Profil « performance » : aucun placage (test `APP-012 (APP-006)` de `app/src/city/material-mesh.test.ts`).
- Les textures sont des JPEG, décompressés en mémoire graphique : aucune compression GPU (KTX2/Basis) à ce jour
  (`docs/intentions/textures-compressees-quest.md`).
- Images par seconde sur un vrai Quest 3 : **non mesurées** (`docs/intentions/essai-casque-materiaux-souk.md`).
