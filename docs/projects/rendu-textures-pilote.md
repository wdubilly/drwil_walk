# Chantier : un rendu texturé pilote sur le souk de Doha

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt

<!-- scope
files:
  - app/src/city/*
  - app/src/city/buildings.test.ts
  - app/src/city/roads.test.ts
  - app/src/city/souq.test.ts
  - app/src/city/textures.ts
  - app/src/city/textures.test.ts
  - app/src/ui/profile-choice.ts
  - app/src/ui/profile-choice.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/xr/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/assets/*
  - app/vite.config.ts
  - app/vite.config.test.ts
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

Le rendu OpenStreetMap est teinté et ombré mais reste fait de surfaces unies. Le demandeur veut un rendu semi-réaliste à
hauteur d'homme, **par des textures plutôt que par des polygones**, sans alourdir la géométrie ni compromettre les 72 images
par seconde. Ce chantier est un pilote sur le souk de Doha : façades avec fenêtres, asphalte avec marquages, sol, avec trois
profils graphiques et une comparaison A/B.

## Critères d'acceptation

- Les façades, la route et le sol du souk portent des textures répétables à échelle métrique : les fenêtres se répètent à
  chaque étage, les marquages suivent la route — `APP-003`
- Les textures multiplient la couleur par sommet existante : les tons de palette, les teintes OSM et l'ombrage vers le pied
  restent visibles — `APP-003`
- Trois profils se choisissent à l'accueil : « Économique » (le rendu actuel, sans texture, strictement inchangé),
  « Équilibré » (façades et route) et « Détaillé » (façades, route, sol et toits) — `APP-003`
- Le profil « Économique » est le défaut tant que la cadence n'est pas mesurée au casque — `QUA-020`
- Les textures sont fondues par le fondu tête baissée comme la ville, et aucun ciel ni fond opaque n'est ajouté ; la session
  reste `immersive-ar` — `APP-001`
- Le nombre d'appels de dessin et de textures reste sous un plafond testé (quelques appels de plus que le rendu actuel) ;
  il se lit sur la page — `QUA-020`
- Une texture qui ne se charge pas est dite à l'écran et la marche continue avec le rendu sans texture — `QUA-002`
- La provenance et la licence des textures (CC0) sont écrites dans le dépôt — `APP-003`
- Le parcours du souk est rejoué de bout en bout dans le Quest 3 émulé, dans chacun des trois profils — `QUA-020`
- La cadence stable de 72 images par seconde ou plus, le temps d'image et la mémoire GPU sont mesurés sur un vrai Quest 3
  [humain] — `APP-001`

## Contrats modifiés

- `APP-003` — les bâtiments viennent de l'extrait OpenStreetMap, avec leur attribution : leurs surfaces peuvent porter des
  textures d'une autre source (CC0), dont la provenance est écrite ; la règle de l'attribution OpenStreetMap ne change pas
  (approuvé le 2026-10-31).
- `QUA-020` — le parcours du souk est rejoué dans chacun des trois profils.

## 2. Hors périmètre

- Les trois autres itinéraires : le pilote est le souk seulement, l'extension suit la mesure au casque.
- Les normal maps : la scène n'a qu'une lumière hémisphérique, elles ne changeraient presque rien.
- La compression GPU KTX2 / Basis : lot suivant, à décider après la mesure ; les textures du pilote sont des PNG ou JPG de
  256 à 512 px avec mipmaps.
- Un atlas de textures : incompatible avec la répétition (`RepeatWrapping`) ; une texture par classe de matériau.
- La végétation en texture (écorces, feuillages), les salissures et la différenciation régionale des matériaux.
- Un ciel, un soleil, une brume ou tout fond opaque (`APP-001`).

## 3. Contraintes

- `APP-001` ne régresse pas : les textures sont dans le groupe de la ville, donc fondues par `setCityOpacity`.
- Tenir 72 images par seconde : peu de matériaux (façade, route, sol, toit), mipmaps, filtrage anisotrope modéré.
- Poids du dépôt : le total des textures du pilote reste borné (de l'ordre du méga-octet).
- Les textures viennent de ressources CC0 (par exemple Poly Haven), retraitées localement ; aucun appel réseau dans le casque
  (`APP-003`).
- Les textures sont désaturées et multipliées par la palette pour garder l'identité de l'itinéraire.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun secret dans le dépôt (`SEC-007`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : approche par textures, pas par polygones ; trois profils (Économique,
  Équilibré, Détaillé) ; pilote sur un itinéraire existant ; possibilité de tout désactiver.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : une texture par classe de matériau
  plutôt qu'un atlas ; « Économique » égale au rendu actuel et sert d'interrupteur ; « Économique » par défaut jusqu'à
  la mesure ; module de façade d'environ 4 m sur 3 m ; résolutions et textures retenues.
- À lancer avant `rendu-ville-riche` : les deux touchent `app/src/city/`, jamais en même temps ; les textures couvrent ce que
  `rendu-ville-riche` aurait dessiné en géométrie.
- Contrats concernés : `APP-001`, `APP-003`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`, `SEC-007`.

## 5. Points à trancher

*(aucun : le défaut « Économique » se rouvre après la mesure au casque)*

## 6. Lots

- **Lot 1 — UV et matériaux** [AI] : UV métriques pour les murs et la route, matériaux par classe, chargement des textures
  avec repli. Sortie : tests verts.
- **Lot 2 — textures et profils** [AI] : façade, route, sol, toit ; profils à l'accueil ; provenance des textures.
  Sortie : `run-checks` vert.
- **Lot 3 — mesures et e2e** [AI] : appels de dessin et textures lus sur la page, e2e dans les trois profils, docs.
  Sortie : CI verte.
- **Lot 4 — mesure et essai réel** [human] : A/B sur le Quest 3, cadence, temps d'image, mémoire GPU, décision du profil par
  défaut et de l'extension aux autres itinéraires.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1.
