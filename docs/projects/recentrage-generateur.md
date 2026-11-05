# Chantier : recentrer le produit sur le générateur d'itinéraire (accueil réduit, sans Google ni parcours libre)

**Statut** : cadré le 2026-11-05.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/recentrer-generateur-itineraire.md`, `docs/intentions/generateur-ville-complet.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/route/*
  - app/src/route/*.test.ts
  - app/src/ui/*
  - app/src/ui/*.test.ts
  - app/src/xr/*
  - app/src/xr/*.test.ts
  - app/src/pc/*
  - app/src/pc/*.test.ts
  - app/src/render/*
  - app/src/render/*.test.ts
  - app/src/main.ts
  - app/src/main.test.ts
  - app/scripts/*.ts
  - app/e2e/*
  - app/package.json
  - app/package-lock.json
  - app/playwright.config.ts
  - app/AGENTS.md
  - README.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/recipes/*
  - docs/intentions/*
-->

## 1. Besoin

Le produit se resserre sur un **générateur complet d'itinéraire** (décision du demandeur, 2026-11-05) : un accueil réduit à
l'itinéraire et à la vitesse, un seul rendu (OpenStreetMap), plus de parcours libre, plus de Google 3D (pas de licence). Les
préférences (qualité, ville vivante…) se règlent **pendant la marche** et se retiennent d'une marche à l'autre.

## Critères d'acceptation

- **Google 3D supprimé** : plus de code (`app/src/city/google-tiles.ts`, `app/src/xr/google-mode.ts`, choix de rendu de
  l'accueil, mention et crédit Google), plus de test ni de contrat qui le cite ; le rendu OpenStreetMap est le seul — `APP-003`
- **Parcours libre supprimé** : plus de recherche d'adresse ni de trajet libre (`app/src/ui/free-trip.ts`,
  `app/src/city/free-route.ts`, `app/src/route/geocoding.ts`, `app/src/route/routes-api.ts`, fournisseurs de trajets, e2e
  `itineraire-libre`), plus de clé ni de réseau à la marche ; la marche reste une boucle d'itinéraire — `APP-002`
- **Accueil réduit** : seuls l'itinéraire et la vitesse sont visibles ; poids, matériaux, lampadaires, ville vivante, arbres,
  brouillard, sons, côté et opacité du panneau, vignette n'y sont plus ; les préférences réglables en marche reprennent
  le dernier choix, sinon leur valeur initiale (qualité Équilibré). Les anciens réglages sont ignorés sauf le profil déjà
  mémorisé. Matériaux locaux, poids et vignette ne sont pas exposés comme préférences ; aucune calorie personnalisée
  calculée avec un poids supposé ne doit être présentée comme exacte — `APP-006`, `APP-008`, `APP-011`, `APP-012`, `APP-013`, `APP-014`
- **Préférences en marche** : l'utilisateur règle pendant la marche, sur Quest, PC et tablette, sans la quitter, les
  préférences retenues (qualité, ville vivante, lampadaires, arbres, brouillard, sons, côté et opacité du panneau) ; chaque choix devient son
  dernier choix, repris au départ de la marche suivante ; la première marche part des valeurs par défaut (qualité
  Équilibré) ; chaque changement s'applique à chaud, sans reconstruire la ville — `APP-006`, `APP-011`, `APP-013`, `APP-014`
- La **sécurité-visibilité ne bouge pas** : aucun niveau ni retrait d'option n'affecte le passthrough, et le changement de
  qualité en marche ne cache jamais le réel — `APP-001`
- Les e2e des chemins critiques sont **réécrits** pour le parcours réduit (sans Google ni parcours libre), pas supprimés — `QUA-011`
- Docs à jour : `README.md`, `app/AGENTS.md`, `docs/architecture.md`, `docs/features.md`, `docs/guide-utilisateur.md` ;
  `docs/contracts.md` : `APP-002` et `APP-003` perdent le trajet libre et Google, les contrats d'options de l'accueil sont relus
  — `QUA-011`

## Contrats modifiés

- `APP-002` (plus de trajet libre), `APP-003` (plus d'OpenStreetMap chargé pour un trajet, plus de mention Google), `APP-006`
  (profil réglé en marche et mémorisé), `APP-011`, `APP-012`, `APP-013`, `APP-014` (options sans case d'accueil).
- Les contrats de couverture e2e qui citent Google et le parcours libre sont réécrits.

## 2. Hors périmètre

- Le catalogue de promenades et la création « à la volée » (suites du générateur).
- La parité des plateformes (`docs/projects/parite-plateformes.md`) et l'inscription des villes : elles viennent après et
  partent de l'accueil réduit.
- Remettre un jour un parcours libre ou un rendu photoréaliste : autre intention.

## 3. Contraintes

- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`) : supprimer du code ne doit laisser
  ni test orphelin ni ligne non couverte.
- Retirer le code Google retire aussi les dépendances et mentions de licence devenues inutiles.
- Tout chantier touchant `app/` est HIGH ; `APP-001` reste testé.

## 4. Décisions

- 2026-11-05 : le demandeur autorise l'ajout au périmètre de `app/package-lock.json`, `app/playwright.config.ts` et
  `app/src/main.test.ts`, nécessaires au retrait complet des dépendances, de la configuration e2e et des branchements.

- 2026-11-05 : Google 3D est supprimé (code, tests, contrats).
- 2026-11-05 : le parcours libre est supprimé pour l'instant.
- 2026-11-05 : l'accueil ne garde que l'itinéraire et la vitesse.
- 2026-11-05 : les préférences se règlent en marche et le dernier choix est gardé pour la marche suivante (qualité
  Équilibré la première fois) ; pas de réglage avancé caché.
- 2026-11-05 : préférences réglables en marche : qualité, ville vivante (une seule, piétons et circulation ensemble),
  lampadaires, arbres, brouillard, sons, côté et opacité du panneau ; fixes : matériaux locaux, poids, vignette.
- 2026-11-05 : tout changement s'applique à chaud, sans reconstruire la ville.
- 2026-11-05 : les anciens réglages mémorisés sont ignorés, sauf le profil.
- 2026-11-05 : ce chantier passe avant la parité et l'inscription.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — retrait de Google 3D** [AI] : code, tests, contrats, mentions, docs. Sortie : build et tests verts, rendu
  OpenStreetMap seul.
- **Lot 2 — retrait du parcours libre** [AI] : écran, trajets, fournisseurs, e2e, contrats `APP-002`/`APP-003`. Sortie : build
  et tests verts.
- **Lot 3 — préférences en marche** [AI] : commande des préférences dans la marche sur les trois modes, mémorisation du dernier choix,
  première marche aux valeurs par défaut. Sortie : tests, `APP-001` vert.
- **Lot 4 — accueil réduit** [AI] : retrait des options, valeurs par défaut, e2e des chemins critiques réécrits. Sortie : e2e
  verts.
- **Lot 5 — docs** [AI] : `README.md`, `app/AGENTS.md`, architecture, fonctions, guide, contrats. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-05, Hand-off) : BUILD lu sur disque ; branche `chantier/recentrage-generateur` créée dans
  le dossier du projet, sans worktree. Aucun code modifié. Skills écran et refactor chargés ; contrats et intentions lus.
- **Preuve initiale** : `cd app && npm test -- src/ui/home.test.ts src/xr/experience.test.ts src/xr/experience-controls.test.ts src/xr/experience-pc.test.ts` :
  `Test Files 4 passed (4)`, `Tests 65 passed (65)`.
- **Blocage de périmètre** : le retrait complet demandé nécessite `app/package-lock.json` (dépendance
  `3d-tiles-renderer`), `app/playwright.config.ts` (configuration et mentions Google/parcours libre), et potentiellement
  `app/src/main.test.ts` (signature du point d'entrée). Ces trois fichiers ne sont pas couverts par le scope actuel ;
  le contrôle du périmètre compare chaque commit à la fiche dans son parent. Aucun élargissement ni contournement
  effectué ; aucun détour lancé, puisque le demandeur interdit de lancer un autre chantier.
- **Travail non commité** : cette fiche uniquement (formulation des choix repris et présent Hand-off).
- **Prochaine étape** : décision humaine, conservée par la session principale, sur l'ajout des fichiers directement
  couplés au scope, dans un commit de cadrage distinct avant implémentation. Les décisions produit sont déjà prises ;
  aucun nouveau point produit à trancher. Reprendre ensuite le lot 1 et les contrôles, sans `next`.
- **Non vérifié** : contrôles complets, couverture, build, typecheck, e2e, `verify`, clôture, push et fusion. Aucune PR créée.
