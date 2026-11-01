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
