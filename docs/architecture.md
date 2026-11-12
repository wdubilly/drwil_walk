# Architecture — drwil_walk

Carte du dépôt au 2026-11-05. Comportement utilisateur : `docs/features.md`. Mission initiale : `MISSION.md`.

## Stack et couches

Une seule couche, `app/` : TypeScript strict + Vite HTTPS + three.js, WebXR `immersive-ar` sur Quest 3.
Version écran sans WebXR, clavier/souris ou tactile. Application statique, sans compte, serveur applicatif ni base.
Un seul rendu : extraits OpenStreetMap embarqués, attribution ODbL ; aucun fournisseur de trajet ni de tuiles distant.
Génération `npm run city` exclusivement sur PC de développement. Tests Vitest, c8 et Playwright/IWER.

## Entrées et assemblage

- `app/index.html`, `app/src/main.ts` : montage du DOM, vrai `WebGLRenderer`, WebXR et chargement local des arbres.
- `app/src/xr/experience.ts` : accueil → session → boucle XR ; renderer, document, horloge et arbres injectés.
- `app/src/pc/enter-pc.ts` : même ville et marche, canvas de page, sans zone tapis, vignette ni fondu sur écran.
- `app/src/xr/parity.test.ts` : test unique de parité (APP-015) casque / PC / tablette ; propre à chaque plateforme :
  commandes, passthrough et zone tapis (casque), ciel, profils par défaut.
- `app/src/xr/city-choice.ts`, `app/src/city/cities.ts`, `app/src/city/region-palette.ts` : les villes lues dans le catalogue
  `app/data/villes.json` (extrait et boucle chargés par `import()` dynamique), palette déduite de la région.
- `app/src/city/live-city.ts` : prépare une variante par profil avant la marche, conserve le groupe ville,
  bascule les groupes visibles sans construire de géométrie à chaud ; libération des géométries et matériaux à la sortie.
- `app/src/xr/live-preferences.ts` : applique les choix à la ville, à l'ambiance et au renderer ;
  fovéation XR à chaud, pixel ratio écran à chaud, échelle de framebuffer XR fixée à l'entrée.

## Modules

### `app/src/ui/` — accueil et préférences

- `app/src/ui/home.ts`, `app/src/ui/route-choice.ts`, `app/src/ui/home.css`, illustrations SVG : quatre cartes, vitesse et démarrages, rappel de sécurité,
  erreurs et mentions. Pas de préférence graphique à l'accueil.
- `app/src/ui/preferences.ts` : valeurs initiales (Équilibré partout), validation, mémoire `preferences-v1`,
  migration du seul ancien profil ; autres anciennes préférences ignorées ; stockage indisponible dit.
- `app/src/ui/walk-preferences.ts` : lignes et valeurs communes, boutons PC/tablette dans « Préférences de marche ».
- `app/src/ui/panel-side.ts` : côté par défaut et type ; `app/src/ui/panel.ts` : tableau HTML de marche ;
  `app/src/ui/contrast.ts` : contraste texte/fond (QUA-014).
- Matériaux locaux, poids (70 kg) et vignette sont fixes ; opacité du panneau séparée de la sécurité.

### `app/src/route/` — parcours et calculs purs

- `app/src/route/speed.ts`, `app/src/route/walk.ts` : minimum 1 km/h sans maximum, pas de 0,1 et conversion en m/s ; durée/distance.
- `app/src/route/geo.ts`, `app/src/route/path.ts` : GPS vers mètres, position et direction lissées, boucles (APP-002).
- `app/src/route/network.ts` : rues des carrefours et marche sur réseau.
- `app/src/route/itineraries.ts` : cartes d'itinéraire lues dans le catalogue des villes (une ville créée par la commande y figure sans code).
- `app/src/route/stats.ts` : estimation calories, cap, heure, allure, restant et progression ; fonctions historiques de stockage
  du poids conservées mais non branchées dans l'application.
- `app/src/route/simplify.ts` : réduction du tracé pour la minicarte.
- `app/src/route/reject-double.ts` : doublure d'erreur de chargement utilisée par les tests des arbres.

### `app/src/safety/` — visibilité du réel (APP-001)

- `app/src/safety/visibility.ts` : fondu tête baissée 25°–40°, pose absente → ville effacée, opacité bornée.
- `app/src/safety/zone.ts`, `app/src/safety/zone-edit.ts` : boîte par défaut, validation/stockage, plans de coupe et édition pure.
- La sécurité n'est jamais dans les profils ni les préférences ; la vignette XR reste active.

### `app/src/xr/` — session, image et panneaux

- `app/src/xr/session.ts` : `immersive-ar`, espace de référence et erreurs.
- `app/src/xr/frame.ts`, `app/src/xr/joystick.ts`, `app/src/xr/buttons.ts` : image de marche pure, vitesse, pause, recalage, tableau, fronts de boutons.
- `app/src/xr/guide.ts`, `app/src/xr/junctions.ts`, `app/src/xr/choice-ray.ts`, `app/src/xr/choice-markers.ts` : parcours/réseau, pointage et flèches de carrefour.
- `app/src/xr/pose.ts` : recalage, placement des panneaux hors de la zone tapis ; `app/src/xr/fov.ts` : champ simulé Quest 3
  (110° × 96°, marge de 80 %), APP-004/APP-005, hypothèse à relire sur vrai appareil.
- `app/src/xr/dashboard.ts`, `app/src/xr/hud-panel.ts`, `app/src/xr/minimap.ts` : données et canvas des panneaux flottants, même fondu que la ville.
- `app/src/xr/preference-panel.ts` : canvas des préférences, ouverture gâchette gauche, rayon/prise droite,
  pas de sélection cachée ; prend la place du tableau sans suspendre la marche.
- `app/src/xr/left-controller.ts`, `app/src/xr/zone-control.ts` : réglage/stockage de la boîte ; `app/src/xr/vignette.ts` : masque périphérique multiplicatif.
- `app/src/xr/ambience.ts`, `app/src/xr/ambience-sound.ts` : lumière du départ, brouillard activable à chaud, sons à gain plafonné ;
  pas de ciel opaque au casque, contexte audio seulement quand nécessaire (APP-011).
- `app/src/xr/trees-load.ts` : chargement local du pack, repli procédural et notice.
- `app/src/xr/diagnostics.ts`, `app/src/xr/diagnostics-report.ts` : fenêtre de mesures, rendu de la page, export JSON local.
- `app/src/xr/experience-double.ts` : doublure de renderer/session pour les tests.

### `app/src/pc/` — commandes écran

- `app/src/pc/pc-button.ts` : démarrage séparé du casque.
- `app/src/pc/keys.ts`, `app/src/pc/look.ts`, `app/src/pc/input.ts` : clavier sans répétition, regard borné, actions accumulées entre images.
- `app/src/pc/touch.ts`, `app/src/pc/touch-controls.ts` : suivi du doigt pur et boutons de 48 px (APP-007).
- Aucun choix de carrefour ni minicarte sur écran ; préférence accessible pendant la marche.

### `app/src/render/` — profils et ambiance purs

- `app/src/render/profiles.ts` : Performance/Équilibré/Qualité, plafonds et pixel ratio, repli Équilibré (APP-006).
- `app/src/render/daylight.ts` : courbe locale du jour, couleurs et repli midi.
- `app/src/render/fog.ts` : voile plafonné à 15 % au casque, pas de voile sous 8 m (APP-011).

### `app/src/city/` — OpenStreetMap et génération graphique

- `app/src/city/souq-data.ts`, `app/src/city/souq.ts` : lecture typée de l'extrait, groupes de scène sans fond XR, placement et opacité.
- `app/src/city/licence.ts`, `app/src/city/attribution.ts` : texte ODbL et mention de scène (APP-003).
- `app/src/city/buildings.ts`, `app/src/city/tint.ts`, `app/src/city/roofs.ts` : maillages fusionnés, teintes OSM/palette, ombrage et toits.
- `app/src/city/roads.ts`, `app/src/city/walkways.ts`, `app/src/city/markings.ts`, `app/src/city/street-names.ts` : voies, bordures, parcours, passages piétons,
  lignes d'arrêt et noms au sol ; `app/src/city/vegetation.ts` : surfaces vertes/haies. Le revêtement d'une voie (`surfaceFor`,
  APP-009) est la balise OSM `surface` si elle est relevée (`surfaceOf`, trois familles : asphalte, pavés, terre), sinon la
  valeur `sols` de la recette (quartier → région → « ailleurs », famille `chaussee` ou `pieton`) ; il teinte le corps de la voie, et `wearOf` y ajoute une usure déterministe
  tirée de l'identifiant OSM (même données, mêmes sols ; un seul maillage de voies, aucun appel de rendu en plus).
  Le grain (`app/src/city/road-surface.ts`) est dessiné par le shader des voies : joints de pavés, grain d'asphalte, mottes de
  terre, d'après la position au sol (aucune image, poids nul) ; le profil « performance » (ville non riche) le coupe.
- `app/src/city/toon.ts`, `app/src/city/outlines.ts` : toon à quatre paliers et contours selon profil.
- `app/src/city/facade-seed.ts`, `app/src/city/facade-family.ts`, `app/src/city/facade-palettes.ts`, `app/src/city/facade-plan.ts`, `app/src/city/facade-parts.ts`, `app/src/city/facades.ts` :
  graine OSM, familles et palettes régionales, voisins distincts, détail borné (APP-008).
- `app/src/city/shop-rules.ts`, `app/src/city/shop-awning.ts` : le rez-de-chaussée commerçant (APP-008). L'usage relevé
  (`shop`, `amenity`, `building=retail`, gardé par l'extraction dans `usage`) fait une boutique « relevée » ; sans usage, une
  part de la région en reçoit une « règle » (APP-013). La région règle aussi la largeur d'entrée et l'auvent (plat, store
  rayé, arcade), payé sur le plafond de triangles du bâtiment.
- `app/src/city/region-palette.ts`, `app/src/city/recipe-data.ts`, `app/assets/recette-regions.json` : la recette en données
  (APP-008) : une entrée par région, une surcharge par quartier trouvée par son emprise (`districtAt`), repli champ par champ
  quartier → région → « ailleurs », origine de chaque élément (`releve` exige une `source`, sinon refus ; APP-013). La
  palette de sol, de voies et de bâtiments, les jeux de façade, les matériaux locaux (`placeOf`) et les figurants (la table de
  région vit dans cette recette, `figurantsTable`) lisent le quartier avant la région.
  Le repli de matériaux d'un quartier sans photo est cette palette de région (APP-012) ; `loadRecipe` écarte un élément illisible
  (la ville retombe sur la région puis « ailleurs »), `readRecipe` reste strict.
- `app/src/city/soup.ts`, `app/src/city/near-route.ts` : géométrie partagée, proximité du parcours.
- `app/src/city/props.ts`, `app/src/city/furniture.ts` : arbres/mobilier et dimensions réelles, axe de la rue (APP-009).
- `app/src/city/lamp-rule.ts` : mâts produits par règle, provenance et refus (APP-013).
  Le groupe `lampadaires` est séparé du mobilier OSM pour pouvoir être retiré à chaud.
- `app/src/city/street-lights.ts` : lanternes/halos instanciés sans lumière par mât ni effet sur l'alpha (APP-011).
- `app/src/city/zone-clip.ts` : découpe par six plans partagés (APP-001).
- `app/src/city/tree-pack.ts`, `app/src/city/tree-assets.ts`, `app/src/city/tree-instances.ts` : validation/chargement du pack CC0, instances reproductibles ; `alignedTrees` (`app/src/city/tree-instances.ts`) produit par règle des arbres d'alignement le long des voies (espacement tiré de la graine de la voie, marqués « generated », refusés sur chaussée, passage piéton, mur, parcours ou objet du relevé), que `buildTrees` ajoute après ceux du relevé.
- `app/src/city/material-library.ts`, `app/src/city/material-variation.ts`, `app/src/city/material-mesh.ts` : bibliothèques CC0 embarquées,
  mémoire plafonnée, variantes déterministes, placage fusionné (APP-012). Images créées par le document injecté.
  `app/src/city/material-ktx2.ts` : textures KTX2 (Basis) transcodées au chargement par le transcodeur WebAssembly de three.js, servi
  avec la page sous `/basis/` par `app/vite.config.ts` (plugin `basisTranscoder`, ~0,5 Mo) ; JPEG toujours acceptés.
- `app/src/city/traffic-catalog.ts`, `app/src/city/traffic-lanes.ts`, `app/src/city/traffic-rule.ts`, `app/src/city/traffic-motion.ts` :
  catalogue/types/régions en données, voies sans bâtiments, moteur pur, proximité et mouvement (APP-014).
- `app/src/city/traffic-pack.ts`, `app/src/city/traffic-assets.ts`, `app/src/city/traffic.ts` : validation/chargement CC0 et instances ;
  `app/src/city/traffic-budget.test.ts` : budget mesuré sur les modèles embarqués.
- `app/src/city/zip-read.ts`, `app/src/city/gltf-read.ts`, `app/src/city/mesh-simplify.ts` : lecture/allègement des modèles sans exécution.
- `app/src/city/canvas-double.ts`, `app/src/city/zip-double.ts`, `app/src/city/gltf-double.ts`, `app/src/city/tree-pack-double.ts` : doublures de test seulement.

## Données, packs et scripts hors casque

- `app/data/` : un GeoJSON OSM et une boucle GPS par ville ; `app/data/villes.json` décrit les villes (source unique).
- `app/assets/` : arbres Quaternius CC0 et figurants CC0 Kenney/Poly Pizza, textures embarquées,
  `app/assets/figurants-catalogue.json` (types et lieux ; la table de région est dans `app/assets/recette-regions.json`) et `app/assets/figurants.json`. Origine/licences : `app/assets/PROVENANCE.md`.
- `app/assets/materials/` : photos (liens uniquement) et bibliothèques CC0 par quartier. Textures en KTX2 512 px,
  encodées par `app/scripts/materials-textures.ts` (`ktx2-encoder`, WebAssembly, sans outil système).
- `app/scripts/create-city.ts`, `app/scripts/city-args.ts` : commande unique `npm run city -- <identifiant> [options]`
  sur PC de développement, écrit description, extrait, boucle et matériaux, jamais appelée par l'application ;
  écriture groupée après réussite de toutes les étapes, vignette en échec écartée et dite.
- `app/scripts/cities.ts`, `app/scripts/extract-souq.ts`, `app/scripts/osm-tags.ts`, `app/scripts/route-loop.ts` : lecture des villes, requête Overpass unique,
  balises conservées et boucle sur les voies (chaque point est un sommet de voie).
- `app/scripts/panoramax.ts`, scripts de matériaux, `app/scripts/photo-search.ts`, `app/scripts/city-colours.ts` : photos Panoramax, repli Mapillary
  (jeton `MAPILLARY_TOKEN` dans l'environnement), photos fournies hors dépôt ; élargissement 30–1 000 m,
  puis palette régionale, rapport de provenance. Commandes matériaux enchaînées par `npm run city`.
- `app/scripts/prepare-nature-pack.ts`, `app/scripts/prepare-traffic-pack.ts`, `app/scripts/glb-scene.ts`, `app/scripts/png-read.ts` : préparation locale
  des packs par lecture en mémoire, rien d'extrait ni d'exécuté.
- `app/scripts/overture-coverage.ts` : relevé ponctuel Overture via exécuteur DuckDB injecté, jamais dans l'application ;
  aucun fichier Overture incorporé, `docs/intentions/rendu-sources-donnees.md`.
- Inscription d'une ville créée à l'accueil encore manuelle : `docs/intentions/inscrire-une-ville-creee.md`.

## Tests et configuration

- Tests `*.test.ts` à côté du code. Logique pure séparée du rendu. Renderer/document/horloge/chargements injectés.
- Imports relatifs avec extension .ts, syntaxe effaçable par Node ; happy-dom sans globals, Vitest threads sans module runner Vite.
- c8 autour de `npm test`, couverture 100 % dans les quatre dimensions sans exclusion (QUA-004).
  diff-cover exige 100 % des lignes modifiées contre `origin/master`, rapport Cobertura dans `app/coverage/` (si présent).
- `app/e2e/` : chemins critiques QUA-020 sur Chromium, Quest 3 IWER injecté uniquement dans les tests,
  contrôleurs réels émulés pour les préférences ; PC sans WebXR, tactile CDP.
- `app/playwright.config.ts` : Vite HTTPS port 5174, un worker, pas de serveur réutilisé ;
  résultats `dist/e2e-results/`, captures `dist/e2e-captures/`.
- `app/vite.config.ts` : HTTPS réseau, build `dist/app/` hors couverture ; `app/eslint.config.js`, `app/tsconfig.json` :
  lint/TypeScript strict. Toute configuration a son test.

## Gouvernance IA-first

`AGENTS.md` puis `app/AGENTS.md` ; contrats dans `docs/contracts.md`, recettes dans `docs/recipes/`,
attentes dans `docs/projects/pending.md`. `.drwil/ia-first.json` décrit les contrôles ; hooks
`.githooks/run-checks.mjs` au commit et push. `npx drwil verify --agent` fournit le verdict de gouvernance.

`.github/workflows/ia-first.yml` rejoue les contrôles sur PR et sur `master` (pas de doublon `push` de branche), avec les hooks
principaux sur PR ; l'e2e, réservé à la CI (`runAt: ["ci"]`, jamais joué au commit, au push ni par `drwil verify`), est découpé en
2 tranches (`shards: 2`) jouées chacune par un job `shard i/2` qui installe les dépendances de `app/` et Chromium. Le job `checks`,
requis pour `master`, agrège leurs verdicts (une tranche manquante, en double ou en échec le fait échouer) et joue les autres
contrôles, avec diff-cover et les dépendances de `app/`. Captures publiées par tranche, en artefacts `captures-accueil-i-of-2`.
Modèle de PR : `.github/pull_request_template.md`. Aucun verdict humain exécuté par l'agent.
