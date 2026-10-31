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
