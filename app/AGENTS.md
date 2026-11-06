# app layer context

Read `../AGENTS.md` first. Contracts live in `docs/contracts.md` : cite their ID, do not duplicate them.

## Context

Couche unique TypeScript strict + Vite HTTPS + three.js. WebXR `immersive-ar` sur Quest 3, version écran au clavier,
à la souris ou au toucher. Carte : `docs/architecture.md`, comportement : `docs/features.md`.
Tout chantier qui touche cette couche est HIGH (risque physique de chute).

- Accueil : quatre itinéraires embarqués et vitesse, démarrages Quest/PC et rappel de sécurité.
- Un seul rendu OpenStreetMap, aucune clé ni fournisseur de trajet/tuiles. Aucun appel distant pendant la marche.
- Préférences **en marche** sur Quest, PC et tablette : profil, ville vivante (une seule commande), lampadaires,
  arbres, brouillard, sons, côté/opacité du panneau. Application à chaud sans reconstruire la ville ;
  `src/city/live-city.ts` prépare les variantes, `src/xr/live-preferences.ts` les applique.
- Mémoire validée dans `src/ui/preferences.ts`, premier profil Équilibré partout, seul l'ancien profil est migré.
- Matériaux locaux, poids 70 kg et vignette fixes ; calories approximatives pour 70 kg, pas une mesure personnelle.
- Quest : gâchette gauche ouvre les préférences, rayon/prise droite change une ligne (`src/xr/preference-panel.ts`).
  Les autres commandes gauches gardent la zone tapis. Les préférences s'effacent tête baissée comme la ville.
- PC/tablette : boutons dans « Préférences de marche » (`src/ui/walk-preferences.ts`), marche continue.
- Sécurité inchangée : fondu tête baissée, zone tapis transparente, vignette toujours active (APP-001).
- Les figurants CC0 viennent d'un catalogue en données, actifs au Souq Waqif seulement (APP-014) ;
  lampadaires produits distingués du mobilier OSM (APP-013), lanternes/halos sans effet sur l'alpha (APP-011).
- Génération `npm run city` sur **PC de développement uniquement**, jamais dans le casque.
  Description des villes dans `data/villes.json`, pas de code ni de commande par ville ;
  `scripts/create-city.ts` écrit extrait, boucle et matériaux. Le catalogue est la source unique : `src/city/cities.ts` et la liste d'accueil le lisent, la palette se déduit de la région (`app/src/city/region-palette.ts`), une ville créée apparaît à l'accueil sans code.

## Conventions techniques

- `src/` : `city/`, `route/`, `render/`, `xr/`, `safety/`, `ui/`, `pc/`. Calculs purs séparés du rendu.
- Itinéraires GPS en données. Vitesse derrière `SpeedSource`, réglage manuel.
- Tests `*.test.ts` près du code, e2e dans `e2e/`.
- Imports relatifs avec extension .ts, syntaxe effaçable Node (`erasableSyntaxOnly`).
- Tests DOM : happy-dom avec document injecté, sans globals ; vrai renderer branché seulement dans `src/main.ts`.
- Extraits JSON importés avec attribut de type JSON ; mocks réseau dans les tests de génération.
- Modèles/texture embarqués, provenance dans `assets/PROVENANCE.md`, secrets jamais dans le dépôt.
- Aucun fichier exclu de couverture, configurations comprises.

## Test pitfalls

- c8 ne reçoit pas la couverture de forks terminés par signal : garder Vitest `pool: "threads"`.
- Garder `experimental.viteModuleRunner: false` : sinon les positions de branches c8 sont décalées.
- Le point d'entrée s'exécute à l'import : stubber `document` et `navigator`, importer dynamiquement.
- Poser `setAnimationLoop` avant `xr.setSession`, ignorer les images XR sans frame :
  sinon three.js fait tourner aussi sa boucle de page.
- IWER applique axes/boutons à l'image suivante. Tenir, observer, relâcher et laisser des images entre fronts.
  Droite : gâchette 0, prise 1, A 4, B 5 ; gauche : gâchette 0, prise 1, X 4, Y 5.
  Préférences : helper `e2e/quest-preferences-helper.ts`, rayon réellement orienté vers la ligne, pas de proxy DOM.
- SwiftShader peut produire seulement environ 30 images par 5 s sur une ville dense. Les attentes dépendantes
  des frames utilisent 20 s ; le scénario Quest de nombreuses préférences et réentrée a un budget global de 60 s
  (35,7 s observées), sans retirer d'assertion ni ralentir la marche.
- E2e PC sans IWER, zéro `requestSession` ; clavier sur document, glisser sur `.pc-canvas`.
  Tablette avec `hasTouch`, `isMobile`, viewport et CDP `Input.dispatchTouchEvent` hors du panneau.
- Une seule commande lourde à la fois sur poste partagé, ne jamais arrêter un processus tiers.
- Les tests d'assemblage préparent désormais trois variantes par départ : budget de 20 s posé dans la doublure
  commune (dépassements de 5 s reproduits sous c8, y compris préférences). Aucun scénario ni assertion retiré ;
  `VITEST_MAX_WORKERS=1` limite la charge de la validation sur poste partagé.

## Recettes et contrats

Recettes : `docs/recipes/add-a-frontend-screen.md`, `docs/recipes/refactor-without-breaking.md`,
`docs/recipes/run-locally.md`. Contrats de la couche : APP-001 à APP-009 (hors APP-010),
APP-011 à APP-014 et QUA-014 ; titres/détails par `.githooks/glossary.mjs`.

## Check

Depuis `app/`, après installation :

- `npm test` : Vitest.
- `npx c8 --check-coverage --lines 100 --branches 100 --functions 100 --statements 100 --all npm test` :
  couverture 100 % sans exclusion.
- `npx c8 --reporter=cobertura --report-dir=coverage npm test && diff-cover coverage/cobertura-coverage.xml --compare-branch=origin/master --fail-under=100` :
  couverture différentielle contre la branche principale.
- `npm run typecheck`, `npm run lint` (zéro avertissement), `npm run licenses`, `npm run build` (sortie `../dist/app/`).
- `npm test -- -t "APP-001"` : contrat sécurité ; même sélecteur pour les autres IDs de la couche.
- `npm run e2e` : Playwright/IWER, Vite HTTPS port 5174, un worker ; premier lancement `npx playwright install chromium`.
  Résultats `../dist/e2e-results/`, captures `../dist/e2e-captures/`, hors couverture.
- `npm run city -- souq` : régénération hors casque, réseau nécessaire, réécrit les données ;
  ne pas lancer pour valider les tests. Arguments/source : `docs/guide-utilisateur.md`.
- Préparation locale des arbres, depuis une archive externe lue en mémoire :
  `node -e "import('./scripts/prepare-nature-pack.ts').then(m=>m.prepareFiles(process.argv[1],'assets'))" "<archive>.zip"`.

Depuis la racine : `node .githooks/run-checks.mjs`, puis `npx drwil verify --agent`.
Seul le verdict `GOVERNANCE: PASS` permet de dire « vérifié » ; casque réel et attestations restent humains.
