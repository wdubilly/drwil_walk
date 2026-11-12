# Chantier : rez-de-chaussée par règle

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (fiche d'ensemble `docs/intentions/generateur-ville-complet.md` ; reliées : `docs/intentions/rendu-facades-batiments.md`, `docs/intentions/facades-textures-monuments.md`)

<!-- scope
files:
  - app/src/city/facades.ts
  - app/src/city/facade-parts.ts
  - app/src/city/facade-plan.ts
  - app/src/city/facades.test.ts
  - app/src/city/facade-parts.test.ts
  - app/src/city/facade-plan.test.ts
  - app/src/city/facades-data.test.ts
  - app/e2e/facades-batiments.test.ts
  - app/src/city/shop-awning.ts
  - app/src/city/shop-awning.test.ts
  - app/src/city/shop-rules.ts
  - app/src/city/shop-rules.test.ts
  - app/scripts/osm-tags.ts
  - app/scripts/extract-souq.ts
  - app/src/city/extract-souq.test.ts
  - app/src/city/souq-data.ts
  - app/src/city/souq-data.test.ts
  - app/data/doha-corniche.json
  - app/data/pune-fc-road.json
  - app/data/pune-vieille-ville.json
  - app/data/rome.json
  - app/data/souq-waqif.json
  - docs/projects/journal.md
  - docs/intentions/recette-visuelle-promenade.md
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Des rez-de-chaussée lisibles à hauteur d'homme : boutiques, vitrines, portes, auvents, choisis **par règle** selon la
région et l'usage OSM du bâtiment, pour que la rue ait un visage de quartier.

Existant (lu le 2026-11-07) : une vitrine plus large que la fenêtre et sans volet remplace la fenêtre du rez-de-chaussée
quand le bâtiment est un commerce (`SHOP_KINDS`) ou, en famille « récente », par un tirage (`app/src/city/facade-plan.ts`,
`app/src/city/facade-parts.ts`) ; une porte à teinte de palette, emplacement variable. Manque : auvents, enseignes, types de
boutique selon l'usage, largeur d'entrée selon la région, portes de rue propres à une région ; les extraits ne portent pas
toujours `building` ni l'usage (`docs/intentions/rendu-facades-batiments.md`). Les textures et monuments glTF sont hors de ce chantier
(`docs/intentions/facades-textures-monuments.md`).

## Critères d'acceptation

- Le rez-de-chaussée d'un commerce a vitrine, porte et auvent selon la règle de sa région — `APP-008`
- Deux rez-de-chaussée voisins ne sont jamais identiques et le tirage reste déterministe — `APP-008`
- Les façades restent légères : plafond de triangles respecté, réglé par le profil graphique — `APP-008`
- Sans balise d'usage ou de hauteur, la valeur de repli de la région s'applique, sans géométrie invalide — `APP-008`
- Les rez-de-chaussée s'effacent avec la ville tête baissée [human] — `APP-001`
- Les mêmes rez-de-chaussée sur Quest, PC et tablette — `APP-015`
- Les boutiques ajoutées par règle sont distinguées des commerces relevés dans les données — `APP-013`
- Les rues commerçantes du souk et de Pune Vieille ville se reconnaissent d'emblée au casque [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Les textures de façade et les monuments glTF (`docs/intentions/facades-textures-monuments.md`).
- Les étages supérieurs, balcons et toits (livrés par `APP-008`).
- Les enseignes lisibles (texte) : non décidées, hors rez-de-chaussée par règle.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`) : `app/src/city/facade-parts.ts` fait 131 lignes, les auvents iront dans un
  nouveau fichier. Couverture à 100 % (`QUA-004`).
- Tout est donnée par ville/région, jamais code propre à une ville ; un seul moteur ; mêmes contenus sur trois
  plateformes (`APP-015`).
- Champ « origine » : usage relevé OSM ou ajouté par règle ; la preuve le relit.
- Budget mesuré (triangles par façade, appels de rendu), sans plafond chiffré imposé.
- Repli quand une donnée manque : région, puis `ailleurs`.

## 4. Décisions

- 2026-11-03 : façades en couleurs par sommet, sans texture (décision du demandeur).
- 2026-11-07 : le rez-de-chaussée vient après le format de la recette (`gen-02`) et lit ses valeurs de région.
- 2026-11-07 : budget mesuré, sans plafond d'avance.

- 2026-11-07 : **une seule réextraction OSM** pour tous les nouveaux champs, faite par le premier des chantiers
  `gen-03`, `gen-04`, `gen-06`, `gen-10` lancé.

- 2026-11-12 (demandeur) : les boutiques sont pilotées par `shop`, `amenity` (commerces, cafés, restaurants) et `building=retail/commercial` ;
  l'extraction garde donc l'usage (réextraction des cinq extraits).
- 2026-11-12 (demandeur) : usage inconnu en zone dense : une boutique est ajoutée par règle, marquée « règle » (APP-013).
- 2026-11-12 : pas de captures de référence disponibles ; formes simples par région (auvent plat, store incliné, arcade),
  jugées au casque à l'incrément 4.

## 5. Points à décider

*(aucun : tranchés le 2026-11-12, voir section 4)*

## 6. Incréments

- **Incrément 1 — usage et repli dans le plan de façade** [AI] : lecture de l'usage, valeurs de la région. Sortie :
  tests verts, couverture 100 %.
- **Incrément 2 — vitrines, portes et auvents par règle** [AI] : nouvelle pièce d'auvent, plafond respecté. Sortie :
  tests verts, e2e `facades-batiments` vert.
- **Incrément 3 — origine et mesure** [AI] : champ d'origine relu par une preuve ; triangles et appels relevés. Sortie :
  tests verts, mesure notée dans la fiche.
- **Incrément 4 — jugement au casque** [human] : souk et Pune Vieille ville. Sortie : verdict noté dans la fiche.

## 7. Reprise

- **Dernier état** (2026-11-12) : lots 1 à 3 faits et committés (usage OSM, boutiques par règle, auvents, origine relue, mesure au journal).
- **Travail non commité** : journal, intention et cette fiche.
- **Prochaine étape** : clôture ; lot 4 [human] (jugement au casque) à faire par le demandeur.
