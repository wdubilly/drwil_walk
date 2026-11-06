# Chantier : recentrer le produit sur le générateur d'itinéraire (accueil réduit, sans Google ni parcours libre)

**Statut** : en cours le 2026-11-05.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/recentrer-generateur-itineraire.md`, `docs/intentions/generateur-ville-complet.md`

<!-- scope
files:
  - .env.example
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
  - app/playwright.config.test.ts
  - app/AGENTS.md
  - README.md
  - INSTALL.md
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

- **Google 3D supprimé** : plus de fabrique de tuiles, mode Google, choix de rendu de l'accueil, mention ni crédit Google,
  plus de test ni de contrat qui le cite ; le rendu OpenStreetMap est le seul — `APP-003`
- **Parcours libre supprimé** : plus de recherche d'adresse, écran/préparation ni fournisseur de trajet libre,
  plus d'e2e spécifique, de clé ni de réseau à la marche ; la marche reste une boucle d'itinéraire — `APP-002`
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
  qualité en marche ne cache jamais le réel [human] — `APP-001`
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

- 2026-11-05 : le demandeur autorise `.env.example` pour retirer les variables Google et des services de parcours libre.

- 2026-11-05 : le demandeur autorise `INSTALL.md` pour retirer les instructions Google et parcours libre devenues obsolètes.

- 2026-11-05 : le demandeur autorise aussi `app/playwright.config.test.ts`, test directement lié à la configuration
  Playwright et aux variables Google retirées.

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

## 7. Reprise / Hand-off

### Livraison du 2026-11-06

- **État relu** : BUILD, branche `chantier/recentrage-generateur`, implémentation conservée sans réécriture.
- **Geste humain reçu** : essai Quest et attestation de sécurité-visibilité effectués par l'humain.
  `VITEST_MAX_WORKERS=1 npx drwil verify --agent` relancé : sortie **0**,
  **27 PASS, 7 ATTESTED, 0 FAIL, 0 ERROR, 0 MANUAL**, `GOVERNANCE: PASS`.
  Les attestations ne sont pas présentées comme des preuves automatiques.
- **Preuves** : 9 contrôles rejoués, 24 repris sur leurs fichiers inchangés ; cette reprise par contrôle
  ne constitue pas encore la preuve de clôture sur l'arbre entier.
- **Travail non commité** : implémentation, docs, attestation humaine et cette préparation de livraison.
- **Prochaine étape** : commit, transitions EVIDENCE puis VERIFY, `npx drwil verify --evidence`
  sur le commit livré, journal et clôture ; push/PR, fusion automatique autorisée et suivi jusqu'à fusion.
  Rester en CLOSING avant fusion ; aucun `next`, aucun nouveau chantier.

### Reprise du 2026-11-06, 07:44

- **État relu** : BUILD, branche `chantier/recentrage-generateur`, commit `b3da9ab`. Tout le travail sauvegardé
  reste non commité ; aucune réinitialisation, attestation, clôture, création de PR, poussée ou fusion effectuée.
- **Preuves actualisées** : `VITEST_MAX_WORKERS=1 node .githooks/run-checks.mjs` : sortie **0**,
  **747 tests / 121 fichiers passés**, couverture **100 %** des quatre mesures ; **9 contrôles rejoués,
  17 repris** car leurs fichiers sont inchangés. Les e2e ne sont donc pas annoncés comme rejoués ce matin.
  Un avertissement demeure : c8 laisse un élément dans son dossier temporaire.
  `git diff --check` : sortie **0**.
- **Verdict actuel** : `VITEST_MAX_WORKERS=1 npx drwil verify --agent` : sortie **1**,
  `GOVERNANCE: MANUAL REVIEW REQUIRED`. Seul critère non prouvé signalé : sécurité-visibilité,
  **APP-001 — Sécurité-visibilité : le réel reste visible**, avec attestation humaine requise.
  Aucun `GOVERNANCE: PASS` obtenu.
- **Arrêt sur besoin humain réel** : essayer sur un vrai Quest 3 la visibilité du tapis et les protections du
  nouveau panneau lors des changements de préférences, puis faire attester humainement APP-001.
  Les intentions d'essai citées ci-dessous portent déjà cette limite ; aucun nouveau chantier ouvert.
- **Après ce geste seulement** : reprendre les contrôles et obtenir `GOVERNANCE: PASS`, puis journal, clôture,
  commits et push/PR avec fusion automatique et suivi selon l'autorisation conservée. Ne pas passer en SCOPING
  avant la fusion ; ne pas lancer de chantier suivant.

- **État actuel (2026-11-05)** : BUILD, branche `chantier/recentrage-generateur`, même dossier partagé,
  travail antérieur préservé et toujours non commité ; aucun nouveau commit/push/PR, `b3da9ab` conservé.
  Aucun vrai fichier de secrets lu. `.env.example`, `INSTALL.md` et les ajouts autorisés sont intégrés.
- **Produit réalisé** : Google et parcours libre retirés du code, dépendances, tests et docs ; accueil itinéraire/vitesse.
  Huit préférences à chaud et mémoire sur Quest, PC et tablette, même ville et même marche.
  Nouvelles unités : `app/src/city/live-city.ts`, `app/src/ui/preferences.ts`,
  `app/src/ui/walk-preferences.ts`, `app/src/xr/live-preferences.ts`, `app/src/xr/preference-panel.ts`, leurs tests
  et les helpers e2e. Poids fixe 70 kg affiché comme référence approximative ; anciens réglages ignorés sauf profil.
- **Causes traitées sans contournement** : branches de rayon/placement, canvas indisponible, ressources multiples,
  chargement après arrêt et mémoire couverts ; code orphelin retiré. Test brouillard PC à chaud, sans deuxième ville.
  Budget commun des assemblages 20 s après dépassements sous c8. Scénarios Quest et calories à deux entrées :
  budget global 30 s épuisé, budgets locaux 60 s, assertions conservées ; stockage du poids ancien écrit une seule fois
  afin que les rechargements ne masquent pas un effacement.
- **Validation complète constatée** : `VITEST_MAX_WORKERS=1 node .githooks/run-checks.mjs` :
  **747 tests, 121 fichiers passés**, couverture **100 % lignes/instructions/branches/fonctions** ;
  couverture différentielle **145 lignes, 0 manquante, 100 %** ; **64 e2e passés (12.9m)** ;
  typage, lint et licences passés. Sortie **1** : seuls cinq liens contrat/test sans ID dans le nom échouaient
  (QUA-029). Corrigés depuis : `node .githooks/check-contract-tests.mjs` :
  **154 liens, 0 problème** ; tests concernés : `cd app && npm test -- src/ui/preferences.test.ts
  src/ui/walk-preferences.test.ts src/ui/home.test.ts --maxWorkers 1` : **3 fichiers, 10 tests passés**, sortie 0.
- **Autres résultats** : `cd app && npm run e2e -- tableau-de-bord.test.ts` : **2 passed (40.3s)** ;
  `cd app && npm run build` : sortie **0**, **121 modules**, avertissement Vite de paquet supérieur à 500 kB conservé.
  `git diff --check` : sortie **0** ; `node .githooks/check-docs.mjs` : **191 fichiers, 0 erreur** ;
  `node .githooks/check-file-size.mjs app 200 ts,tsx,js,jsx,mjs,cjs` : sortie **0**.
- **Blocage humain réel établi** : le contrôle `app-001` est `ok`, mais le contrat APP-001 est **MANUAL** :
  ancienne attestation invalide car sa règle a changé (nouveau panneau et réglages en marche).
  Le marqueur `[human]` du critère reflète son champ Manuel ; la règle et les tests ne sont pas affaiblis.
  L'essai au vrai Quest 3 puis son attestation restent humains ; limites consignées dans
  `docs/intentions/essai-casque-commandes-panneau.md`, `docs/intentions/essai-casque-zone-tapis.md` et
  `docs/intentions/essai-casque-profils-graphiques.md` (cadence, mémoire et préparation des trois variantes).
- **Prochaine étape** : verdict final des contrôles après correction des liens, puis arrêt sur le geste humain.
  Après essai/attestation humaine seulement : obtenir `GOVERNANCE: PASS`, commit français avec trailer,
  preuves sur HEAD, journal, clôture, push/PR et fusion automatique selon l'autorisation conservée.
  Aucun PASS, clôture, attestation, PR/fusion ni `next` annoncé ou effectué.

### Historique de la reprise précédente (22:27)

- **Dernier état** (2026-11-05, 22:27, Hand-off) : BUILD, branche `chantier/recentrage-generateur`, même dossier,
  sans worktree. Commit de cadrage conservé `b3da9ab`, aucun nouveau commit ni push. Les quatre fichiers additionnels
  autorisés figurent dans le scope et les décisions ; aucune réautorisation de ces fichiers n'est nécessaire.
- **Travail conservé et complété, non commité** : injection des images des matériaux par le document fourni
  (cause `document is not defined` corrigée sans désactiver les matériaux), test de configuration Playwright sans
  clés, quatre cartes, palette CSS centralisée, styles des préférences disponibles aussi sur PC, correction du lint.
  Les variantes préparées donnent désormais le relevé du profil actif, et les figurants signalent leur état après
  chargement. Les e2e Google et parcours libre ont été retirés ; leurs chemins encore utiles sont remplacés par
  les itinéraires embarqués et les préférences à chaud. Nouveaux helpers e2e pour les derniers choix et pour pointer
  réellement les commandes Quest (gâchette gauche puis rayon et prise droite).
- **Preuves de cette reprise** :
  - `cd app && npm test` : `Test Files 10 failed | 108 passed (118)`, `Tests 27 failed | 714 passed (741)` :
    trois attentes d'accueil corrigées ensuite, le reste était des délais sur la machine chargée.
  - `cd app && npm test -- --maxWorkers 1` : `Test Files 1 failed | 117 passed (118)`,
    `Tests 2 failed | 739 passed (741)` ; les deux échecs étaient des délais de 5 s, sortie dans
    `dist/recentrage-tests.log`. Une seule commande lourde à la fois.
  - `cd app && npm test -- src/xr/experience.test.ts --maxWorkers 1` : `Test Files 1 passed (1)`,
    `Tests 19 passed (19)` (rejeu des deux délais précédents compris).
  - `cd app && npm test -- src/xr/experience-preferences.test.ts --maxWorkers 1` :
    `Test Files 1 passed (1)`, `Tests 2 passed (2)`.
  - `cd app && npm run typecheck` : sortie 0 ; `cd app && npm run lint` : sortie 0 ;
    `cd app && npm run build` : sortie 0, 121 modules transformés, avertissement Vite de taille de paquet
    (non masqué). Ces commandes précèdent les toutes dernières adaptations e2e/diagnostics.
  - `cd app && npm run e2e -- eclairage-ambiance.test.ts profils-graphiques.test.ts panneau-discret.test.ts` :
    `1 failed`, `9 passed (1.8m)`, détails `dist/recentrage-e2e.log`. Toutes les interactions à chaud du scénario
    Quest ont fonctionné (brouillard, sons, ville vivante, arbres, opacité, côté, trois profils, fondu) ;
    le scénario dépasse ensuite ses 30 s à la réentrée après rechargement. Découper le scénario ou lui donner
    un budget correspondant à ses nombreux gestes, sans retirer d'assertion.
- **Nouveau besoin humain de périmètre, vérifié** : `INSTALL.md` (lignes 25–42) documente encore l'activation de
  Google 3D, les clés, Valhalla/Photon et le trajet libre. Ce document suivi est absent du scope. Le retrait complet
  demandé et la cohérence documentaire exigent sa mise à jour ; il n'a pas été modifié. Arrêt conformément à
  l'instruction « autre besoin humain arrêter avec rapport ». Ce n'est pas une réautorisation des quatre ajouts.
- **Prochaine étape** : autoriser `INSTALL.md`, enregistrer ce cadrage par l'outil documenté si un rafraîchissement
  du scope est nécessaire (jamais écrire l'état à la main), puis poursuivre les e2e restants :
  lampadaires, tableau de bord (poids désormais fixe), tactile ; terminer docs/contrats et les preuves de budgets
  des variantes. Ajouter les tests unitaires des rayons/préférences Quest et atteindre la couverture 100 %.
- **Non vérifié** : suite complète verte, couverture, e2e complets, contrôles finaux et `verify`, journal, clôture,
  PR, push et fusion. Aucun `GOVERNANCE: PASS` obtenu ; pas de clôture ni d'auto-fusion ni de `next`.
  L'essai au vrai Quest demeure humain.
