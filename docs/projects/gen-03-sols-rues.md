# Chantier : sols et rues par règle

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (fiche d'ensemble `docs/intentions/generateur-ville-complet.md` ; reliée : `docs/intentions/rendu-rues-mobilier.md`)

<!-- scope
files:
  - app/src/city/roads.ts
  - app/src/city/markings.ts
  - app/src/city/walkways.ts
  - app/src/city/roads.test.ts
  - app/src/city/markings.test.ts
  - app/src/city/walkways.test.ts
  - app/scripts/osm-tags.ts
  - app/scripts/extract-souq.ts
  - app/src/city/souq-data.ts
  - app/src/city/souq-data.test.ts
  - app/src/city/souq.ts
  - app/src/city/region-palette.ts
  - app/src/city/region-palette.test.ts
  - app/src/city/extract-souq.test.ts
  - app/assets/recette-regions.json
  - app/e2e/mobilier-urbain.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Des sols crédibles à hauteur d'homme : pavés, asphalte, bordures cohérentes, états de surface (usé, sec, poussiéreux),
choisis **par règle** selon la région et les balises de voie OSM (`surface`, `highway`), pas par ville.

Existant (lu le 2026-11-07) : les voies sont dessinées sur le sol avec une largeur et une clarté par type de `highway`
(`app/src/city/roads.ts`), les trottoirs et passages en `app/src/city/walkways.ts`, les bordures et lignes d'arrêt en `app/src/city/markings.ts`
(`APP-009`). Le matériau d'une voie ne dépend ni de la région ni de la balise `surface` ; les pavés, caniveaux et rampes
ne sont pas traités (`docs/intentions/rendu-rues-mobilier.md`). Manque aussi : les données `surface` dans les extraits
(à vérifier dans `app/scripts/osm-tags.ts`).

## Critères d'acceptation

- Le revêtement d'une voie suit une règle (balise `surface` si relevée, sinon valeur de la région) — `APP-009`
- Les bordures restent cohérentes avec les trottoirs et passages, sans raccord flottant ni géométrie invalide — `APP-009`
- Une balise absente donne la valeur de repli de la région, jamais un élément inventé présenté comme relevé — `APP-009`
- Le rendu est reproductible : mêmes données, mêmes sols — `APP-013`
- Les sols s'effacent avec la ville tête baissée — `APP-001`
- Quest, PC et tablette montrent les mêmes sols — `APP-015`
- Le profil « performance » règle la densité des détails sans toucher à la sécurité — `APP-006`
- Les sols du souk et de Pune Vieille ville se reconnaissent d'emblée au casque [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Mobilier, arbres et lampadaires (placement : chantier suivant du rang 3) ; arrêts de bus et barrières.
- Eau, quais et relief (rang 5).
- Le format de la recette (`gen-02`), supposé disponible ; sans lui, des valeurs régionales restent en repli.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par ville/région, jamais code propre à une ville ; un seul moteur ; mêmes contenus sur trois
  plateformes (`APP-015`).
- Champ « origine » : relevé OSM (`surface`) ou ajouté par règle ; la preuve le relit.
- Budget mesuré (poids, appels de rendu, un seul maillage de voies), sans plafond chiffré.
- Repli quand une donnée manque : valeur de la région, puis `ailleurs`.

## 4. Décisions

- 2026-11-07 : les sols viennent après le format de la recette et appliquent ses valeurs de région.
- 2026-11-07 : budget mesuré, sans plafond d'avance.
- 2026-11-03 : mobilier courant généré par code ; passages, lampadaires et bancs d'abord (`docs/intentions/rendu-rues-mobilier.md`).

- 2026-11-07 : les sols sont en **textures dès le début** (pas de couleurs par sommet) ; leur poids reste mesuré et ils
  s'effacent comme la ville (`APP-001`, bornes de `APP-012` à relire).
- 2026-11-07 : **une seule réextraction OSM** pour tous les nouveaux champs (`surface`, `shop`/`amenity`, `highway=stop`,
  eau), faite par un des chantiers `gen-03`, `gen-04`, `gen-06`, `gen-10`, le premier lancé.
- 2026-11-11 : états retenus d'abord : usé (plus foncé) et poussiéreux (plus clair), une variation de clarté déterministe par voie ; « mouillé » reste à décider (il suppose la météo, `gen-13`).

## 5. Points à décider

## 6. Incréments

- **Incrément 1 — lecture des données de sol** [AI] : balise `surface` et repli régional dans les types de voie. Sortie :
  tests verts, couverture 100 %.
- **Incrément 2 — pavés et asphalte par règle** [AI] : revêtement selon région et balise, bordures raccordées. Sortie :
  tests verts, e2e `mobilier-urbain` vert.
- **Incrément 3 — états de surface** [AI] : variations déterministes. Sortie : tests de reproductibilité verts, mesure
  des appels de rendu relevée.
- **Incrément 4 — jugement au casque** [human] : souk et Pune Vieille ville. Sortie : verdict noté dans la fiche.

## 7. Reprise

- **Dernier état** (2026-11-11) : lots 1 à 3 faits (lecture de `surface`, repli `sols` de la recette, teinte par revêtement, usure déterministe).
  Les extraits figés n'ont pas encore la balise `surface` : l'extraction la porte, mais la réextraction OSM (réseau) n'est pas faite, donc
  le repli régional s'applique partout aujourd'hui.
- **Travail non commité** : aucun après le commit du lot 3.
- **Prochaine étape** : réextraction OSM des quatre itinéraires (une seule pour `gen-03`, `gen-04`, `gen-06`, `gen-10`) ; lot 4 [human] : jugement au casque.
