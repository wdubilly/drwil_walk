# Chantier : catalogue — régénérer les quatre itinéraires par la commande, puis ajouter des villes

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (rang 6, « Catalogue » ; fiche d'ensemble `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/data/villes.json
  - app/data/doha-corniche.json
  - app/data/doha-corniche-boucle.json
  - app/data/pune-fc-road.json
  - app/data/pune-fc-road-boucle.json
  - app/data/pune-vieille-ville.json
  - app/data/pune-vieille-ville-boucle.json
  - app/data/souq-waqif.json
  - app/data/souq-waqif-boucle.json
  - app/assets/materials/rome.json
  - app/assets/materials/rome-photos.json
  - app/scripts/create-city.ts
  - app/scripts/cities.ts
  - app/src/city/cities.ts
  - app/src/city/catalogue-villes.test.ts
  - app/src/city/create-city.test.ts
  - app/src/route/itineraries.test.ts
  - app/e2e/chemins-critiques.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Dernier maillon du générateur : prouver que **la seule commande** `npm run city -- <identifiant>` produit une ville complète,
d'abord en régénérant les quatre itinéraires existants (Souq Waqif, Doha Corniche, Pune Vieille ville, Pune FC Road), puis en
ajoutant de nouvelles villes (`docs/intentions/villes-a-parcourir.md` ; le chantier existant `docs/projects/villes-itineraires.md`
est cité, non dupliqué).

**Existant** (vérifié le 2026-11-07) : la commande, l'inscription automatique à l'accueil, `app/data/villes.json` (pune, fc-road…),
et `app/src/city/catalogue-villes.test.ts`, qui joue déjà des tests sur chaque entrée de `CATALOG` (extrait, attribution,
région, palette, boucle). **Manque** : les boucles des quatre villes sont celles versionnées, pas celles de la commande ; le
bloc 6 de la fiche d'ensemble (tests communs de **tous** les contrats) n'est couvert qu'en partie ; aucune ville nouvelle.

**Dépend de** `docs/projects/gen-09-reperes-monuments.md`, `gen-10-eau-paysage.md`, `gen-11-vie-pietons-sons.md` et des fiches
gen-01 à gen-08 : la régénération doit appliquer tous les composants de la recette.

## Critères d'acceptation

- Chaque itinéraire existant est régénéré par la commande seule ; sa boucle rejouée remplace la boucle versionnée, et
  chaque point de la boucle reste un sommet d'une voie de l'extrait — `APP-002`
- Les bâtiments de chaque ville viennent de l'extrait OpenStreetMap embarqué, attribué, avec le champ « origine » — `APP-003`
- Une ville ajoutée au catalogue passe les tests communs sans une ligne de test en plus, et sans fichier de code modifié — `APP-003`
- Chaque ville montre les mêmes contenus sur casque, PC et tablette — `APP-015`
- Le poids des extraits est mesuré et reporté ; le plafond de test est relu, non imposé d'avance — `APP-003`
- Chaque ville régénérée est jugée reconnaissable et complète au casque [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Les composants eux-mêmes (repères, eau, vie, effets) : fiches gen-09 à gen-13 ; relief : `docs/projects/rendu-lod-cellules.md`.
- Le jugement au casque détaillé, reporté dans une intention (décision du 2026-11-05).
- La génération dans l'appli, sans commande (intention à part).
- Le tracé de l'itinéraire de la Corniche : `docs/projects/corniche-west-bay.md`.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par ville ou région, jamais du code propre à une ville ; un seul moteur ; mêmes contenus sur Quest, PC et
  tablette (`APP-015`).
- Champ « origine » conservé dans les données régénérées (relevé OSM ou photo, ou ajouté par règle).
- Pas de plafond chiffré imposé : poids des données et appels de rendu mesurés par ville.
- Repli quand une donnée manque : palette de repli, région `ailleurs` (acceptées le 2026-11-05).

## 4. Décisions

- 2026-11-05 : les quatre quartiers sont régénérés par la commande, **leurs boucles rejouées remplacent** les versionnées ;
  aucune mise en conformité à la main.
- 2026-11-05 : une ville est complète avec la palette de repli et la ville vivante `ailleurs`.
- 2026-11-05 : la génération reste la commande sur le PC de développement.

## 5. Points à décider

- [decision] Quelles villes ajouter, dans quel ordre (Rome, Erevan, Paris… `docs/intentions/villes-a-parcourir.md`).
- [decision] Plafond de poids des extraits à relire après mesure, une fois les nouveaux champs ajoutés.
- [human] Lancer la commande contre les vrais services (`docs/intentions/essai-commande-creation-reseau.md`).

## 6. Incréments

1. **Essai réseau de la commande** [human] : un parcours réel. Sortie : verdict noté.
2. **Régénération des quatre itinéraires** [AI] : boucles rejouées, tests verts. Sortie : tests verts, `APP-002`.
3. **Tests communs sur tout le catalogue** [AI] : contrats rejoués par entrée. Sortie : tests verts, `APP-015`.
4. **Ajout d'une ville par la commande** [AI] : aucun code modifié. Sortie : tests verts, `APP-003`.
5. **Jugement au casque** [human] : chaque ville. Sortie : verdict noté.

## 7. Reprise

- **Dernier état (2026-11-07)** : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] attendre gen-01 à gen-11 et trancher la section 5.
