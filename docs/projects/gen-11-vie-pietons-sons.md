# Chantier : vie — piétons animés, modèles régionaux, régions réglées, sons locaux

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (rang 5, « Vie » ; fiche d'ensemble `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/src/city/traffic.ts
  - app/src/city/traffic.test.ts
  - app/src/city/traffic-catalog.ts
  - app/src/city/traffic-catalog.test.ts
  - app/src/city/traffic-motion.ts
  - app/src/city/traffic-motion.test.ts
  - app/src/city/traffic-pack.ts
  - app/src/city/traffic-pack.test.ts
  - app/src/city/traffic-rule.ts
  - app/src/city/traffic-rule.test.ts
  - app/src/city/traffic-budget.test.ts
  - app/src/city/live-city.ts
  - app/src/city/live-city.test.ts
  - app/src/xr/ambience-sound.ts
  - app/src/xr/ambience-sound.test.ts
  - app/scripts/prepare-traffic-pack.ts
  - app/assets/figurants-catalogue.json
  - app/assets/PROVENANCE.md
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

La ville vivante (`APP-014`) existe au seul Souq Waqif : véhicules et piétons produits par règle, décrits par un catalogue de
types et une table par région. Reste à la rendre **crédible partout** : piétons qui marchent au lieu de glisser, modèles propres
aux régions (rickshaws), régions réglées, sons locaux.

**Existant** (vérifié le 2026-11-07) : `app/assets/figurants-catalogue.json` règle la région `golfe` ; `inde` est provisoire,
`ailleurs` est le défaut ; la liste `itineraires` ne contient que `doha-souq-waqif`. Les piétons glissent (pose figée du pack
Kenney, `app/scripts/prepare-traffic-pack.ts`) ; le rendu est instancié, un appel par modèle (`app/src/city/traffic.ts`). Le son est un
murmure de bruit filtré produit par code (`app/src/xr/ambience-sound.ts`, gain ≤ 0,2, coupé par défaut). **Manque** : animation,
rickshaws, régions réglées, sons enregistrés.

Intentions reprises : `docs/intentions/pietons-animes.md`, `docs/intentions/ville-vivante.md`,
`docs/intentions/sons-ambiance-ville.md`.

## Critères d'acceptation

- Pour toute région du catalogue (`golfe`, `inde`, `ailleurs`…), les figurants viennent de `app/assets/figurants-catalogue.json`,
  sans type en dur ni code propre à une ville ; une région inconnue retombe sur `ailleurs` — `APP-014`
- Véhicules et piétons restent produits par règle, reproductibles, et jamais devant l'utilisateur — `APP-014`
- Un piéton marche (pose changeante) au lieu de glisser, dans le budget mesuré de la ville — `APP-014`
- Un modèle régional ajouté (rickshaw) est une ligne de catalogue et un poids de région, avec sa provenance et sa
  licence dans `app/assets/PROVENANCE.md` — `APP-003`
- Les figurants s'effacent comme la ville tête baissée et ne couvrent ni le tapis ni la zone de marche — `APP-001`
- Les sons locaux restent coupés par défaut, plafonnés, et ne couvrent ni le tapis ni la pièce — `APP-011`
- Les mêmes figurants et sons sur Quest, PC et tablette — `APP-015`
- La marche animée et les sons locaux sont jugés crédibles au casque [human] — `APP-014`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Éclairage, météo, ombres : `docs/projects/gen-13-effets-ambiance.md`.
- Régénérer les itinéraires et ajouter des villes : `docs/projects/gen-12-catalogue-regeneration.md`.
- Relief et niveaux de détail : `docs/projects/rendu-lod-cellules.md`.
- Génération dans l'appli (à étudier dans une intention à part).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par région ou ville (catalogue), jamais du code propre à une ville ; un seul moteur ; mêmes contenus sur
  Quest, PC et tablette (`APP-015`).
- Champ « origine » : figurant ajouté par règle, jamais pris pour du relevé (`APP-014`).
- Pas de plafond chiffré imposé : appels de rendu, triangles et poids audio mesurés à chaque incrément (budget de
  `app/src/city/traffic-budget.test.ts`).
- Repli quand une donnée manque : région `ailleurs`, silence plutôt qu'un son manquant.

## 4. Décisions

- 2026-11-07 : piétons animés, régions et sons locaux entrent dans la recette (rang 5).
- 2026-11-05 : catalogue et table par région sont des données ; `ailleurs` est acceptée comme défaut.

## 5. Points à décider

- [decision] Technique d'animation : texture lue par le shader, poses alternées par instance, ou squelette ; mesurée au casque.
- [decision] Réglage des régions : valeurs de `inde` (provisoires) et de toute région des villes à venir, sourcées.
- [decision] Embarquer des enregistrements CC0 et jusqu'à quel poids ; un son par itinéraire ou une rumeur commune ;
  variation avec l'heure et la vitesse.
- [human] Choix des modèles régionaux (rickshaws…) et de leur source CC0.

## 6. Incréments

1. **Choix des sources et de la technique** [human] : modèles, sons, animation. Sortie : section 4 complétée.
2. **Régions réglées** [AI] : catalogue, repli `ailleurs`, toutes les villes listées. Sortie : tests verts, `APP-014`.
3. **Modèles régionaux** [AI] : préparation du pack, provenance. Sortie : tests verts, `APP-003`.
4. **Piétons animés** [AI] : technique choisie, budget mesuré. Sortie : tests verts, `APP-014`.
5. **Sons locaux** [AI] : sons embarqués, plafond. Sortie : tests verts, `APP-011`.
6. **Jugement au casque** [human] : glissement, sons, cadence. Sortie : verdict noté.

## 7. Reprise

- **Dernier état (2026-11-07)** : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] trancher les points de la section 5, puis passer la maturité à « prêt ».
