# Closed projects journal

Condensed summary of each `docs/projects/` brief once its Status moves to
"done" (the whole brief, not just one point among several of a brief that
otherwise stays open). The detailed brief is then deleted: no more full
history in plain text in the repository, but nothing is lost —
`git log --follow -- docs/projects/<brief>.md` (or the closing commit/PR
cited below) retrieves the full text at any time.

Goal: keep `docs/projects/` light (active briefs only) without sacrificing
traceability, which stays in git anyway. See the recipe
`docs/recipes/working-with-branches.md`, "Closing" section.

One entry per closed project, most recent last.

## 2026-10-30 — Garantie : couverture de test de la couche `app`

- Socle de `app/` (TypeScript strict, Vite en HTTPS, Vitest, ESLint) et premier module de logique pure (vitesse), PR #3.
- Couverture par c8 autour de `npm test`, 100 % sur lignes, branches, fonctions et instructions, sans exclusion (contrôle `coverage-app`, contrat `QUA-004`) ; tests en threads et retrait natif des types pour que c8 mesure les vraies lignes.
- Couverture différentielle à 100 % contre `origin/master` (contrôle `coverage-diff-app`, diff-cover), exigée par drwil pour une couche `existing` ; diff-cover installé en CI.
- Contrôles `typecheck-app`, `lint-app`, `licenses-app` câblés ; `QUA-006` et `QUA-009` restent manuels (intentions ouvertes).
- Fiche de référence `docs/projects/socle-app.md` (décision humaine) : couvre les fichiers du socle de `app/`, qui sans elle n'auraient plus de fiche une fois les garanties closes (rappel de périmètre `QUA-016` bloquant).
- Branche `workstream/couverture-app`. Preuve de clôture : `docs/preuves/couverture-app.md`.

## 2026-10-30 — Garantie : test de bout en bout des chemins critiques

- Première tranche verticale (PR #4) : écran d'accueil, session `immersive-ar`, rue simple, marche à la vitesse réglée, joystick ±0,1 km/h, module safety (fondu tête baissée, opacité bornée).
- Test e2e Playwright avec Quest 3 émulé (IWER) des 3 chemins critiques : entrée en réalité mixte, marche et réglage de vitesse, fondu tête baissée au-delà de 25° (contrôle `e2e`, contrat `QUA-020`, les chemins critiques sont testés de bout en bout).
- Contrat `APP-001` (sécurité-visibilité : le réel reste visible) câblé au contrôle `app-001` ; la zone tapis, pas encore codée, reste à vérifier par l'humain sur le Quest 3 (attesté).
- Branche `workstream/e2e-chemins-critiques`. Preuve de clôture : `docs/preuves/e2e-chemins-critiques.md`.

## 2026-10-30 — Garantie : dépôt, forge, CI et protection de la branche principale

- Dépôt GitHub `wdubilly/drwil_walk` (branche par défaut `master`), CI GitHub `.github/workflows/ia-first.yml` (job `checks` qui rejoue `node .githooks/run-checks.mjs`), modèle de PR et empreinte des fichiers installés, PR #1 et #2.
- Protection de `master` posée par `npx drwil guarantees --protect` (fusion par PR, contrôles requis, sans contournement administrateur) : le contrat `QUA-017` (pas de travail direct sur la branche principale) est tenu ; carte `docs/architecture.md` citant `.github/workflows/` (`QUA-040`).
- `npx drwil guarantees` : « Versionnement : dépôt, forge github, CI et protection de `master` en place » ; `npx drwil verify --evidence` : `GOVERNANCE: PASS` (21 contrats, 15 PASS, 6 attestés).
- Branche `workstream/versionnement`. Preuve de clôture : `docs/preuves/versionnement.md`.

## 2026-10-31 — Un accueil lisible dans le casque, avec le choix d'itinéraire

- Accueil sombre à grandes cibles (48 px au moins) : feuille `app/src/ui/home.css`, quatre cartes d'itinéraire avec illustration SVG versionnée à côté du code (`app/src/ui/<id>.svg`), Pune Vieille ville choisie par défaut, choix d'un clic ou à la manette (boutons radio), les trois autres marqués « Bientôt » et non sélectionnables (leur ville n'existe pas encore) ; l'itinéraire choisi est lu et inscrit sur la page, la marche reste la rue simple.
- Contrat `QUA-014` (contraste du texte et de son fond) adopté depuis le catalogue : test `app/src/ui/contrast.test.ts` rejoué par le contrôle `coverage-app` ; les scripts du kit ne sont pas installés (hors périmètre) : intention `docs/intentions/controles-couleurs-kit.md`. Fondu de sécurité (`APP-001`) inchangé.
- L'e2e (`QUA-020`, chemins critiques de bout en bout) rejoue le choix d'itinéraire dans le Quest 3 émulé et prend les captures de l'accueil (défaut, carte « Bientôt », carte choisie) dans `dist/e2e-captures/` ; la CI les publie sous le nom `captures-accueil`. Reste humain : juger le rendu sur les captures, puis essai dans le vrai Quest 3.
- Intention `interface-accueil` couverte, retirée ; `autres-itineraires` mise à jour. Branche `workstream/accueil-casque`. Preuve de clôture : `docs/preuves/accueil-casque.md`.

## 2026-10-31 — Marcher dans le souk de Doha (Souq Waqif) en bâtiments OpenStreetMap

- Extrait OpenStreetMap figé et versionné (`app/data/souq-waqif.json` : 253 bâtiments et les voies du quartier, GeoJSON sous licence ODbL), produit par un script Overpass relançable et testé (`npm run extract`, `app/scripts/extract-souq.ts`) ; le casque ne fait aucun appel réseau. Tracé de la boucle d'environ 1,45 km (`app/data/souq-waqif-boucle.json`, place Al Koot, ruelle principale, écuries, retour), fait de sommets de voies de l'extrait (un test le vérifie).
- Ville : bâtiments extrudés (hauteur OSM, sinon niveaux, sinon 7 m) fusionnés en un seul maillage, sol ; la ville glisse et pivote sous l'utilisateur le long du tracé, direction lissée dans les virages. La rue de test disparaît ; le souk est le seul itinéraire disponible et celui par défaut, les trois autres restent « Bientôt ».
- Contrat `APP-002` (la marche suit le parcours GPS du souk, en boucle) et contrat `APP-003` (bâtiments de l'extrait et attribution OpenStreetMap, à l'accueil, dans le panneau de marche et sur un panneau de la scène effacé avec la ville), chacun avec son contrôle (`app-002`, `app-003`). Contrat `APP-001` (le réel reste visible) inchangé, rejoué dans le souk ; contrat `QUA-020` (chemins critiques de bout en bout) étendu d'un chemin : le souk, ses bâtiments, sa mention et la marche le long de la boucle.
- Limites, notées dans `docs/intentions/notes.md` : jamais essayé sur un vrai Quest 3 (72 images par seconde, lisibilité de la mention) ; tracé et extrait à relire par le demandeur (lot 1) ; environ 20 m de la boucle traversent des passages couverts dessinés comme des bâtiments par OpenStreetMap ; `MISSION.md` (hors périmètre) dit encore Pune par défaut.
- Branche `workstream/doha-souq-waqif`. Preuve de clôture : `docs/preuves/doha-souq-waqif.md`.

## 2026-10-31 — Marcher dans la Vieille ville de Pune (Shaniwar Wada → temple Dagdusheth)

- Extrait OpenStreetMap figé (`app/data/pune-vieille-ville.json` : 2 079 bâtiments et les voies du quartier, ODbL), produit par `npm run extract:pune` (`app/scripts/extract-pune.ts`, qui réutilise la fonction d'extraction du souk avec un autre cadre). Boucle d'environ 1,49 km (`app/data/pune-vieille-ville-boucle.json`) : plus court chemin sur les voies de l'extrait de Shaniwar Wada au temple Dagdusheth, retour par un chemin qui évite l'aller ; chaque point est un sommet de voie (un test le vérifie).
- Câblage du choix (lot 0) : `app/src/city/cities.ts` associe un identifiant d'itinéraire à sa ville et sa boucle, `app/src/xr/experience.ts` lit enfin l'itinéraire choisi à l'accueil ; un identifiant sans ville est une erreur dite (`QUA-002`, aucune erreur avalée en silence). La carte Pune Vieille ville passe à `available: true` ; le souk reste sélectionnable et par défaut.
- Contrats `APP-002` (la marche suit le parcours GPS de l'itinéraire choisi, en boucle) et `APP-003` (bâtiments de l'extrait et attribution) étendus à Pune ; `APP-001` (le réel reste visible) rejoué sur Pune ; `QUA-020` (chemins critiques de bout en bout) étendu d'un chemin 6 avec captures (`dist/e2e-captures/pune-*.png`).
- Limites : tracé calculé par l'agent (hypothèse de cadrage), à relire par le demandeur (lot 1) ; 2 041 bâtiments sur 2 079 sans hauteur OSM (7 m par défaut) ; jamais essayé sur un vrai Quest 3 (lot 4, 72 images par seconde avec 2 079 bâtiments fusionnés) ; l'itinéraire par défaut reste le souk alors que `MISSION.md` dit Pune.
- Branche `workstream/pune-vieille-ville` Preuve de clôture : docs/preuves/pune-vieille-ville.md (écrite par la clôture).

## 2026-10-31 — Marcher sur la Corniche de Doha (Musée d'art islamique → West Bay)

- Extrait OpenStreetMap figé (`app/data/doha-corniche.json` : 756 bâtiments, dont les tours de West Bay, et les voies, ODbL), produit par `npm run extract:corniche` (`app/scripts/extract-corniche.ts`, même fonction d'extraction que le souk avec un autre cadre). Tracé : aller-retour d'environ 4 km (`app/data/doha-corniche-boucle.json`), plus court chemin préférant les cheminements piétons, aller d'environ 2 km sur le front de mer, retour par le même chemin ; chaque point est un sommet de voie (un test le vérifie).
- Carte Doha Corniche à `available: true`, ville branchée dans `app/src/city/cities.ts`. Contrats `APP-002` (longueur de l'aller-retour entre 3,5 et 4,5 km) et `APP-003` étendus ; `APP-001` rejoué sur la Corniche ; `QUA-020` étendu d'un chemin 7 avec captures (`dist/e2e-captures/corniche-*.png`).
- Limites : le réseau de voies du musée n'est pas relié à celui de la Corniche dans l'extrait, le départ est le point relié le plus proche ; le tronçon de 2 km n'atteint pas West Bay (intention `docs/intentions/corniche-west-bay.md`) ; tracé calculé par l'agent, à relire par le demandeur (lot 1) ; 310 bâtiments sur 756 sans hauteur OSM (7 m par défaut) ; jamais essayé sur un vrai Quest 3 (lot 4, 72 images par seconde).
- Branche `workstream/doha-corniche`. Preuve de clôture : `docs/preuves/doha-corniche.md`.

## 2026-10-31 — Marcher sur FC Road à Pune

- Extrait OpenStreetMap figé (`app/data/pune-fc-road.json` : 1 427 bâtiments et les voies, ODbL), produit par `npm run extract:fc-road` (`app/scripts/extract-fc-road.ts`, même fonction d'extraction que le souk avec un autre cadre, de Ferguson College au carrefour de Jangli Maharaj Road). Tracé : aller-retour d'environ 3,5 km (`app/data/pune-fc-road-boucle.json`), plus court chemin préférant les voies principales, aller d'environ 1,76 km vers le sud, retour par le même chemin ; chaque point est un sommet de voie (un test le vérifie).
- Carte Pune FC Road à `available: true`, ville branchée dans `app/src/city/cities.ts` : les quatre itinéraires sont livrés. `renderRouteChoice` prend la liste des cartes en paramètre pour que la carte « Bientôt » reste testée. Contrats `APP-002` (longueur entre 3 et 4 km) et `APP-003` étendus ; `APP-001` rejoué sur FC Road ; `QUA-020` étendu d'un chemin 8 avec captures (`dist/e2e-captures/fc-road-*.png`), le chemin 2 vérifiant que plus aucune carte n'est « Bientôt ».
- Limites : tracé calculé par l'agent (hypothèse de cadrage : aller-retour par le même chemin, pas de rue parallèle), à relire par le demandeur (lot 1) ; 1 410 bâtiments sur 1 427 sans hauteur OSM (7 m par défaut) ; jamais essayé sur un vrai Quest 3 (lot 4, 72 images par seconde avec 1 427 bâtiments fusionnés).
- Branche `workstream/pune-fc-road`. Preuve de clôture : `docs/preuves/pune-fc-road.md` (écrite par la clôture).

## 2026-10-31 — Un mode d'emploi pour installer et utiliser drwil_walk avec un Quest 3

- Nouveau guide `docs/guide-utilisateur.md`, pour quelqu'un qui n'est pas développeur : prérequis (Node, poste et Quest 3 sur le même réseau), lancement (`cd app`, `npm ci`, `npm run dev`, exécutés avant d'être écrits), adresse Network dans le navigateur du Quest, certificat auto-signé, entrée en réalité mixte, itinéraire, vitesse, installation du tapis et sécurité (fondu tête baissée, `APP-001`), ennuis connus avec remède.
- `README.md`, `INSTALL.md` et `docs/recipes/run-locally.md` renvoient au guide sans en copier le contenu.
- Limite : tout ce qui se passe dans le casque (certificat, autorisation, manettes, réseau, pare-feu) est signalé « non vérifié » dans le guide ; relecture sur le vrai poste et le vrai Quest 3 par l'humain (lot 2 de la fiche), repris par l'intention `docs/intentions/relecture-guide-casque.md`. Le critère de sécurité reste attesté par l'humain (`APP-001`, sécurité-visibilité : le réel reste visible).
- Branche `workstream/guide-installation`. Preuve de clôture : docs/preuves/guide-installation.md (écrite par la clôture).

## 2026-10-31 — Une ville plus lisible et moins austère dans le casque

- Les voies de l'extrait OpenStreetMap (déjà versionnées, aucun nouvel appel réseau) sont dessinées à plat sur le sol (`app/src/city/roads.ts`) : un seul maillage, largeur selon la classe (grands axes 8 à 10 m, rues 4 à 5 m, sentiers 2 m, bretelles comme leur voie). Les bâtiments gardent un seul maillage mais en couleurs par sommet : un ton parmi quatre de la palette, choisi de façon déterministe par la position du premier sommet (`app/src/city/buildings.ts`). Une palette par itinéraire (sol, voies, tons de bâtiments) dans `app/src/city/cities.ts` ; `Souq` porte désormais `roads` et `palette`.
- `setCityOpacity` est inchangé et rend toujours toute la scène transparente (test sur les trois maillages) ; `scene.background` reste nul.
- Fiche : le critère « Aucun ciel ni fond opaque » a reçu `[humain]` pour que `verify` l'accepte (`APP-001` est attesté par l'humain) ; aucun autre critère modifié.
- Limites : rendu jamais vu au casque (teintes et largeurs choisies par l'agent, 72 images par seconde non mesurées), l'e2e émulé ne juge pas l'apparence ; voies de classe inconnue tracées à 2 m ; les palettes sont des choix de l'agent, à corriger par le demandeur (lot 3).
- Branche `workstream/rendu-ville`. Preuve de clôture : docs/preuves/rendu-ville.md (écrite par la clôture).

## 2026-10-31 — Le rendu photoréaliste Google 3D Tiles, en option

- L'accueil propose le rendu « OpenStreetMap » (par défaut, sans réseau) ou « Google 3D » (`app/src/ui/render-choice.ts`). Les tuiles viennent de `3d-tiles-renderer` 0.5.3 (Apache-2.0, aucune vulnérabilité propre ; les 32 avis `npm audit` visent l'outillage de développement, déjà présent), calées sur l'origine de la boucle (`app/src/city/google-tiles.ts`, `app/src/xr/google-mode.ts`).
- La clé vient de `VITE_GOOGLE_MAPS_API_KEY` (`.env.local` dans `app/`, jamais commitée ; `.env.example` ne porte qu'une valeur fictive). Sans clé, ou si le jeu de tuiles est refusé, la marche se fait en OpenStreetMap et la raison est dite à l'accueil (alerte à part du statut, clé masquée) : `QUA-002`.
- Le fondu efface les tuiles comme la ville OpenStreetMap, la scène garde `scene.background` nul (`APP-001`) ; la mention de Google s'ajoute à celle d'OpenStreetMap à l'accueil, dans le panneau et dans le casque (`APP-003`, texte du contrat adapté dans les termes de la fiche : plus de « aucun appel réseau » en rendu Google).
- Aucun test n'appelle Google : les tests unitaires remplacent `fetch` et injectent la fabrique de tuiles ; l'e2e (chemin 9, `app/e2e/google-3d.test.ts`, `QUA-020`) sert un jeu de tuiles factice par `page.route`, refuse tout autre hôte, et le serveur de test reçoit une clé fictive.
- Critères de la fiche : aucun ajusté. Le chemin 2 de l'e2e compte désormais les radios de l'itinéraire seulement (le choix du rendu en ajoute deux).
- Limites : jamais essayé avec une vraie clé ni au casque (couverture de Pune et de Doha, netteté, 72 images par seconde, hauteur du sol des tuiles, décodeur Draco chargé depuis le CDN de Google, conformité des mentions sans logo) ; l'e2e émulé ne juge pas l'apparence. Lots 1 et 4 laissés aux humains : intentions `docs/intentions/cle-google-couverture.md` et `docs/intentions/essai-casque-google.md`.
- Branche `workstream/google-3d-tiles`. Preuve de clôture : docs/preuves/google-3d-tiles.md (écrite par la clôture).

## 2026-10-31 — Choisir son propre itinéraire (carte ou adresse, chemin à pied calculé)

- L'accueil propose une cinquième carte « Itinéraire libre » : une carte légère à tuiles OpenStreetMap (sans bibliothèque, `app/src/ui/map-picker.ts` : Leaflet lit `window` à l'import, ce qui contredit l'injection testée sous happy-dom ; aucune dépendance ajoutée, `npm audit` et licences inchangés) ou des champs « Départ » et « Arrivée » (recherche d'adresse par l'API Google Geocoding, premier résultat retenu et affiché) posent les deux points, qui se remplissent mutuellement (`app/src/ui/free-trip.ts`). Le chemin à pied vient de l'API Google Routes (mode piéton, 5 km au plus, refus avant l'appel à vol d'oiseau et après sur la distance du chemin), avec **sa propre clé** `VITE_GOOGLE_ROUTES_API_KEY` (`.env.local`, jamais commitée, `.env.example` fictif, masquée dans tout message) sur laquelle Routes et Geocoding doivent être activés (`INSTALL.md`).
- Le trajet se prépare à l'accueil (`app/src/city/free-route.ts`) : chemin, puis bâtiments et voies OpenStreetMap proches du tracé (bande de 150 m, Overpass) ; la marche, elle, ne fait aucun appel. Si Overpass échoue, la marche reste possible sans bâtiments et le dit. Un tracé non bouclé (`Path.loop`) s'arrête à l'arrivée et le dit sur la page et dans le casque (`APP-002`) ; le rendu Google 3D reste au choix, `scene.background` nul et fondu sur tout (`APP-001`). Aucun point ni adresse n'est conservé.
- Sans clé Routes, ou en cas de refus, d'adresse introuvable, de saisie vide ou de trajet trop long, la raison est dite à l'écran (`QUA-002`) et les quatre itinéraires figés restent utilisables.
- Contrats : `APP-002` (boucle des quatre itinéraires figés, arrêt à l'arrivée d'un trajet libre) et `APP-003` (ville d'un trajet libre chargée, pas versionnée) adaptés comme déclaré à la fiche ; `QUA-020` reçoit le chemin 10 (`app/e2e/itineraire-libre.test.ts`, services factices servis par `page.route`) et le chemin 2 compte cinq cartes. Critères de la fiche : ajustés à la demande du demandeur (recherche d'adresse, raisons dites reliées à `QUA-002`) ; le périmètre s'étend à la configuration Playwright, `.env.example` et `INSTALL.md`.
- Limites (lot 4, humain) : jamais essayé avec une vraie clé, avec de vrais Overpass, Geocoding et Routes, ni sur un vrai Quest 3 (cadence avec des milliers de bâtiments, maniabilité de la carte à la manette, justesse du premier résultat d'une adresse). Intention `docs/intentions/essai-casque-itineraire-libre.md` ; intention `itineraire-libre` couverte, retirée à la clôture.
- Branche `workstream/itineraire-libre`. Preuve de clôture : docs/preuves/itineraire-libre.md (écrite par la clôture).

## 2026-10-31 — Des fournisseurs ouverts à la place de Google pour l'itinéraire libre

- Le trajet libre passe par deux interfaces, `Router` et `Geocoder` (`app/src/route/providers.ts`). Par défaut, sans clé : Valhalla (`app/src/route/valhalla.ts`, profil piéton, une requête GET, tracé décodé de la polyligne à 6 décimales) et Photon (`app/src/route/photon.ts`, une requête par validation d'adresse, aucune autocomplétion, géocodage inverse avec repli sur les coordonnées arrondies), instances publiques d'OpenStreetMap. Leurs adresses se règlent par `VITE_ROUTING_URL` et `VITE_GEOCODING_URL` (non secrètes, `.env.example`, `INSTALL.md`) pour viser une instance auto-hébergée. Google Routes et Geocoding (`app/src/route/routes-api.ts`, `app/src/route/geocoding.ts`) passent derrière les mêmes interfaces et remplacent les deux si `VITE_GOOGLE_ROUTES_API_KEY` est fournie (`app/src/route/create-providers.ts`).
- Un refus ou une limite d'un service public (429, autre code, panne) est dit à l'écran avec sa raison (`QUA-002`), les quatre itinéraires figés restent utilisables. Le rendu Google 3D reste au choix ; un refus 403 des tuiles évoque la restriction de l'EEA (`app/src/city/google-tiles.ts`, `INSTALL.md`). Le cas « trajet libre indisponible sans clé » disparaît : il n'y a plus de cas sans clé.
- Contrats : `APP-002` (le chemin du trajet libre vient du routage choisi, Valhalla par défaut) et `APP-003` (adresses de Photon, ville d'OpenStreetMap par défaut) adaptés comme déclaré à la fiche ; `QUA-020` : l'e2e du chemin 10 tourne sans aucune clé (clé Routes vidée dans `app/playwright.config.ts`, tout appel à Google fait échouer le test), avec un cas de service public qui limite les demandes. Couverture 100 %, aucun fichier au-delà de 200 lignes.
- Limites (lot 4, humain) : aucun appel réel à Valhalla ni à Photon n'a eu lieu ; leurs adresses publiques, leur accès inter-origines, le profil piéton à Pune et à Doha, la justesse du premier résultat et l'usage raisonnable sont des hypothèses de l'agent, non vérifiées ; les conditions d'usage de Nominatim, de Photon et de Valhalla n'ont pas été relues (le navigateur ne laisse pas fixer l'identification, l'instance voit l'origine de la page). Le fondu de sécurité sur un trajet libre reste à juger au casque (`APP-001`). Intentions nées de la clôture : `docs/intentions/essai-fournisseurs-ouverts.md`, `docs/intentions/auto-heberger-valhalla-photon.md`, `docs/intentions/relais-cles-google.md` ; l'intention `fournisseurs-ouverts` est couverte, retirée à la clôture.
- Branche `workstream/fournisseurs-ouverts`. Preuve de clôture : docs/preuves/fournisseurs-ouverts.md (écrite par la clôture).

## 2026-10-31 — Un rendu OpenStreetMap plus riche (teintes, ombrage, arbres, mobilier)

- L'extraction conserve `building:colour`, `roof:colour`, `building:material` et les nœuds `natural=tree`, `highway=street_lamp`, `amenity=bench` (`app/scripts/osm-tags.ts`) ; les quatre extraits sont ré-extraits (Overpass, plusieurs essais pour Pune et la Corniche) et le trajet libre lit les mêmes balises (`app/src/city/free-route.ts`).
- Rendu : un bâtiment prend sa couleur, sinon la teinte de son matériau (`app/src/city/tint.ts`), sinon un ton de la palette ; le toit a sa couleur propre ; les murs s'assombrissent vers le pied (ombrage par sommet, `app/src/city/buildings.ts`). Arbres instanciés (300 au plus) et mobilier fusionné (400 au plus), les plus proches du parcours d'abord (`app/src/city/props.ts`) ; tout est dans le groupe OpenStreetMap, donc effacé par le fondu (`APP-001`).
- Constaté : arbres 155 / 285 / 513 / 105 (souk, Vieille ville, Corniche, FC Road), bancs 19 et 8, aucun lampadaire ; presque aucune couleur ni matériau (7 matériaux au total) : la plupart des bâtiments gardent leur ton de palette.
- Contrats : `APP-003` complété (règle, source, preuve, tests), `QUA-020` (parcours 5 à 8 et 10 rejoués avec le rendu enrichi). Choix de l'agent : balises exactes du mobilier, formes simples, plafonds, teintes des matériaux et des arbres, ombrage à 55 % au pied.
- Limites (lot 5, humain) : jamais vu au casque, 72 images par seconde non mesurées, l'e2e émulé ne juge pas l'apparence (un test e2e a expiré une fois sous charge, puis passé) ; relief du sol non fait (`docs/intentions/osm-enrichi.md`). Intention `docs/intentions/essai-casque-osm-enrichi.md`.
- Branche `workstream/osm-enrichi`. Preuve de clôture : docs/preuves/osm-enrichi.md (écrite par la clôture).

## 2026-10-31 — Intention `autres-itineraires` retirée (entièrement livrée)

- Les quatre itinéraires de `MISSION.md` sont livrés : le souk de Doha, la Vieille ville de Pune, la Corniche de Doha et FC Road, chacun avec son extrait OpenStreetMap figé (`app/data/`) ; aucun n'est plus « Bientôt ».
- Reste de l'intention, sans objet propre : la relecture des itinéraires et leur essai sur un vrai Quest 3, déjà portés par `docs/intentions/essai-casque-itineraire-libre.md` et `docs/intentions/essai-casque-osm-enrichi.md`. Le parcours de la Corniche jusqu'à West Bay : `docs/intentions/corniche-west-bay.md`.

## 2026-10-31 — Dire la limite de vitesse

- Accueil : la plage « De 1 à 8 km/h, par sécurité sur le tapis. » est écrite sous le champ de vitesse ; une saisie hors plage (50) est ramenée à la borne et le message nomme la limite et la raison (`speedLimitMessage`, `app/src/route/speed.ts`), puis le champ se corrige à la sortie. La plage et le pas ne changent pas (`APP-002`, parcours GPS suivi à la vitesse réglée).
- Panneau de marche (page) : une ligne dit « Vitesse au maximum : 8 km/h, limite de sécurité sur le tapis. » (ou au minimum) tant que la vitesse est à une borne (`speedBoundMessage`). Choix de l'agent : texte exact, emplacement, affichage sans durée (`aria-live`, pas `role=status`, que les doublures de test prennent pour le statut d'entrée).
- Contrats : `QUA-002` (aucune erreur avalée en silence) respecté, aucune modification de `docs/contracts.md` ; `QUA-020` reçoit le chemin 11 (`app/e2e/vitesse-limite.test.ts` : 50 saisi, 8 retenu, limite annoncée).
- Limites : le message n'est pas dans la scène du casque et ne distingue pas une tentative du joystick d'une simple vitesse à la borne (état de marche hors périmètre) : intention `docs/intentions/limite-vitesse-casque.md`. Jamais vu au casque.
- Branche `workstream/vitesse-limite-dite`. Preuve de clôture : docs/preuves/vitesse-limite-dite.md (écrite par la clôture).
