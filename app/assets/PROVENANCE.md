# Provenance des arbres du pack Quaternius

Les fichiers de ce dossier viennent d'un pack tiers, sous licence CC0 (domaine public) : la mention n'est pas obligatoire,
elle est écrite pour que l'origine se retrouve (`APP-003`).

| | |
|---|---|
| Pack | « Stylized Nature MegaKit », par Quaternius |
| Page | https://quaternius.com/packs/stylizednaturemegakit.html (téléchargement par la page itch.io https://quaternius.itch.io/stylized-nature-megakit) |
| Version | **Standard** (gratuite) ; ni la version Pro ni la version Source |
| Date de téléchargement | 2026-11-01, par le demandeur dans son navigateur (la page est derrière une vérification anti-robot) ; l'archive est restée hors du dépôt |
| Archive | `Stylized Nature MegaKit[Standard].zip`, 459 entrées, 68 modèles glTF (aussi FBX et OBJ) |
| Licence | CC0 1.0 Universal : texte de l'archive copié dans `quaternius-licence.txt` |

## Arbres fournis et arbres retenus

L'archive Standard contient **15 arbres** (`CommonTree_1` à `_5`, `DeadTree_1` à `_5`, `TwistedTree_1` à `_5`), et non les
**40** annoncés pour le kit complet : le reste est réservé à la version Pro.

Retenus : `CommonTree_1`, `CommonTree_2`, `CommonTree_3` et `CommonTree_5` (quatre variantes d'arbre à feuilles vertes). Écartés :
les arbres morts (`DeadTree_*`, sans feuilles, déplacés dans une ville vivante) et les arbres tordus (`TwistedTree_*`, feuillage
sombre, de 6 800 à 6 900 triangles d'écorce).

## Ce qui a été changé (script `app/scripts/prepare-nature-pack.ts`)

Les arbres d'origine pèsent de 1 700 à 6 900 triangles d'écorce et 1 300 à 1 900 de feuillage, avec des textures de 4 Mo : trop pour
300 instances à 72 images par seconde sur le Quest 3. Le script, relançable depuis l'archive, produit `quaternius-trees.json` :

- écorce : sommets regroupés par cases jusqu'à 200 triangles au plus ; couleur unie (moyenne de la texture d'écorce
  `Bark_NormalTree.png`) fois l'ombrage par sommet du pack, sans texture ni normal map ;
- feuillage : une carte sur trois ou plus, agrandie autour de son centre (jusqu'à deux fois), 130 cartes au plus ; la texture
  `Leaves_NormalTree_C.png` du pack est gardée telle quelle, en base64 dans le fichier (aucun appel réseau pour l'obtenir) ;
- chaque arbre ainsi obtenu a de 413 à 454 triangles (plafond de 500, testé) ; le fichier de modèle pèse de l'ordre de 300 Ko.

Relancer (depuis `app/`, l'archive étant hors du dépôt) :
`node -e "import('./scripts/prepare-nature-pack.ts').then(m=>m.prepareFiles(process.argv[1],'assets'))" "<chemin de l'archive>.zip"`.

# Provenance des matériaux locaux du souk (`materials/`)

Les textures de `materials/doha-souq-waqif.json` viennent d'ambientCG, sous licence **CC0 1.0** (domaine public :
https://docs.ambientcg.com/license/) ; la mention n'est pas obligatoire, elle est écrite pour que l'origine se retrouve
(`APP-012`).

| Matériau | Texture ambientCG | Page |
|---|---|---|
| Enduit | `Plaster001` (couleur et relief, 1K JPG) | https://ambientcg.com/view?id=Plaster001 |
| Pierre | `Bricks106A` (couleur et relief, 1K JPG) | https://ambientcg.com/view?id=Bricks106A |
| Bois | `Planks037A` (couleur et relief, 1K JPG) | https://ambientcg.com/view?id=Planks037A |

Ce qui a été changé (script `app/scripts/materials-textures.ts`, lancé par `npm run materials:library -- doha-souq-waqif`
depuis `app/`) : réduites à 512 × 512 px (jamais agrandies), la couleur réduite à sa luminance (rapportée à sa moyenne) puis multipliée par la couleur relevée du
quartier, réencodées en KTX2 (Basis ETC1S, mipmaps comprises) et embarquées en base64 dans le fichier (aucun appel réseau pendant la marche).
L'encodeur est `ktx2-encoder` (MIT, encodeur Basis Universal en WebAssembly) ; le transcodeur que la page sert au casque est celui de three.js
(`examples/jsm/libs/basis/`, MIT, Basis Universal Apache-2.0), copié tel quel dans le build sous `basis/`.
Les couleurs sont aujourd'hui **provisoires** (la palette du souk) : aucune photo de rue n'a encore été relevée
(`docs/preuves/materiaux-souk.md`). Les photos de rue ne sont jamais embarquées : l'inventaire
`materials/doha-souq-waqif-photos.json` n'en garde que le lien, l'identifiant, l'auteur et la licence.

## Matériaux locaux de toute ville créée par `npm run city`

La commande unique de création d'un itinéraire (`app/scripts/create-city.ts`) habille chaque ville avec les **trois mêmes
textures ambientCG (CC0 1.0)** que le souk : `Plaster001` (enduit), `Bricks106A` (pierre) et `Planks037A` (bois), réduites,
recolorées et embarquées de la même façon (`app/scripts/materials-textures.ts`) ; la table ci-dessus vaut donc pour toute
bibliothèque `app/assets/materials/<itinéraire>.json`. Aucune autre texture n'entre sans que sa licence CC0 et sa page
soient ajoutées ici (`APP-012`).

Les couleurs de chaque bibliothèque viennent de photos de rue (Panoramax, Mapillary, photos fournies par le demandeur) ou, à
défaut, de la palette de la région (`APP-008`) : la bibliothèque porte, pour chaque couleur, sa provenance (photo, distance au
tracé, auteur, licence, lien). Les photos ne sont jamais embarquées ; l'inventaire `<itinéraire>-photos.json` n'en garde que
les liens, auteurs et licences. Panoramax publie ses photos sous licence ouverte indiquée par photo ; Mapillary sous CC BY-SA 4.0.

# Provenance des figurants : véhicules et piétons (`figurants.json`)

Ces modèles servent à la ville vivante (`APP-014`, chantier ville-vivante-souk). Ils viennent de trois sources gratuites
sous licence CC0 1.0 (domaine public). La mention n'est pas obligatoire ; elle est écrite pour qu'on retrouve l'origine.
Les fichiers ont été téléchargés le 2026-11-05 par l'agent du chantier, sans vérification anti-robot, et sont restés
hors du dépôt.

| Source | Page | Fichier, taille, empreinte sha256 | Licence |
|---|---|---|---|
| « Car Kit » 3.1, par Kenney | https://kenney.nl/assets/car-kit | `kenney_car-kit.zip`, 4 814 237 o, `fac7dacac5c7874348cf19729af3ef205f3d366493edaf0a827d93f4fdf3d0c4` | CC0 : le `License.txt` de l'archive est copié dans `kenney-car-kit-licence.txt` |
| « Mini Characters » 1.0, par Kenney | https://kenney.nl/assets/mini-characters | `kenney_mini-characters.zip`, 2 403 059 o, `9e1d48e6d7b8479ebbe84df71eb5bd8e1b3f0da546dea641890dccc8a02d0999` | CC0 : le `License.txt` de l'archive est copié dans `kenney-mini-characters-licence.txt` |
| « Cartoony Purple Motorcycle », par AliceCassie | https://poly.pizza/m/j20srJUjpB | `polypizza_cartoony-purple-motorcycle.glb` (servi par https://static.poly.pizza/3ff04d85-dfe6-487c-b01d-5ce92103cf30.glb), 91 144 o, `86219f3bd3c14d50f822def3ce080db11b3d0f45123db5f3b9ace4d7b44a8124` | « Licence: CC0 1.0 » sur la page du modèle (relevée le 2026-11-05) ; le modèle est un `.glb` seul, livré sans fichier de licence |

## Modèles retenus

Le catalogue `figurants-catalogue.json` désigne chaque modèle par son nom. Pour chacun, le nombre de triangles après
préparation (plafond de 3 000, testé) :

- Car Kit : `sedan` (2 032), `taxi` (2 072), `suv` (2 474), `van` (2 082), `delivery` (2 476).
- Mini Characters : `character-female-a` (876), `-female-b` (742), `-female-d` (797), `character-male-a` (723),
  `-male-c` (793), `-male-e` (710).
- La moto : `motorcycle` (1 500).

Écartés : les autres modèles du Car Kit (véhicules de secours, camions, tracteurs, karts, voitures de course ou de
sport, roues, débris, cônes), qui ne relèvent pas d'une rue ordinaire ou ne sont pas des véhicules ; les six autres
personnages (`female-c`, `-e`, `-f`, `male-b`, `-d`, `-f`) et les accessoires (cannes, fauteuils roulants) du pack Mini
Characters, pour rester sous le plafond de 16 modèles.

## Ce qui a été changé (script `app/scripts/prepare-traffic-pack.ts`)

Le script lit les archives et le `.glb` en mémoire, comme des données non fiables : rien n'y est exécuté, aucun appel
réseau n'est fait. Il produit `figurants.json` (environ 430 Ko) :

- **couleurs** : la texture de chaque modèle est remplacée par une couleur par sommet (la texture lue au point du
  sommet, multipliée par la couleur du matériau), regroupée en une palette par modèle ;
- **sommets** : les sommets identiques sont fusionnés ;
- **position** : chaque modèle est posé au sol et centré ;
- **personnages** : ils sont posés dans la première image de leur animation `idle`, puis figés, sans squelette. Ils
  glissent donc sans marche animée : cela coûte un seul appel de rendu par modèle.

La taille réelle vient du gabarit du catalogue. La hauteur est exacte ; la longueur et la largeur sont étirées d'un
facteur 1,6 au plus.

Relancer (depuis `app/`, les trois fichiers étant réunis dans un dossier hors du dépôt) :
`node --experimental-strip-types -e "import('./scripts/prepare-traffic-pack.ts').then(m=>m.prepareFiles(process.argv[1],'assets'))" "<dossier des packs>"`.
