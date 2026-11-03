# Intention : des lampadaires produits par règle le long des rues, faute de données OpenStreetMap

**Statut** : proposée le 2026-11-03.

## Besoin

Les quatre quartiers n'ont aucun lampadaire, et une réextraction n'y changera rien : `highway=street_lamp` était déjà
demandé le 2026-10-31 et OpenStreetMap n'en porte aucun à Pune ni à Doha sur ces emprises. Une rue sans le moindre mât
paraît vide, de jour comme à la tombée du soir.

Le demandeur veut donc des lampadaires **produits par règle**, posés intelligemment le long des rues, avec cinq exigences
posées le 2026-11-03 :

- pas d'espacement mécanique uniforme partout ;
- une densité adaptée au type de rue et à son environnement ;
- éviter les trottoirs trop étroits, les bâtiments et les obstacles ;
- une cohérence visuelle pendant toute la promenade ;
- distinguer les objets produits par règle de ceux réellement issus d'OpenStreetMap.

## Existant

Lu le 2026-11-03.

- `app/src/city/souq-data.ts` : un `Prop` est `{ kind, at }` — **rien ne dit d'où vient l'objet**. C'est le manque à combler
  pour tenir la cinquième exigence.
- `app/src/city/props.ts` : `buildFurniture` garde les `MAX_FURNITURE = 400` objets les plus proches du parcours et les
  fusionne en **un seul maillage**. `routeYaw` donne déjà le cap de la rue à l'endroit d'un objet.
- `app/src/city/furniture.ts` : le modèle de lampadaire existe (socle, mât de 4,5 m, bras, lanterne), **72 triangles**
  (deux cylindres à six côtés, deux boîtes).
- `app/src/city/souq-data.ts` : chaque voie porte sa classe OpenStreetMap (`highway`) et son tracé en mètres locaux — de
  quoi décider une densité par type de rue.
- Relevé du 2026-11-03 : lampadaires 0 partout ; bancs 19 au Souq Waqif, 8 à la Corniche ; poubelles 0 partout.

## Stratégie de placement proposée

Présentée au demandeur le 2026-11-03, avant tout code.

1. **Une densité par classe de rue, pas un pas unique.** L'intervalle de base vient du `highway` : voie passante tous les
   25 à 30 m, rue de quartier tous les 35 à 40 m, ruelle de souq tous les 15 à 20 m. C'est la configuration de la rue qui
   décide, jamais une constante globale.
2. **Une irrégularité reproductible.** Chaque intervalle est décalé d'un bruit de ±20 %, tiré d'une graine dérivée de
   l'identifiant OpenStreetMap de la voie — la même méthode que les façades procédurales (`APP-008`). L'alignement n'est
   jamais mécanique, et le même quartier donne toujours la même ville : sans graine stable, les lampadaires sauteraient
   d'une promenade à l'autre, ce qui ruinerait la cohérence visuelle demandée.
3. **Un côté de rue choisi, pas alterné objet par objet.** Le mât se pose en retrait du bord de chaussée, du côté où il y a
   de la place ; l'alternance se fait par tronçon, pour éviter l'effet de zigzag.
4. **Trois refus, dans cet ordre.** Un candidat est écarté s'il tombe à moins d'une distance minimale d'une emprise de
   bâtiment, sur un trottoir plus étroit que le socle plus une marge de passage, ou à moins de 2 m d'un objet déjà posé.
   Les objets d'OpenStreetMap sont posés **en premier** et ne sont jamais déplacés : le réel prime sur le produit par règle.

**Distinguer le produit du réel** : ajouter un champ `source: "osm" | "generated"` sur `Prop`. Il sert à trois choses — ne
jamais écraser un objet réel, pouvoir éteindre les lampadaires produits d'un réglage, et permettre un relevé chiffré
(combien d'objets viennent d'OSM, combien sont inventés), ce que `APP-003` demande puisque la ville reste attribuable à
OpenStreetMap.

## Conséquences sur le Quest 3

Chiffrées contre les budgets provisoires de `docs/projects/rendu-lod-cellules.md` (150 appels de rendu, 500 000 triangles).

- **Triangles** : 72 par lampadaire. Même 300 lampadaires pèsent environ 21 600 triangles, soit **4 % du budget**.
- **Appels de rendu** : **aucun en plus**. Tout est fusionné dans le maillage « mobilier » qui existe déjà.
- **Le vrai risque est ailleurs** : le plafond de `MAX_FURNITURE = 400` est **partagé**. Si les lampadaires produits entrent
  dans le même tri « les plus proches du parcours », ils évinceront des bancs et des poubelles réels. Il faut donc un
  plafond séparé pour les objets produits, afin que le mobilier d'OpenStreetMap ne soit jamais sacrifié à du mobilier
  inventé.
- **Hors périmètre** : un lampadaire **qui éclaire** (une source lumineuse par mât) coûte bien plus cher qu'un objet posé.
  Cela relève de `docs/intentions/rendu-eclairage-ambiance.md`, pas d'ici.

Ces chiffres sont calculés, jamais mesurés au casque : ils valent d'être confirmés pendant la séance
(`docs/intentions/seance-casque-parcours.md`).

## Questions à trancher

- Les intervalles proposés (25-30 m, 35-40 m, 15-20 m) tiennent-ils devant les yeux, ou se jugent-ils seulement au casque ?
- Le champ `source` doit-il apparaître dans les fichiers `app/data/*.json`, ou rester calculé au chargement ?
- La même règle servira-t-elle plus tard à d'autres objets absents d'OSM (poubelles, panneaux), ou reste-t-elle propre aux
  lampadaires ?

## Décisions

- 2026-11-03 : **plafond séparé des objets produits par règle, réglé par profil graphique** (`app/src/render/profiles.ts`),
  comme les arbres et le mobilier. Le mobilier réellement issu d'OpenStreetMap n'est jamais évincé par du mobilier inventé.
- 2026-11-03 : les lampadaires produits sont **visibles par défaut**, avec **un réglage pour les éteindre** et ne garder que
  les objets réels.

## Cadrée

Cette intention est cadrée en fiche : `docs/projects/lampadaires-generes.md` (2026-11-03).
