# Chantier : placement cohérent des arbres, lampadaires et mobilier

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (ensemble : `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/src/city/furniture.ts
  - app/src/city/street-lights.ts
  - app/src/city/lamp-rule.ts
  - app/src/city/tree-instances.ts
  - app/src/city/props.ts
  - app/src/city/furniture.test.ts
  - app/src/city/street-lights.test.ts
  - app/src/city/lamp-rule.test.ts
  - app/src/city/tree-instances.test.ts
  - app/src/city/props.test.ts
  - app/src/city/souq-lampadaires.test.ts
  - app/src/city/souq-trees.test.ts
  - app/scripts/osm-tags.ts
  - app/scripts/extract-souq.ts
  - app/e2e/lampadaires-generes.test.ts
  - app/e2e/mobilier-urbain.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Passer d'objets posés chacun de leur côté à un **placement cohérent** : arbres alignés avec espacements réguliers mais variés,
mobilier jamais dans un passage, lampadaires jamais sur la chaussée d'une voie perpendiculaire. Existant : les lampadaires sont
produits par règle le long des voies (`app/src/city/lamp-rule.ts`, `APP-013`) mais un mât peut tomber sur la chaussée ou le trottoir d'une
autre voie à un carrefour (`docs/intentions/lampadaires-carrefours-reglage.md`) ; le mobilier vient des seules balises
OpenStreetMap (`app/src/city/furniture.ts`, `app/src/city/props.ts`, `APP-009`) et les quatre extraits n'ont ni panneau ni lampadaire ; les arbres
(`app/src/city/tree-instances.ts`) n'ont pas de règle d'alignement. Manquent : règles d'alignement et d'espacement, dégagement des accès,
lampadaires aux carrefours, et une requête d'extraction complète (`docs/intentions/extraction-mobilier-manquant.md`,
`docs/intentions/requete-panneaux-stop.md`).

## Critères d'acceptation

- Un lampadaire n'est jamais posé sur la chaussée ou le trottoir d'une voie perpendiculaire à un carrefour — `APP-013`
- Les lampadaires restent reproductibles (graine OSM), variés de ±20 % et jamais pris pour du réel — `APP-013`
- Le mobilier posé (banc, poubelle, panneau) reste au sol, tourné dans l'axe du parcours, et n'est jamais inventé quand
  les données n'en portent pas — `APP-009`
- Les objets produits par règle (arbres, lampadaires) n'obstruent aucun accès : passage piéton, entrée, voie du parcours — `APP-009`
- Les arbres d'alignement suivent la voie avec un espacement varié, déterministe, et un repli quand la voie manque — `APP-009`
- Tout objet produit par règle est marqué « ajouté par règle », distinct du relevé OSM — `APP-013`
- Rien n'est dessiné dans la zone tapis et tout s'efface tête baissée — `APP-001`
- Les trois plateformes montrent les mêmes arbres, lampadaires et mobilier — `APP-015`
- La rue paraît composée et crédible à hauteur d'homme [human] — `APP-013`

## Contrats modifiés

- `APP-009` — critère d'origine : « le mobilier OSM n'est jamais inventé, seuls lampadaires et arbres sont produits par
  règle » — raison : la recette accepte du mobilier d'appoint produit par règle, distingué des éléments relevés par le champ
  d'origine (approuvé le 2026-11-07)

## 2. Hors périmètre

- Le choix des essences et la végétation régionale (`docs/projects/gen-07-vegetation-regionale.md`).
- La ville vivante : véhicules et piétons (`APP-014`).
- Les sols, rez-de-chaussée et façades.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`) : `app/src/city/lamp-rule.ts` (118 lignes) ne peut pas absorber toutes les règles ;
  couverture à 100 % (`QUA-004`).
- Règles et paramètres **en données** par région, avec valeurs de repli ; aucun code propre à une ville ; un seul moteur ;
  mêmes contenus sur Quest, PC et tablette (`APP-015`).
- Champ **origine** : relevé OSM ou ajouté par règle, relu par les preuves.
- Budget mesuré (génération de 25 à 130 ms au chargement ; appels de rendu), sans plafond d'avance.
- Repli quand une donnée manque : pas de voie, pas de classe `highway`, pas de graine.

## 4. Décisions

- 2026-11-07 : règles de placement **en données**, paramètres régionaux et exceptions en données (recette, intention).
- 2026-11-04 : le mobilier OSM n'est jamais inventé (`APP-009`) ; seuls lampadaires et arbres sont produits par règle.

- 2026-11-07 : le mobilier d'appoint (bancs, poubelles) peut être **produit par règle** ; `APP-009` est modifié en
  conséquence (voir « Contrats modifiés »).
- 2026-11-07 : **une seule réextraction OSM** pour tous les nouveaux champs, faite par le premier des chantiers
  `gen-03`, `gen-04`, `gen-06`, `gen-10` lancé.

## 5. Points à décider

- [decision] Refuser un mât à moins d'une demi-chaussée d'une autre voie, au prix d'un calcul de plus au chargement ?
- [decision] Faut-il des lampadaires **aux** carrefours (un par carrefour) en plus de l'intervalle le long des voies ?
- [decision] Ajouter `highway=stop|give_way` à `PROP_NODES` ou le retirer de la lecture (aucun nœud dans les quatre emprises) ?
- [decision] Génération au chargement ou une fois à la préparation de l'extrait ?

## 6. Incréments

- **Incrément 1 — trancher et mesurer** [human] : points 1 à 5, durée de génération au casque. Sortie : décisions notées en section 4.
- **Incrément 2 — dégagement aux carrefours et accès** [AI] : règle de refus, tests de croisement et d'accès.
  Sortie : tests verts, `APP-013` passe.
- **Incrément 3 — alignement des arbres** [AI] : règle de voie, espacement, origine en données. Sortie : tests verts, `APP-001` et `APP-015` passent.
- **Incrément 4 — requête d'extraction** [AI] : alignement lecture et requête, nouvelle extraction hors casque seulement si demandée. Sortie : tests verts.
- **Incrément 5 — promenade au casque** [human] : rue composée et crédible. Sortie : contrat `[human]` attesté.

## 7. Reprise

- **Dernier état (2026-11-07)**: cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] trancher les points de la section 5.
