# Chantier : végétation régionale — palmiers, arbres d'alignement, buissons, jardinières

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (ensemble : `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/src/city/vegetation.ts
  - app/src/city/tree-assets.ts
  - app/src/city/tree-pack.ts
  - app/src/city/tree-instances.ts
  - app/src/city/vegetation.test.ts
  - app/src/city/tree-assets.test.ts
  - app/src/city/tree-pack.test.ts
  - app/src/city/tree-instances.test.ts
  - app/src/city/prepare-nature-pack.test.ts
  - app/scripts/prepare-nature-pack.ts
  - app/assets/quaternius-trees.json
  - app/assets/PROVENANCE.md
  - app/assets/quaternius-licence.txt
  - app/e2e/ville-riche.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Une végétation qui dise la région : palmiers et arbres bas en zone `golfe`, arbres d'alignement et jardinières en zone
`inde`, buissons, selon des **données de région** plutôt que du code par ville. Existant : quatre arbres `CommonTree` du pack
CC0 Quaternius, réduits à 413–454 triangles (`app/assets/quaternius-trees.json`, ~300 Ko, provenance dans
`app/assets/PROVENANCE.md`), lus par `app/src/city/tree-pack.ts` et posés par `app/src/city/tree-instances.ts` ; herbe, parcs, bois et haies en
surfaces dans `app/src/city/vegetation.ts` (150 surfaces, 200 haies au plus). Manquent : palmiers et essences régionales, buissons,
jardinières, une table région → essences avec repli, et un catalogue partagé (modèles + licence + poids) que les autres
composants de la recette peuvent aussi utiliser (`docs/intentions/rendu-jeu-video.md`).

## Critères d'acceptation

- Les essences d'une ville viennent de la table de sa région, avec repli « ailleurs » ; aucune essence n'est écrite par
  ville — `APP-003`
- Chaque modèle du catalogue a une provenance et une licence compatible (CC0 ou équivalent) consignées dans
  `app/assets/PROVENANCE.md`, sans appel réseau pendant la marche — `APP-003`
- Un modèle manquant ou illisible est remplacé par un modèle de repli, sans casser la ville — `APP-003`
- Le placement est déterministe (graine OSM) et la végétation ne pousse jamais dans la zone tapis — `APP-001`
- La végétation s'efface tête baissée avec la ville — `APP-001`
- Les trois plateformes montrent les mêmes arbres, buissons et jardinières — `APP-015`
- La végétation de deux régions est reconnaissable au casque, images par seconde relevées [human] — `APP-015`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Les règles d'alignement et d'espacement (`docs/projects/gen-06-placement-coherent.md`) : ce chantier fournit les
  essences, pas la règle de placement.
- Le relief, l'ombrage, la météo et le vent animé.
- Les parcs et surfaces vertes issus d'OSM (déjà dans `app/src/city/vegetation.ts`), sauf leur couleur par région.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`) ; couverture à 100 % (`QUA-004`).
- Tout est donnée par région avec repli, jamais code propre à une ville ; un seul moteur ; mêmes contenus sur Quest, PC et
  tablette (`APP-015`).
- Champ **origine** : arbre relevé (`natural=tree` OSM) ou ajouté par règle.
- **Licence** : seuls des modèles CC0 (ou licence écrite compatible avec une redistribution dans le dépôt) ; le texte de
  licence est copié à côté, la mention écrite dans `app/assets/PROVENANCE.md`. Le téléchargement d'un pack passe par le demandeur
  quand une vérification anti-robot l'exige ; l'archive reste hors du dépôt.
- **Poids** : modèles réduits (triangles, texture), poids de `app/assets/` mesuré à chaque ajout ; pas de plafond chiffré
  imposé, mais un modèle de plus se justifie par la mesure (appels de rendu, mémoire).

## 4. Décisions

- 2026-11-07 : un **catalogue partagé** de modèles, des règles et des paramètres régionaux **en données**.
- 2026-11-07 : pas de budget chiffré par quartier ; la mesure reste exigée.

- 2026-11-12 : palmiers et essences indiennes : **autre pack CC0** (licence relue et consignée avant tout ajout au dépôt).
- 2026-11-12 : modèles préparés par **le même script paramétré** (`app/scripts/prepare-nature-pack.ts`).
- 2026-11-12 : jardinières et buissons : **formes produites par code**, comme les haies.
- 2026-11-12 : plafonds provisoires : **+5 Mo** pour `app/assets/` et **environ 2000 instances** au casque, à ajuster après la mesure.

## 5. Points à décider

Aucun : tranchés le 2026-11-12 (voir « Décisions »).

## 6. Incréments

- **Incrément 1 — source et licence** [human] : choisir les modèles, télécharger, vérifier la licence. Sortie : provenance
  écrite, points 1 à 4 tranchés.
- **Incrément 2 — table région → essences** [AI] : données, repli, lecture. Sortie : tests verts, `APP-003` passe.
- **Incrément 3 — modèles ajoutés et réduits** [AI] : script de préparation, poids relevé. Sortie : tests verts, poids noté.
- **Incrément 4 — jardinières, buissons, e2e** [AI] : placement, e2e tête baissée. Sortie : CI verte, `APP-001` passe.
- **Incrément 5 — jugement au casque** [human] : deux régions, images par seconde. Sortie : contrat `[human]` attesté.

## 7. Reprise

- **Dernier état (2026-11-07)**: cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] trancher la source et la licence des modèles (section 5).
