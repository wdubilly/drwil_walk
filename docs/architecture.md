# Architecture — drwil_walk

Au 2026-10-30. Carte du dépôt : ce qui vit où. À tenir à jour dans le même commit que le code qu'elle décrit.

## Ce que fait l'application

Une page WebXR en réalité mixte, ouverte dans le navigateur du Meta Quest 3, sans installation. L'utilisateur marche
sur un tapis de course classique (non connecté). La ville (Pune ou Doha) défile le long d'un itinéraire prédéfini, à la
vitesse qu'il règle à la manette pour qu'elle corresponde à celle du tapis. Le monde réel (tapis, rampe, console) reste
visible grâce au passthrough : la ville s'efface quand il baisse la tête, et la zone du tapis reste transparente.
Le détail fonctionnel est dans `MISSION.md`.

## Stack

Décidée le 2026-10-30 par le demandeur :

- **Langage** : TypeScript strict.
- **Build et serveur de dev** : Vite, en HTTPS (WebXR l'exige), accessible sur le réseau local pour le Quest 3.
- **3D et XR** : three.js, session WebXR `immersive-ar` (passthrough du Quest 3).
- **Ville** : par défaut, bâtiments OpenStreetMap extrudés en three.js, à partir d'un extrait GeoJSON figé dans le dépôt
  (aucun appel réseau dans le casque), mention « © contributeurs OpenStreetMap » affichée (licence ODbL). En option
  (décision du demandeur du 2026-10-31, `docs/projects/journal.md`) : les Google Photorealistic 3D Tiles par
  `3d-tiles-renderer`, avec une clé lue de `.env.local` (dans `app/`) (`VITE_GOOGLE_MAPS_API_KEY`) ; sans clé ou si les tuiles
  échouent, le rendu OpenStreetMap reste le plan B et la raison est dite à l'écran.
- **Tests** : Vitest (unitaires, couverture à 100 %), Playwright avec émulation WebXR (IWER) pour l'e2e.
- **Hébergement** : application 100 % statique, aucun serveur ni base de données.

## Couches

- `app/` : l'application entière, paquet npm à part (`app/package.json`). Contexte de la couche : `app/AGENTS.md`.
  - `app/index.html` : la page servie ; elle charge le point d'entrée `app/src/main.ts`.
  - `app/src/` : le code, un dossier par module, chaque fichier de logique avec son test `*.test.ts` à côté.
    Découpage prévu : xr (session et contrôles), city (bâtiments OSM extrudés), route (itinéraires et déplacement),
    safety (visibilité du réel), ui (accueil et panneau d'infos).
  - `app/src/main.ts` : point d'entrée ; il monte l'accueil et branche le renderer three.js (`WebGLRenderer`).
  - `app/src/route/` : la vitesse de marche (`app/src/route/speed.ts` : bornage 1 à 8 km/h, pas de 0,1, conversion en m/s) et le
    déplacement (`app/src/route/walk.ts` : distance à la vitesse réglée, affichage distance et temps ; `app/src/route/stats.ts` : calories estimées, poids gardé en `localStorage`, cap de la boussole, heure locale), le parcours GPS
    (`app/src/route/geo.ts` : GPS vers mètres locaux ; `app/src/route/path.ts` : position et direction à une distance,
    boucle qui reprend au départ, contrat APP-002) et les quatre itinéraires de l'accueil
    (`app/src/route/itineraries.ts` : données, dont l'indicateur « disponible »).
  - Itinéraire libre (chantier itineraire-libre) : `app/src/route/providers.ts` (interfaces `Router` et `Geocoder`, limite de 5 km), `app/src/route/valhalla.ts` (chemin à pied, profil piéton) et `app/src/route/photon.ts` (recherche d'adresse et géocodage inverse), par défaut et sans clé,
    `app/src/route/create-providers.ts` (choix des services, adresses `VITE_ROUTING_URL` et `VITE_GEOCODING_URL`), `app/src/route/routes-api.ts` et `app/src/route/geocoding.ts` (option Google Routes et Geocoding, clé `VITE_GOOGLE_ROUTES_API_KEY`), `app/src/route/reject-double.ts` (doublure de test),
    `app/src/city/free-route.ts` (bâtiments OpenStreetMap proches du tracé demandés à Overpass, préparation du trajet, contrats APP-002 et APP-003),
    `app/src/ui/free-trip.ts` (départ et arrivée : carte et adresses qui se remplissent mutuellement), `app/src/ui/map-picker.ts` et `app/src/ui/map-math.ts`
    (carte légère à tuiles OpenStreetMap, sans bibliothèque), illustration `app/src/ui/libre.svg` ; un tracé non bouclé (`Path.loop` faux) s'arrête à l'arrivée (`app/src/xr/frame.ts`).
  - `app/src/safety/` : la sécurité-visibilité (`app/src/safety/visibility.ts`, contrat APP-001) : inclinaison de la tête lue dans la
    pose WebXR, fondu de la ville au-delà de 25°, opacité globale bornée 30 à 100 %. Zone tapis (`app/src/safety/zone.ts` : boîte par défaut, validation, enregistrement `localStorage`, six plans ; `app/src/safety/zone-edit.ts` : réglage à la manette gauche en logique pure) et vignette réelle (`app/src/xr/vignette.ts`).
  - Champ de vision du casque (`app/src/xr/fov.ts`, contrat APP-004) : logique pure qui juge qu'un point ou un rectangle de la scène reste dans la vue d'une tête, pour la cible Quest 3 (110° × 96°, marge 80 % des demi-angles : hypothèse de cadrage annoncée par Meta, source à relire, voir le fichier) ; l'e2e en tire le masque donné à IWER (`app/e2e/champ-de-vision.test.ts`). Le panneau d'infos y est jugé (contrat APP-005) : sa place (`app/src/xr/pose.ts`, 28° sur le côté, 0,31 m sous les yeux) est réglée pour que ses quatre coins restent dans la vue.
  - `app/src/xr/` : la session `immersive-ar` (`app/src/xr/session.ts`), le joystick droit (`app/src/xr/joystick.ts`, un cran de 0,1 km/h
    par poussée), l'image de marche en logique pure (`app/src/xr/frame.ts`) et l'assemblage accueil → session → boucle de rendu
    (`app/src/xr/experience.ts`, renderer injecté pour être testé avec une doublure). La gâchette (pause), A (recalage) et B (panneau) sont lus par `app/src/xr/buttons.ts` (un appui = une action), la pause par `app/src/xr/frame.ts`, le recalage (origine et cap du parcours, posés sur le groupe `world`) par `app/src/xr/pose.ts`, et le tableau de bord du casque (cap, heure, lieu, vitesse, durée, distance, calories « environ »), un texte flottant dessiné une fois par valeur changée, soumis au fondu de la ville, sur un fond légèrement transparent, par `app/src/xr/hud-panel.ts` ; sa place (en bas du champ de vision, du côté choisi, à l'horizontale, écartée de la zone tapis qu'il ne recouvre jamais) est calculée en logique pure par `app/src/xr/pose.ts`, le côté se choisit à l'accueil et se garde en `localStorage` (`app/src/ui/panel-side.ts`) ; le poids facultatif se saisit aussi à l'accueil, `app/src/ui/home.ts`. La zone tapis est réglée par la manette gauche (`app/src/xr/left-controller.ts` : joystick, prise, X, Y ; `app/src/xr/zone-control.ts` : chargement, réglage, enregistrement en fin de geste) et rendue par six plans de coupe `clipIntersection` partagés par les matériaux de la ville (`app/src/city/zone-clip.ts`, appliqués par `app/src/city/souq.ts` ; les mentions en sont exemptées), sans rendu supplémentaire ; la vignette est un quadrilatère plein écran à fondu multiplicatif dessiné en dernier (`app/src/xr/vignette.ts`).
  - `app/src/city/` : les villes des itinéraires, le souk de Doha, la Vieille ville de Pune, la Corniche de Doha et FC Road (chantiers doha-souq-waqif, pune-vieille-ville, doha-corniche et pune-fc-road, `docs/projects/journal.md`) : lecture de l'extrait
    (`app/src/city/souq-data.ts`), choix de la ville et de la boucle par identifiant d'itinéraire (`app/src/city/cities.ts`, lu par `app/src/xr/experience.ts`), bâtiments extrudés et fusionnés en un maillage à couleurs par sommet, un ton de la palette par bâtiment, ou la teinte de ses balises `building:colour`, `roof:colour`, `building:material` (`app/src/city/tint.ts`), avec un ombrage par sommet vers le pied (`app/src/city/buildings.ts`), arbres et mobilier urbain plafonnés (`app/src/city/props.ts`) : mobilier fusionné en un maillage ; arbres du pack Quaternius (chargement et validation `app/src/city/tree-pack.ts`, modèle embarqué `app/src/city/tree-assets.ts`, instances par variante avec variante, cap et taille tirés de la position `app/src/city/tree-instances.ts`), chargés dès l'accueil par `app/src/xr/trees-load.ts` et, si le modèle ne se charge pas, remplacés par l'arbre procédural avec la raison dite à l'écran, voies posées à plat sur le sol et fusionnées en un maillage, largeur et couleur selon leur classe, bordure plus claire et ligne centrale des voies larges (`app/src/city/roads.ts`), matériau toon à quatre paliers sur le sol, les voies et les bâtiments, avec un motif de fenêtres dessiné par le shader sur les façades, sans texture ni maillage en plus (`app/src/city/toon.ts`), contours des bâtiments proches du parcours en option de l'accueil, désactivés par défaut (`app/src/city/outlines.ts`), palette par itinéraire (`app/src/city/cities.ts`), scène,
    placement de la ville sur le parcours et opacité (`app/src/city/souq.ts` : scène sans fond pour le passthrough),
    mentions de données dans la scène (`app/src/city/attribution.ts`) et leur texte (`app/src/city/licence.ts`,
    contrat APP-003), tuiles Google 3D (`app/src/city/google-tiles.ts` : clé, alignement sur l'origine de la boucle,
    repli, droits des tuiles ; `app/src/xr/google-mode.ts` : rendu choisi, message de repli, mentions affichées). `app/src/city/canvas-double.ts`, `app/src/city/zip-double.ts`, `app/src/city/gltf-double.ts` et `app/src/city/tree-pack-double.ts` sont des doublures de test, importées par les seuls tests.
  - `app/data/` : l'extrait OpenStreetMap du quartier, bâtiments (avec leurs balises de teinte), voies, arbres, lampadaires et bancs (`app/data/souq-waqif.json`, `app/data/pune-vieille-ville.json`, `app/data/doha-corniche.json`, `app/data/pune-fc-road.json`, GeoJSON versionnés, ©
    contributeurs OpenStreetMap, ODbL) et le tracé de chaque boucle (`app/data/souq-waqif-boucle.json`, `app/data/pune-vieille-ville-boucle.json`, `app/data/doha-corniche-boucle.json`, `app/data/pune-fc-road-boucle.json`).
  - `app/assets/` : les arbres du pack Quaternius « Stylized Nature MegaKit » (Standard, CC0), allégés et embarqués (`app/assets/quaternius-trees.json`, texture des feuilles comprise), la licence de l'archive (`app/assets/quaternius-licence.txt`) et la provenance écrite (`app/assets/PROVENANCE.md`) ; `app/scripts/prepare-nature-pack.ts` les produit depuis l'archive, gardée hors du dépôt (lecture du zip `app/src/city/zip-read.ts`, du glTF `app/src/city/gltf-read.ts`, allègement `app/src/city/mesh-simplify.ts`), jamais exécuté dans le casque.
  - `app/scripts/extract-souq.ts` : l'extraction Overpass qui produit l'extrait (`npm run extract`), `app/scripts/osm-tags.ts` (balises retenues : couleurs, matériau, arbres, mobilier), `app/scripts/extract-pune.ts`, `app/scripts/extract-corniche.ts` et `app/scripts/extract-fc-road.ts`
    (`npm run extract:pune`, `npm run extract:corniche`, `npm run extract:fc-road`, même fonction sur un autre cadre) ; elles ne sont jamais exécutées dans le casque, qui ne fait
    aucun appel réseau. Leurs tests sont `app/src/city/extract-souq.test.ts`, `app/src/city/extract-pune.test.ts`, `app/src/city/extract-corniche.test.ts` et `app/src/city/extract-fc-road.test.ts`.
  - `app/src/ui/` : l'écran d'accueil (`app/src/ui/home.ts` : vitesse, opacité, rappel de sécurité, bouton « Entrer en réalité
    mixte » ; `app/src/ui/route-choice.ts` : cartes d'itinéraire en boutons radio ; `app/src/ui/render-choice.ts` : rendu OpenStreetMap ou Google 3D ; `app/src/ui/home.css` : thème sombre et
    couleurs ; `app/src/ui/contrast.ts` : mesure du contraste, contrat QUA-014), les illustrations des cartes
    (`app/src/ui/*.svg`, une par itinéraire, livrées par Vite avec l'application, sans réseau) et le panneau de marche sur la page (`app/src/ui/panel.ts` : vitesse, distance, temps, opacité de la ville).
  - `app/e2e/` : l'e2e des chemins critiques (`app/e2e/chemins-critiques.test.ts`, `app/e2e/itineraire-libre.test.ts` pour l'itinéraire libre, servi par des services factices, et `app/e2e/google-3d.test.ts` pour le rendu Google, servi par des tuiles factices sans appel à Google, contrat QUA-020), Playwright sur
    Chromium avec un Quest 3 émulé par IWER, injecté par le test (jamais livré dans l'application). Il prend aussi les
    captures de l'accueil et de la marche à Pune, sur la Corniche et sur FC Road dans `dist/e2e-captures/` (ignoré par Git), publiées par la CI sous le nom `captures-accueil`.
  - Configuration, chacune testée comme le code : `app/playwright.config.ts` (e2e contre Vite sur le port 5174, en
    HTTPS, résultats hors de la couche), `app/vite.config.ts` (Vite en HTTPS sur le réseau local, build
    dans le dossier dist/app de la racine, hors de la mesure de couverture, et
    Vitest), `app/eslint.config.js` (règles des contrats de qualité), `app/tsconfig.json` (TypeScript strict).
  - Couverture : c8 autour de `npm test` (Vitest), 100 % sans exclusion. Les tests tournent en threads et le code
    est importé par Node avec retrait natif des types, pour que c8 mesure les vraies lignes des fichiers .ts :
    d'où l'extension .ts dans les imports relatifs. Les tests du DOM utilisent happy-dom (`new Window()`), sans
    environnement global. La couverture différentielle (contrôle `coverage-diff-app`, QUA-004) exige en plus
    100 % des lignes ajoutées ou modifiées par rapport à `origin/master` : c8 écrit un rapport Cobertura dans
    app/coverage/ (ignoré par Git), lu par diff-cover (outil Python).

## Gouvernance IA-first

- Instructions IA : `AGENTS.md`, puis le `AGENTS.md` de la couche touchée.
- Mission de la v0.1 : `MISSION.md`.
- Invariants : `docs/contracts.md`.
- Recettes : `docs/recipes/`.
- Contrôles : `.githooks/run-checks.mjs`, lancé au commit par `.githooks/pre-commit`. Les contrôles propres à la stack
  sont déclarés dans `.drwil/ia-first.json` (clé `checks`).
- Configuration du kit : `.drwil/ia-first.json`.
- `.github/workflows/` — CI GitHub (`.github/workflows/ia-first.yml`, écrit par `npx drwil init --ci github`) : le job `checks` rejoue
  `node .githooks/run-checks.mjs` à chaque push et PR, et sur une PR les rejoue avec les hooks de la branche principale ;
  c'est le contrôle requis par la protection de `master`. Modèle de PR : `.github/pull_request_template.md`.
  Avant les contrôles, le job installe les dépendances de `app/` (`npm ci`) et le navigateur Chromium de Playwright
  (`npx playwright install --with-deps chromium`) : les contrôles de la couche, e2e compris, tournent depuis ce dossier.
