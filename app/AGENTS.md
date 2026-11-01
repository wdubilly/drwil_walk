# app layer context

Read `../AGENTS.md` first: do not repeat what it already says. The detail
of each contract (rule, proof) is in `docs/contracts.md` (from the root):
do not copy it here.

## Context

Couche unique : l'application WebXR entière (TypeScript strict, Vite, three.js), cadrée le 2026-10-30.
Socle posé le 2026-10-30 (configuration, point d'entrée, vitesse), puis une première tranche verticale : accueil,
session `immersive-ar`, rue simple, marche en ligne droite, joystick, fondu tête baissée (carte :
`docs/architecture.md`). Souk de Doha (bâtiments OpenStreetMap extrudés, boucle GPS d'environ 1,5 km, mention d'attribution) posé le 2026-10-31. Accueil sombre à cartes d'itinéraire (`app/src/ui/home.css`, `app/src/ui/route-choice.ts`, `app/src/route/itineraries.ts`, illustrations `app/src/ui/<id>.svg`) posé le 2026-10-31. Vieille ville de Pune (même méthode, `app/src/city/cities.ts` associe chaque itinéraire à sa ville ; la marche lit l'itinéraire choisi) posée le 2026-10-31. Corniche de Doha (aller-retour d'environ 4 km, même méthode) posée le 2026-10-31. FC Road à Pune (aller-retour d'environ 3,5 km, même méthode) posée le 2026-10-31. Rendu de la ville (voies sur le sol, bâtiments en plusieurs tons, palette par itinéraire, `app/src/city/roads.ts`) posé le 2026-10-31, à juger au casque. Rendu enrichi (couleurs et matériaux OSM des bâtiments, ombrage par sommet, arbres et mobilier, `app/src/city/tint.ts`, `app/src/city/props.ts`, `app/scripts/osm-tags.ts`) posé le 2026-10-31, à juger au casque. Zone tapis (boîte par défaut, réglée à la manette gauche, enregistrée en `localStorage`, `app/src/safety/zone.ts`) et vignette réelle (`app/src/xr/vignette.ts`) posées le 2026-11-01, à juger au casque. Tableau de bord de marche du casque (calories estimées, poids facultatif gardé en `localStorage`, boussole, lieu, heure : `app/src/route/stats.ts`, `app/src/xr/hud-panel.ts`) posé le 2026-11-01, à juger au casque. Ambiance cartoon (matériau toon, voies bordées, fenêtres, contours en option : `app/src/city/toon.ts`, `app/src/city/roads.ts`, `app/src/city/outlines.ts`) posée le 2026-11-01, à juger au casque ; ses arbres sont ceux du pack Quaternius « Stylized Nature MegaKit » (Standard, CC0), allégés et embarqués dans `app/assets/` (`app/src/city/tree-pack.ts`, `app/src/city/tree-instances.ts`, chargés par `app/src/xr/trees-load.ts`, provenance dans `app/assets/PROVENANCE.md`), posés le 2026-11-01, à juger au casque.

- Code dans src/, un dossier par module : xr/ (session `immersive-ar`, manettes), city/ (3d-tiles-renderer,
  repli OSM), route/ (itinéraires, déplacement à vitesse réglée), safety/ (fondu tête baissée, zone tapis,
  opacité, vignette), ui/ (accueil, panneau d'infos).
- La logique (calculs de vitesse, d'opacité, de zone, de trajectoire) est en **fonctions pures**, séparée du rendu
  three.js : c'est elle que les tests unitaires couvrent à 100 %.
- Les itinéraires sont des données (liste de points GPS par itinéraire), pas du code.
- La vitesse passe par une interface `SpeedSource` (réglage manuel en v0.1, Bluetooth plus tard).
- Tests unitaires à côté du code (`*.test.ts`), e2e Playwright dans e2e/ avec un casque émulé (IWER).
- Imports relatifs **avec l'extension .ts** (`import { x } from "./speed.ts"`) : les tests importent le code par
  Node lui-même (retrait natif des types), sans transformation par Vite, pour que c8 mesure les vraies lignes. Seule
  la syntaxe effaçable est permise (`erasableSyntaxOnly` : pas d'`enum`, pas de `namespace`).
- Aucune exclusion de couverture : un fichier de configuration (`vite.config.ts`, `eslint.config.js`) a son test.
- Le DOM se teste avec happy-dom (`new Window().document`) passé en paramètre, sans environnement global de test.
- Le rendu three.js est injecté (classe `Renderer` passée à `startExperience`) : les tests passent une doublure,
  seul `src/main.ts` branche le vrai `WebGLRenderer`.
- Les fichiers de `data/` sont importés comme JSON (attribut d'import de type JSON) : l'extrait est du GeoJSON dans un fichier d'extension json, que Vite et Node lisent sans configuration.
- Le script `scripts/extract-souq.ts` n'a pas de point d'entrée à lui (il ne serait pas couvert) : `npm run extract` l'appelle en ligne, et son test vit dans `src/city/` (Vitest ne lit que `src/` et la racine).
- Rendu par défaut sans clé ni réseau : la ville vient d'un extrait OpenStreetMap figé dans le dépôt. Rendu Google 3D en
  option (`docs/projects/journal.md`) : clé `VITE_GOOGLE_MAPS_API_KEY` lue de `.env.local` (dans `app/`) par `src/main.ts` (jamais
  commitée, SEC-007), tuiles par `3d-tiles-renderer` dans `src/city/google-tiles.ts`, injectées dans `startExperience`
  (`ExperienceDeps.google`) pour que les tests n'appellent jamais Google ; l'e2e (`e2e/google-3d.test.ts`) sert un jeu de
  tuiles factice par `page.route`, avec une clé fictive donnée au serveur de test.
- Itinéraire libre (chantiers itineraire-libre, fournisseurs-ouverts) : routage et adresses derrière les interfaces `Router` et `Geocoder` (`app/src/route/providers.ts`) ; par défaut Valhalla
  (`app/src/route/valhalla.ts`) et Photon (`app/src/route/photon.ts`), sans clé, aux adresses réglables par `VITE_ROUTING_URL` et `VITE_GEOCODING_URL` (non secrètes, instance auto-hébergée possible) ; Google Routes et Geocoding
  (`app/src/route/routes-api.ts`, `app/src/route/geocoding.ts`) les remplacent si `VITE_GOOGLE_ROUTES_API_KEY` (distincte de celle des tuiles, lue de `.env.local`) est fournie ; `createProviders` (`app/src/route/create-providers.ts`) choisit,
  appelé par `src/main.ts`, et les services avec `fetch` sont injectés dans `startExperience` (`ExperienceDeps.routes`) pour que les tests n'appellent jamais un service réel ; le trajet se prépare à l'accueil
  (`src/ui/free-trip.ts` : carte `src/ui/map-picker.ts` ou adresse, puis `src/city/free-route.ts` : chemin, bâtiments Overpass), la marche ne fait aucun appel. Carte sans
  bibliothèque (Leaflet exige `window` à l'import et une vraie mise en page, ce que l'injection et les tests happy-dom évitent) ; l'e2e (`e2e/itineraire-libre.test.ts`) sert routage,
  adresses, Overpass et tuiles par `page.route`, sans aucune clé (la clé Routes du serveur de test est vidée). Aucune adresse ni point conservé.

## Test pitfalls

- 2026-10-30 : c8 lit 0 % si Vitest tourne en forks (le fork est tué par signal, sa couverture V8 n'est jamais
  écrite) : garder `pool: "threads"` dans `vite.config.ts`.
- 2026-10-30 : c8 compte des branches sur des commentaires si le code passe par le module runner de Vite (positions
  décalées) : garder `experimental.viteModuleRunner: false`.
- Le point d'entrée s'exécute à l'import : son test fournit un `document` (happy-dom) et un `navigator` de
  substitution (`vi.stubGlobal`) puis l'importe dynamiquement.
- 2026-10-30 : les e2e sont nommés `*.test.ts` dans e2e/ : c8 exclut les fichiers de test par défaut (pas les
  `*.spec.ts`), et Vitest ne lit que src/ et la racine. IWER n'applique un axe de manette qu'à l'image suivante :
  laisser passer des images entre deux poussées (`letFramesPass`) ; même règle pour un bouton (`updateButtonValue`) : tenir la valeur, observer l'effet, relâcher, laisser passer des images avant l'appui suivant. Les commandes de la manette droite sont lues par `src/xr/buttons.ts` (gâchette 0, A 4, B 5) : un appui est un front montant ; celles de la gauche (prise 1, X 4, Y 5, joystick axes 2 et 3) par `src/xr/left-controller.ts`.
- 2026-10-30 : three.js fait tourner sa boucle de page en plus de celle de la session si `setAnimationLoop` est appelé
  après `xr.setSession` (images sans `XRFrame`) : poser la boucle avant la session, et ignorer une image sans frame.
- 2026-10-31 : `GLTFExtensionsPlugin` (3d-tiles-renderer) libère à sa fin un chargeur KTX2 même absent et lève alors une erreur : le
  construire avec `autoDispose: false` et libérer le chargeur Draco soi-même. Le plugin Google est dans `3d-tiles-renderer/core/plugins`
  (absent de `three/plugins`). Un test du moteur de tuiles remplace `fetch` (jamais de réseau) et lui envoie ses événements directement.

## Layer contracts

| ID | Subject | Reference file |
|---|---|---|
| APP-001 | Sécurité-visibilité : le réel reste visible (tête baissée, zone tapis) | `src/safety/visibility.ts` |
| APP-002 | La marche suit le parcours GPS de l'itinéraire choisi : en boucle pour les quatre figés, jusqu'à l'arrivée pour un trajet libre | `src/route/path.ts` |
| APP-003 | Bâtiments (extrait OpenStreetMap figé, ou chargés pour un trajet libre) et attribution | `src/city/licence.ts` |

## Style guide and recipes

- `docs/recipes/refactor-without-breaking.md` pour toute restructuration.
- `docs/recipes/run-locally.md` pour lancer l'application.

## Check

Depuis `app/`, après `npm ci` :

- `npm test` : tests Vitest ; la couverture se mesure par
  `npx c8 --check-coverage --lines 100 --branches 100 --functions 100 --statements 100 --all npm test`.
  Couverture différentielle (contrôle `coverage-diff-app`, diff-cover installé à part) :
  `npx c8 --reporter=cobertura --report-dir=coverage npm test && diff-cover coverage/cobertura-coverage.xml --compare-branch=origin/master --fail-under=100`
  (compare à `origin/master` : la branche principale n'est pas `main`, valeur par défaut de diff-cover).
- `npm run typecheck` : `tsc --noEmit` en mode strict.
- `npm run lint` : ESLint, zéro avertissement (`--max-warnings 0`).
- `npm run licenses` : licences des dépendances, liste autorisée.
- `npm run build` : typecheck puis build Vite, hors de la couche, dans le dossier dist/app de la racine (ignoré par
  Git) : sous app/, c8 compterait le bundle généré comme du code non couvert.

- `npm test -- -t "APP-001"` : les seuls tests du contrat APP-001 (contrôle `app-001`) ; de même `APP-002` (`app-002`) et `APP-003` (`app-003`).
- `npm run extract` : relance l'extraction Overpass du souk et réécrit `data/souq-waqif.json` (réseau, hors casque) ; le tracé `data/souq-waqif-boucle.json` est versionné à part (voir sa description) et un test vérifie que chacun de ses points est un sommet d'une voie de l'extrait.
- `npm run extract:fc-road` : de même pour FC Road à Pune (`data/pune-fc-road.json`, tracé `data/pune-fc-road-boucle.json`, aller-retour vérifié par le même test de sommets).
- `npm run extract:corniche` : de même pour la Corniche de Doha (`data/doha-corniche.json`, tracé `data/doha-corniche-boucle.json`, aller-retour versionné à part et vérifié par le même test de sommets).
- `npm run extract:pune` : de même pour la Vieille ville de Pune (`data/pune-vieille-ville.json`, tracé `data/pune-vieille-ville-boucle.json`, versionné à part et vérifié par le même test de sommets).
- Arbres du pack : `node -e "import('./scripts/prepare-nature-pack.ts').then(m=>m.prepareFiles(process.argv[1],'assets'))" "<archive>.zip"` relit l'archive Standard du pack (hors du dépôt, donnée non fiable : lue en mémoire, rien d'extrait ni d'exécuté) et réécrit `assets/quaternius-trees.json` et `assets/quaternius-licence.txt` ; le script n'a pas d'entrée npm (hors périmètre de la fiche) et son test vit dans `src/city/`.
- `npm run e2e` : Playwright (contrôle `e2e`, QUA-020) ; il lance lui-même Vite sur le port 5174 et injecte le Quest 3
  émulé (IWER) dans la page ; premier lancement : `npx playwright install chromium`. Résultats d'échec dans le
  dossier dist/e2e-results de la racine, hors de la couche. `e2e/ambiance-cartoon.test.ts` rejoue la marche avec et sans contours. Les captures de l'accueil (état par défaut, carte choisie) et de la marche à Pune, sur la Corniche et sur FC Road sont écrites dans
  dist/e2e-captures de la racine et publiées par la CI (artefact `captures-accueil`).

Depuis la racine, `node .githooks/run-checks.mjs` lance les contrôles déclarés dans `.drwil/ia-first.json`.
