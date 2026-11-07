# Chantier : eau et paysage — mer, quais, berges, parcs, horizon

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (rang 5, « Eau et paysage » ; fiche d'ensemble `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/scripts/extract-souq.ts
  - app/scripts/osm-tags.ts
  - app/src/city/souq-data.ts
  - app/src/city/souq.ts
  - app/src/city/souq.test.ts
  - app/src/city/souq-data.test.ts
  - app/src/city/vegetation.ts
  - app/src/city/vegetation.test.ts
  - app/src/city/region-palette.ts
  - app/src/safety/visibility.ts
  - app/src/safety/visibility.test.ts
  - app/e2e/ville-riche.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

La Corniche de Doha longe la mer ; aujourd'hui rien n'y représente l'eau. L'itinéraire lui-même est décrit dans
`docs/projects/corniche-west-bay.md` (non repris ici). Le besoin : lire l'eau dans OpenStreetMap et la poser **par règle** —
mer, quais, berges, parcs — avec un horizon adapté, pour toute ville qui en porte.

**Existant** (vérifié le 2026-11-07) : **aucun module dédié à l'eau**. `app/scripts/osm-tags.ts` ne lit que `natural=wood|scrub|
grassland`, `landuse` et `leisure` (surfaces vertes, `app/src/city/vegetation.ts`) ; aucune balise `natural=water`, `natural=coastline`,
`waterway` ni `place=sea` n'est extraite. **Manque** : extraction de l'eau, maillage d'eau, quais et berges, horizon.

## Critères d'acceptation

- L'eau vient de l'extrait OpenStreetMap embarqué, avec attribution, et porte son champ « origine » — `APP-003`
- L'eau ne cache jamais le réel visible : pas de plan d'eau devant le tapis, la zone de marche ou la vue du sol réel ;
  elle s'efface comme la ville tête baissée — `APP-001`
- Un horizon adapté (Corniche) ne pose aucun ciel opaque ni voile au-delà du plafond de brouillard — `APP-001`
- Les parcs et berges se posent par règle sur la donnée de la ville, sans code propre à une ville — `APP-003`
- Sans donnée d'eau, la ville se rend comme aujourd'hui, sans erreur — `APP-003`
- Le rendu de l'eau est jugé crédible au bord de la Corniche, sur le casque [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Le tracé, la boucle et le départ de la Corniche : `docs/projects/corniche-west-bay.md`.
- Reflets, vagues animées, météo : `docs/projects/gen-13-effets-ambiance.md`.
- Relief et niveaux de détail : `docs/projects/rendu-lod-cellules.md`.
- Sons de bord de mer : `docs/projects/gen-11-vie-pietons-sons.md`.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`) ; un nouveau module d'eau est séparé.
- Tout est donnée par ville ou région, jamais du code propre à une ville ; un seul moteur ; mêmes contenus sur Quest, PC et
  tablette (`APP-015`).
- Champ « origine » (relevé OSM ou ajouté par règle, p. ex. quai déduit).
- Pas de plafond chiffré : poids de l'extrait et appels de rendu mesurés à chaque incrément ; les quatre extraits sont
  réextraits (boucles toujours valides, test des sommets).
- Repli quand une donnée manque : pas d'eau, rien d'inventé.

## 4. Décisions

- 2026-11-07 : l'eau et les quais entrent dans la recette (rang 5) ; l'extraction lit l'eau dans OpenStreetMap.
- 2026-11-03 (déjà en vigueur, `APP-011`) : aucun ciel virtuel opaque ; le réel reste visible.

- 2026-11-07 : **une seule réextraction OSM** pour tous les nouveaux champs, faite par le premier des chantiers
  `gen-03`, `gen-04`, `gen-06`, `gen-10` lancé.

## 5. Points à décider

- [decision] Forme de l'eau : plan plat teinté, ou bande de rive seulement ; quelle couleur par région.
- [decision] L'eau au loin : tronquée à une distance, ou fondue dans le brouillard plafonné.
- [decision] Quais et berges : lus dans OSM (`man_made=pier`, `natural=beach`…) ou ajoutés par règle autour de l'eau.

## 6. Incréments

1. **Extraction de l'eau** [AI] : balises, champ d'origine, poids mesuré, boucles valides. Sortie : tests verts.
2. **Module d'eau et repli** [AI] : maillage par règle, sans donnée rien. Sortie : tests verts, `APP-003`.
3. **Sécurité-visibilité** [AI] : l'eau s'efface, jamais devant le réel. Sortie : tests verts, `APP-001`.
4. **Quais, berges, parcs, horizon** [AI] : règles et paramètres de région. Sortie : tests verts, e2e.
5. **Jugement au casque** [human] : Corniche, cadence. Sortie : verdict noté.

## 7. Reprise

- **Dernier état (2026-11-07)** : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] trancher les points de la section 5, puis passer la maturité à « prêt ».
