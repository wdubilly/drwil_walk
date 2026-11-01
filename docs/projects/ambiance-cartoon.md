# Chantier : une ville d'ambiance cartoon (matériau toon, routes, arbres du pack Quaternius)

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-ville.md`

<!-- scope
files:
  - app/src/city/*
  - app/assets/*
  - app/scripts/prepare-nature-pack.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/xr/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/vite.config.ts
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Le premier essai sur un vrai Quest 3 a jugé le rendu OpenStreetMap « mono-orange, formes plates » ; le rendu Google 3D est
inaccessible depuis la France (403, facturation de l'EEA : `docs/intentions/google-3d-tiles.md`). Le demandeur veut une
**ambiance un peu cartoon**, lisible et agréable à parcourir, sans quitter OpenStreetMap : un matériau toon à paliers de
couleur sur les bâtiments et les routes, des routes plus lisibles, et des arbres stylisés tirés d'un pack libre. Ce chantier
**remplace** `rendu-textures-pilote` (textures photo semi-réalistes), retiré au cadrage : une seule direction visuelle.

## Critères d'acceptation

- Les bâtiments, les routes et le sol sont rendus avec un matériau toon à paliers de couleur ; les teintes OSM, la palette
  de l'itinéraire et l'ombrage vers le pied restent lisibles — `APP-003`
- Chaque classe de voie a sa couleur et une bordure plus claire, et une ligne centrale marque les voies assez larges ; la
  géométrie des voies ne change pas — `APP-003`
- Les façades portent un motif de fenêtres répété, dessiné sans texture photo ni modèle 3D, sans ajouter de maillage — `APP-003`
- Les arbres sont les modèles du pack Quaternius « Stylized Nature MegaKit » (version Standard, CC0), choisis de façon
  déterministe parmi quelques variantes, dessinés en instances, dans le plafond d'arbres existant et sous un plafond de
  triangles testé — `APP-003`
- La provenance du pack (nom, adresse, version, date de téléchargement, licence CC0, fichiers retenus) est écrite dans le
  dépôt, à côté des fichiers — `APP-003`
- Un modèle qui ne se charge pas est dit à l'écran et la marche continue avec l'arbre procédural actuel — `QUA-002`
- Tout ce qui s'ajoute est dans le groupe de la ville : effacé par le fondu tête baissée, découpé par la zone tapis (la
  mention d'attribution reste exemptée) ; aucun ciel ni fond opaque, la session reste `immersive-ar` — `APP-001`
- Les contours des bâtiments se choisissent à l'accueil, désactivés par défaut tant que la cadence n'est pas mesurée au
  casque ; sans contours, le rendu est celui du matériau toon seul — `QUA-020`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé, avec et sans contours — `QUA-020`
- La cadence de 72 images par seconde ou plus, le style (lisibilité, contours) et le tapis resté visible sont jugés sur un
  vrai Quest 3 [human] — `APP-001`

## Contrats modifiés

- `APP-003` — les bâtiments viennent de l'extrait OpenStreetMap avec leur attribution, et les arbres de l'extrait sont
  dessinés avec les modèles d'un pack CC0 embarqué dans le dépôt, dont la provenance est écrite ; la règle de l'attribution
  OpenStreetMap et l'absence d'appel réseau dans le casque ne changent pas (à approuver à la validation de cette fiche).
- `QUA-020` — chemins e2e à jour pour le rendu cartoon, avec et sans contours.

## 2. Hors périmètre

- Les textures photo, les trois profils graphiques et la comparaison A/B de `rendu-textures-pilote` (retiré).
- Placer de l'herbe, des plantes, des haies ou des rochers du pack à partir de l'occupation du sol OSM : c'est le sol de
  `docs/projects/rendu-ville-riche.md`, qui pourra réutiliser les modèles du pack.
- Teinter les bâtiments par type (église, mosquée, commerce) : cela exige de relancer les extractions Overpass
  (`docs/intentions/rendu-ville.md`).
- Le mobilier urbain : il existe déjà en procédural (`app/src/city/props.ts`) et aucun pack n'a été trouvé.
- Les monuments modélisés à la main, les voitures, les silhouettes : reporté.
- Un ciel, un soleil, une brume ou tout fond opaque (`APP-001`) ; le rendu Google 3D ne change pas.
- Les normal maps, la compression GPU KTX2 et Draco : à décider après la mesure au casque.

## 3. Contraintes

- Tenir 72 images par seconde : peu de matériaux, maillages fusionnés, arbres en instances, nombre de triangles par arbre
  et total plafonné ; les contours (dessin en plus) limités aux bâtiments proches et désactivés par défaut.
- `APP-001` ne régresse pas : rien de ce chantier ne masque le tapis, tout est fondu et découpé comme la ville.
- Poids du dépôt : les modèles retenus sont peu nombreux et allégés, de l'ordre du méga-octet au total.
- Les modèles sont embarqués dans le dépôt : aucun appel réseau dans le casque (`APP-003`). Le téléchargement du pack
  Standard a lieu une seule fois, au lot 1, depuis le site de l'éditeur, et sa licence est relue sur la page du pack.
- La version Standard n'est gratuite qu'en partie : si elle ne contient aucun arbre utilisable, l'agent s'arrête et le dit,
  il n'achète rien et n'utilise aucune autre source.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun secret dans le dépôt (`SEC-007`).

## 4. Décisions

- 2026-11-01, décisions humaines du demandeur : ambiance cartoon ; pack Quaternius « Stylized Nature MegaKit » (version
  Standard, CC0) pour la végétation ; bâtiments et routes restent générés par le code, avec un matériau toon ; ce chantier
  remplace `rendu-textures-pilote`.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : nombre de paliers du matériau
  toon, palette, technique des contours, modèles d'arbres retenus, plafonds de triangles, forme du motif de fenêtres.
- À lancer avant `rendu-ville-riche` et `corniche-west-bay` : les trois touchent `app/src/city/`, jamais en même temps.
- Contrats concernés : `APP-001`, `APP-003`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`, `SEC-007`.

## 5. Points à trancher

*(aucun : les contours restent désactivés par défaut jusqu'à la mesure au casque, qui rouvre la question)*

## 6. Lots

- **Lot 1 — pack et provenance** [AI] : télécharger le pack Standard, relire sa licence, retenir quelques arbres, les alléger,
  écrire la provenance. Sortie : fichiers du pack dans le nouveau dossier des ressources de l'app, tests verts.
- **Lot 2 — matériau toon et palette** [AI] : matériau à paliers pour bâtiments, routes et sol, teintes OSM conservées.
  Sortie : `run-checks` vert.
- **Lot 3 — routes** [AI] : couleur par classe de voie, bordures, ligne centrale. Sortie : `run-checks` vert.
- **Lot 4 — arbres du pack** [AI] : chargement, repli sur l'arbre procédural, instances, plafonds, fondu et zone. Sortie :
  `run-checks` vert.
- **Lot 5 — fenêtres et contours** [AI] : motif de fenêtres, contours en option à l'accueil. Sortie : `run-checks` vert.
- **Lot 6 — e2e et doc** [AI] : e2e avec et sans contours, docs, contrats à jour. Sortie : CI verte.
- **Lot 7 — essai réel** [human] : juger le style, la cadence de 72 images par seconde et le tapis visible sur le Quest 3,
  décider du défaut des contours.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code, aucun téléchargement.
- **Travail non commité** : la fiche, sur la branche `cadrage/ambiance-cartoon`.
- **Prochaine étape** : [AI] lot 1.
