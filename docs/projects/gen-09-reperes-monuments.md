# Chantier : repères — monuments, lieux de culte, tours en treillis, bâtiments remarquables

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (rang 5, « Repères » ; fiche d'ensemble `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/src/city/buildings.ts
  - app/src/city/buildings.test.ts
  - app/src/city/gltf-read.ts
  - app/src/city/gltf-read.test.ts
  - app/src/city/outlines.ts
  - app/src/city/outlines.test.ts
  - app/src/city/facade-family.ts
  - app/src/city/facade-family.test.ts
  - app/scripts/extract-souq.ts
  - app/scripts/osm-tags.ts
  - app/assets/PROVENANCE.md
  - app/e2e/facades-batiments.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Une promenade se reconnaît à ses repères : une mosquée, un temple, une tour en treillis, un monument. Aujourd'hui tout
bâtiment est un prisme plein extrudé de son emprise (`app/src/city/buildings.ts`), habillé par une famille de façades
(`APP-008`) ; rien ne distingue un lieu de culte d'une maison, et une tour `building=tower` donnerait un bloc plein
(`docs/intentions/tours-treillis-extrudees.md`). Le but : repérer ces bâtiments **par règle** sur des données (balises
OpenStreetMap, par ville ou région) et leur donner une forme ou un modèle glTF partagé, **sans code propre à une ville**.

**Existant** : extrusion et façades par règle ; `app/src/city/gltf-read.ts` lit un glTF (pour le pack d'arbres, `app/src/city/tree-pack.ts`) ;
`app/src/city/outlines.ts` trace les contours près du parcours (option désactivée par défaut). **Manque** : tout glTF de monument ou de
mobilier remarquable, la distinction des lieux de culte et tours, et le nom des bâtiments dans l'extrait
(`docs/intentions/noms-de-batiments-extrait.md`).

Intentions reprises : `docs/intentions/facades-textures-monuments.md`, `docs/intentions/mobilier-remarquable-gltf.md`.

## Critères d'acceptation

- Un bâtiment reconnu comme repère (balise `amenity=place_of_worship`, `building=tower`, `man_made=tower`…) est produit par la
  règle, déterminé par l'extrait et non par un identifiant de ville ; le même extrait redonne la même scène — `APP-008`
- Une tour en treillis n'est jamais un bloc plein ni un gratte-ciel de verre de sa hauteur balisée — `APP-008`
- Chaque modèle glTF de repère embarqué porte sa source, sa licence compatible et son poids dans `app/assets/PROVENANCE.md` ;
  aucune requête hors de la page servie — `APP-003`
- Les repères viennent de l'extrait OpenStreetMap embarqué, l'attribution reste affichée et chaque repère garde son
  champ « origine » (relevé ou ajouté par règle) — `APP-003`
- Un repère sans modèle ni donnée retombe sur l'extrusion et la façade d'aujourd'hui, sans erreur — `APP-008`
- Les repères s'effacent comme la ville tête baissée et ne masquent ni le tapis ni la zone de marche — `APP-001`
- Le repère est reconnaissable en marchant, sur le casque [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Textures photographiques ou PBR de façade (`docs/intentions/facades-textures-monuments.md`, question ouverte, non reprise).
- Relief et niveaux de détail : `docs/projects/rendu-lod-cellules.md`.
- Eau et paysage (`docs/projects/gen-10-eau-paysage.md`), figurants (`docs/projects/gen-11-vie-pietons-sons.md`).
- Régénérer les itinéraires : `docs/projects/gen-12-catalogue-regeneration.md`.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par ville ou région, jamais du code propre à une ville ; un seul moteur ; mêmes contenus sur Quest, PC et
  tablette (`APP-015`).
- Un champ « origine » par repère (relevé OSM ou photo, ou ajouté par règle).
- Pas de plafond chiffré imposé : le poids (extrait, glTF) et les appels de rendu sont mesurés à chaque incrément.
- Repli quand une donnée manque : retour à l'extrusion actuelle.

## 4. Décisions

- 2026-11-07 : les repères entrent dans la recette (périmètre élargi à tous les composants graphiques), au rang 5.
- 2026-11-07 : relevé et ajouté sont distingués par un champ d'origine dans les données.

## 5. Points à décider

- [decision] Tours en treillis : géométrie produite par règle, modèle glTF ou exclusion de l'extraction
  (`docs/intentions/tours-treillis-extrudees.md`) ?
- [decision] Noms de bâtiments : tous, ou seulement les types remarquables ; comment les montrer sans masquer le réel
  (`docs/intentions/noms-de-batiments-extrait.md`).
- [decision] Plafond de hauteur sur les bâtiments extrudés (erreur de balise).
- [human] Quels monuments et éléments remarquables en glTF, de quelle source, sous quelle licence (CC0 de préférence).

## 6. Incréments

1. **Choix des repères et des sources** [human] : liste, licences. Sortie : décisions ci-dessus portées en section 4.
2. **Extraction des balises et du nom** [AI] : champs d'origine, réextraction, boucles toujours valides. Sortie : tests verts.
3. **Règle de repère et repli** [AI] : classification, tour en treillis, repli. Sortie : tests verts, `APP-008`.
4. **Modèles glTF et provenance** [AI] : chargement partagé, `app/assets/PROVENANCE.md`. Sortie : tests verts, `APP-003`.
5. **Jugement au casque** [human] : reconnaître les repères, mesurer cadence et poids. Sortie : verdict noté.

## 7. Reprise

- **Dernier état (2026-11-07)** : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] trancher les points de la section 5, puis passer la maturité à « prêt ».
