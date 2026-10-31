# Contracts (single source of invariants)

**Single source of the project's invariants.** Other documents
(`AGENTS.md`, layer `AGENTS.md` files, recipes, skills) cite a contract by
its ID and do not copy its rule.

A **contract** is an invariant of the product or the code whose violation
can be objectively observed (in the repo or at runtime). It has a stable ID
(never reassigned, even once removed), a normative rule, a scope, a source
of truth (the code that implements it), a proof and a reason. Principle:
**a contract that matters is machine-checked**; a **human** proof is
flagged as such: it's the next check to tool up.

Where the checks run: pre-commit hook (`.githooks/run-checks.mjs`, to
enable once per clone with `git config core.hooksPath .githooks`) and CI
if configured.

This registry only holds the **baseline** installed by default and the
contracts specific to this project. `docs/contracts-catalog.md` offers
other generic contracts, not yet adopted (see
`docs/recipes/adopt-the-kit.md`).

Verifiable proof (`drwil verify`, see `docs/ia-first.md`, section 5):
`**Check**` names, in backticks, the identifier of a check known to the
engine (`.githooks/engine.mjs`, or the `id` of a check in
`.drwil/ia-first.json` → `checks`); the command is never copied here.
`**Manual**` describes the part of the proof that stays human. At least one
of the two, plus a **Rule**; an unknown check is an error. A contract still
in table form (legacy) is still read, but without a Check it is never
proven (`MANUAL`).
`**Covers**` (optional) lists, in backticks, the path patterns of what the
contract judges: an attestation falls when a file under them changes
(`docs/ia-first.md`, validity rule).
`**Severity**` (optional): `blocking` (default), `warning` or `advisory`.
Only blocking contracts decide the `drwil verify` verdict; the others are
run and shown without changing its exit code.
`**Origin**` (optional): the workstream and the acceptance criterion the
contract was born from (`**Origin**: <workstream> — « <criterion> »`). When
its check fails, `drwil verify` shows it: the failure breaks that criterion,
a regression unless the active brief declares the change (« Modified
contracts » section).

## Security (SEC)

## SEC-006 — No known vulnerable dependency
**Rule** : No dependency with a known vulnerability.
**Scope** : project dependencies
**Source of truth** : dependency manifest (e.g. package.json, requirements.txt)
**Proof** : audit declared by the project (`.drwil/ia-first.json` → `checks`), hook + CI
**Reason** : a vulnerable library voids the rest
**Manual** : no dependency audit declared: add one in `.drwil/ia-first.json` → `checks` (with an `id`), then cite it here as **Check**.

## SEC-007 — No secret in the repo
**Rule** : No secret in the repo (`.env`, keys, passwords, client configs).
**Scope** : the whole repo and its history
**Source of truth** : —
**Proof** : gitleaks: indexed files (hook, if installed) + full history (CI job, if configured)
**Reason** : an irreversible leak once pushed
**Check** : `secrets`


## SEC-012 — Licences des dépendances compatibles
**Rule** : la licence de chaque dépendance est compatible avec celle du projet ; aucun copyleft fort introduit sans revue explicite.
**Scope** : les dépendances de `app/`
**Source of truth** : `app/package.json` (script `licenses` : liste des licences autorisées)
**Proof** : license-checker-rseidelsohn avec `--onlyAllow` (licences permissives et MPL-2.0, copyleft faible ; aucun copyleft fort), paquet privé de l'application exclu, au commit, en CI et par `drwil verify`
**Reason** : une dépendance mal licenciée peut interdire de distribuer l'application
**Check** : `licenses-app`

## Quality (QUA)

## QUA-001 — Un fichier de code ne dépasse pas 200 lignes
**Rule** : aucun fichier de code ne dépasse 200 lignes ; un fichier déjà au-dessus à l'adoption est plafonné à sa taille actuelle (il ne peut que diminuer).
**Scope** : le code de `app/`
**Source of truth** : —
**Proof** : `.githooks/check-file-size.mjs`, plafonds hérités dans `.githooks/check-file-size.legacy.json`
**Reason** : un petit fichier se lit en entier par un humain comme par une IA
**Check** : `file-size`

## QUA-002 — Aucune erreur avalée en silence
**Rule** : aucun bloc `catch` vide ni promesse rejetée non traitée : l'erreur est au minimum journalisée, propagée quand c'est pertinent.
**Scope** : le code de `app/`
**Source of truth** : `app/eslint.config.js`
**Proof** : ESLint (`no-empty`, `@typescript-eslint/no-floating-promises`), au commit, en CI et par `drwil verify` ; le test `app/eslint.config.test.ts` garde ces règles actives
**Reason** : une erreur avalée dans la boucle XR masque une panne au moment où l'utilisateur marche
**Check** : `lint-app`

## QUA-004 — Couverture de test à 100 % de la couche app
**Rule** : la couverture de test de la couche `app/`, mesurée par c8 autour de `npm test` (Vitest), est de 100 % en lignes, branches, fonctions et instructions, sans aucune exclusion de fichier (configuration et point d'entrée compris).
**Scope** : tout le code de `app/` (hors `node_modules/` et fichiers de test)
**Source of truth** : le contrôle `coverage-app` de `.drwil/ia-first.json`, écrit par `npx drwil guarantees`
**Proof** : c8 `--check-coverage` à 100 % sur les quatre mesures, avec `--all` (un fichier jamais importé par un test compte à 0 %), et 100 % des lignes ajoutées ou modifiées par rapport à `origin/master` (diff-cover sur le rapport Cobertura de c8), au commit, en CI et par `drwil verify`
**Reason** : garantie obligatoire du kit (`catalog:QUA-004`) ; sans casque pour déboguer, chaque ligne doit avoir été exécutée par un test. Limite : 100 % prouve que chaque ligne est exécutée, pas qu'elle est juste.
**Origin** : couverture-app — « Le contrôle de couverture de la couche `app` est déclaré, cité par le contrat de couverture du projet et vert à 100 % »
**Check** : `coverage-app`, `coverage-diff-app`

## QUA-005 — Typage strict
**Rule** : TypeScript en mode `strict`, aucun `any` injustifié.
**Scope** : le code de `app/`
**Source of truth** : `app/tsconfig.json` (mode `strict`), `app/eslint.config.js` (`no-explicit-any`)
**Proof** : `tsc --noEmit` en mode strict (contrôle `typecheck-app`) et ESLint `@typescript-eslint/no-explicit-any` (contrôle `lint-app`) : un `any` n'existe que derrière une désactivation justifiée (QUA-008)
**Reason** : le typage attrape les erreurs avant le casque, où déboguer est difficile
**Check** : `typecheck-app`, `lint-app`

## QUA-006 — Un module de logique pure a son test à côté
**Rule** : chaque module de logique pure (sans effet de bord) a son fichier `*.test.ts` juste à côté.
**Scope** : le code de `app/`
**Source of truth** : —
**Proof** : script ou règle de lint listant les modules sans test voisin
**Reason** : la logique de vitesse, d'opacité et de trajectoire reste testable sans casque
**Manual** : aucun outil prêt dans la stack de `app/` (constaté au chantier couverture-app, 2026-10-30) : revue humaine d'ici là ; script à écrire, intention `docs/intentions/test-voisin-module-pur.md`. Une fois écrit : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

## QUA-007 — Lint sans avertissement
**Rule** : le lint ne tolère aucun avertissement.
**Scope** : le code de `app/`
**Source of truth** : `app/eslint.config.js`, script `lint` de `app/package.json`
**Proof** : ESLint avec `--max-warnings 0` et `reportUnusedDisableDirectives: "error"`, au commit, en CI et par `drwil verify`
**Reason** : un avertissement toléré finit en dette invisible
**Check** : `lint-app`

## QUA-008 — Toute suppression de type est justifiée
**Rule** : chaque `@ts-ignore`, `@ts-expect-error` ou `as any` est accompagné d'un commentaire qui en donne la raison.
**Scope** : le code de `app/`
**Source of truth** : `app/eslint.config.js`
**Proof** : ESLint : `@typescript-eslint/ban-ts-comment` (description obligatoire, 10 caractères au moins), `@typescript-eslint/no-explicit-any` (un `as any` exige une désactivation) et `@eslint-community/eslint-comments/require-description` (toute désactivation porte sa raison) ; le test `app/eslint.config.test.ts` garde ces règles actives
**Reason** : une suppression sans raison cache un vrai défaut de type
**Check** : `lint-app`

## QUA-009 — Un test désactivé cite la fiche qui le justifie
**Rule** : un test désactivé (`skip`, `todo`) cite l'ID d'une fiche ouverte de `docs/projects/` qui justifie sa désactivation (QUA-019 appliqué aux tests).
**Scope** : le code de `app/`, `docs/projects/`
**Source of truth** : —
**Proof** : script listant les tests désactivés sans fiche citée à côté
**Reason** : un test éteint en silence est un contrôle contourné
**Manual** : aucun outil prêt dans la stack de `app/` (constaté au chantier couverture-app, 2026-10-30) : revue humaine d'ici là ; script à écrire, intention `docs/intentions/test-desactive-cite-fiche.md`. Une fois écrit : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

## QUA-011 — Docs never wrong
**Rule** : Every repo path and every contract ID cited in the docs and the skills exist (IDs defined exactly once in the registry).
**Scope** : `AGENTS.md`, layer `AGENTS.md` files, `docs/`, `.claude/skills/` (if present)
**Source of truth** : —
**Proof** : `.githooks/check-docs.mjs` (hook + CI)
**Reason** : wrong docs mislead AIs
**Check** : `docs-references`

## QUA-013 — A check that did not run has not passed
**Rule** : No check can disappear without it being visible. A check that cannot run on a workstation (missing tool) is only ever a warning, never a silent success. A degradable check must also have a CI job triggered on the same paths (verified, not just assumed).
**Scope** : the checks in `.githooks/run-checks.mjs`
**Source of truth** : `.githooks/run-checks.mjs`, `.githooks/check-control-coverage.mjs` and its run history
**Proof** : **machine**: every check ends up "failed", "OK" or "not run", never hidden; CI coverage is replayed (hook + CI, if there is a CI)
**Reason** : a check that can silently not run is, eventually, a check that proves nothing
**Check** : `ci-coverage`

## QUA-015 — Projects resumable cold
**Rule** : Projects resumable cold: every open item in the project index carries an `[AI]`, `[human]` or `[decision]` marker; every brief in `docs/projects/` and `docs/intentions/` (excluding the index and README) has a dated "Status" line at the top (YYYY-MM-DD); every intent brief has "Need", "Current state" and "Open questions" sections; every brief has a "Hand-off" section (handoff). Extension: an index item that cites a brief whose "Status" contains `done`/`closed`/`terminé` must be checked, and vice versa (non-blocking warning).
**Scope** : `docs/projects/`, `docs/intentions/`
**Source of truth** : `docs/ia-first.md` (section 7)
**Proof** : `.githooks/check-docs.mjs` (hook + CI); accuracy of status and content: **human**
**Reason** : an agent picks up a project cold: without status or marker, it redoes the work, attempts a human gesture or decides in the requester's place
**Check** : `docs-references`
**Manual** : accuracy of the briefs' status and content.

## QUA-016 — Scoping reminder
**Rule** : Scoping reminder: every indexed code file is covered by the `scope` block of a brief in `docs/projects/`; a malformed block (no `files:` line, too broad a pattern) is rejected. `docs/` and any markdown file are never code. Severity configurable per project (`.drwil/ia-first.json` -> `scopeReminder`: `blocking` by default, refused at commit and, with Claude Code, before the write; `warning` to only report; `off` to disable). Outside the `blocking` setting, this contract is not proven: add a Manual field to it.
**Scope** : the whole repo (indexed files), excluding `docs/` and markdown
**Source of truth** : `.githooks/scope.mjs`, `docs/ia-first.md` (section 7)
**Proof** : `.githooks/check-docs.mjs` (hook + CI, severity per setting); agent side: `.claude/hooks/scope-reminder.mjs` (if present: refusal before the write when `blocking`, reminder when `warning`, silent when `off`)
**Reason** : code detached from any project gets lost, for an agent as much as for a person
**Check** : `docs-references`

## QUA-017 — No direct work on the main branch
**Rule** : No direct work on the main branch: committing or pushing directly to `master`/`main` is refused, including the very first commit. `init()` always switches to a working branch before any commit, with no configurable opt-out. Work must go through a branch (`docs/recipes/working-with-branches.md`) merged via a pull/merge request.
**Scope** : any git repository, including before its very first commit, local only (`pre-commit`/`pre-push`)
**Source of truth** : `docs/recipes/working-with-branches.md`
**Proof** : `.githooks/run-checks.mjs` (hook only, never in CI: a legitimate merge onto the main branch must not be blocked retroactively)
**Reason** : a direct commit or push to the main branch bypasses review and breaks the brief-branch link
**Check** : `main-branch`

## QUA-019 — No bypassing a check
**Rule** : A blocking check (test, hook, CI) is never disabled, skipped (`--no-verify`, skip, exception flag) or bypassed to make a task progress. If it seems miscalibrated, flag it and fix the check itself (or open a decision brief), never disable it silently.
**Scope** : any check in `.githooks/`, any CI, any test
**Source of truth** : this contract (recalled in `AGENTS.md`)
**Proof** : **human** — a bypass rarely leaves a machine-checkable trace (see `catalog:QUA-009` for the tooled case of a disabled test)
**Reason** : bypassing a check silently hides a regression, the opposite of QUA-013
**Manual** : a bypass rarely leaves a machine-checkable trace.

## QUA-020 — Les chemins critiques sont testés de bout en bout
**Rule** : les chemins critiques nommés par le demandeur sont rejoués de bout en bout dans Chromium avec un Meta Quest 3 émulé (IWER) : (1) de l'accueil à l'entrée en réalité mixte, session `immersive-ar` ; (2) à l'accueil, quatre cartes d'itinéraire figé et la carte « Itinéraire libre », toutes sélectionnables (aucune « Bientôt »), et l'itinéraire choisi est celui qui démarre ; (3) la marche avance à la vitesse réglée et le joystick droit change la vitesse de ±0,1 km/h ; (4) tête baissée au-delà de 25°, la ville devient transparente (APP-001) ; (5) le souk de Doha est le parcours par défaut, démarre depuis l'accueil, montre ses bâtiments OpenStreetMap et la mention d'attribution (APP-003), et la position avance le long de la boucle (APP-002) ; (6) la Vieille ville de Pune se choisit à l'accueil, démarre sur sa propre ville et sa propre boucle, avec les mêmes garanties (APP-001, APP-002, APP-003), (7) la Corniche de Doha se choisit à l'accueil, démarre sur sa propre ville et son propre aller-retour, avec les mêmes garanties (APP-001, APP-002, APP-003), (8) FC Road à Pune se choisit à l'accueil, démarre sur sa propre ville et son propre aller-retour, avec les mêmes garanties (APP-001, APP-002, APP-003) ; (10) l'itinéraire libre se choisit à l'accueil ; départ et arrivée se posent par une adresse cherchée ou en touchant la carte (les champs se remplissent mutuellement), le chemin à pied est calculé, la marche le suit et s'arrête à l'arrivée en le disant, la raison d'un échec (adresse introuvable, trajet non préparé, service public qui limite ou refuse les demandes) est dite à l'écran et les itinéraires figés restent utilisables, le tout SANS AUCUNE CLÉ et avec routage (Valhalla), adresses (Photon), bâtiments et tuiles de carte factices servis par le test, tout appel à Google faisant échouer le test (APP-001, APP-002, APP-003, QUA-002) ; (9) le rendu Google 3D se choisit à l'accueil (la mention de Google s'ajoute à celle d'OpenStreetMap) et affiche, sur un jeu de tuiles factice servi par le test, des tuiles alignées sur la boucle du souk ; tête baissée la ville s'efface (APP-001) ; si le jeu de tuiles est refusé, la marche se fait en OpenStreetMap et la raison est dite à l'écran (QUA-002), sans qu'aucune requête n'atteigne Google ; des captures d'écran des parcours de Pune, de la Corniche et de FC Road sont publiées ; les parcours (5) à (8) et (10) se rejouent avec le rendu enrichi (extraits porteurs d'arbres, de mobilier et de balises de teinte).
**Scope** : l'application de `app/`, servie par Vite, vue comme l'utilisateur la voit (page, boutons, panneau de marche)
**Source of truth** : `app/e2e/chemins-critiques.test.ts`, `app/e2e/google-3d.test.ts` et `app/e2e/itineraire-libre.test.ts`, configurés par `app/playwright.config.ts` (clés Google fictives pour le serveur de test, clé Routes vidée)
**Proof** : Playwright, au commit, en CI (navigateur Chromium installé par le job) et par `drwil verify` ; un chemin qui ne s'exécute pas fait échouer le contrôle, jamais un « passé »
**Reason** : garantie obligatoire du kit (`catalog:QUA-020`) ; la couverture à 100 % prouve que chaque ligne est exécutée, pas que les modules s'assemblent : l'e2e juge le comportement de bout en bout. Limite : un casque émulé, pas un vrai Quest 3 (rendu, passthrough et manettes réels restent à essayer).
**Origin** : e2e-chemins-critiques — « Les chemins critiques nommés par le demandeur (entrée en réalité mixte, marche à la vitesse réglée, fondu tête baissée) sont couverts par un test e2e rejoué par le contrôle `e2e` »
**Check** : `e2e`
**Tests** : `app/e2e/chemins-critiques.test.ts`, `app/e2e/google-3d.test.ts`, `app/e2e/itineraire-libre.test.ts`

## QUA-029 — A contract's cited tests exist and carry its ID
**Rule** : Every file cited by the **Tests** field of a contract exists and contains the contract's ID (cited in the name of the test that protects it). Stack-agnostic: test names are not parsed. Blocking if the project enforces recent requirements (`newRequirements`: `blocking`, default of fresh installs), warning otherwise.
**Scope** : the **Tests** field of this registry
**Source of truth** : `.githooks/check-contract-tests.mjs`
**Proof** : `.githooks/check-contract-tests.mjs` (hook + CI, `drwil verify`)
**Reason** : a business rule is only a non-regression while its test still exists: a deleted or renamed test would leave the contract green while proving nothing
**Check** : `contract-tests`

## QUA-040 — The architecture map covers the code
**Rule** : Every folder holding code (the project's code prefixes and layers, two levels deep) is cited in `docs/architecture.md`, a project file `init` never rewrites; the setting `architectureMap.files` requires every file under chosen paths. Blocking if the project enforces recent requirements (`newRequirements`: `blocking`), warning otherwise. A workstream that changes the structure updates the map in its closing commit. The map, README and changelog are written in the `docLang` language (absent: the project language). The check judges that a folder is cited, not that its written role is right: that part stays human.
**Scope** : `docs/architecture.md`
**Source of truth** : `.githooks/check-architecture.mjs`
**Proof** : `.githooks/check-architecture.mjs` (hook + CI, `drwil verify`)
**Reason** : a map no one maintains goes stale silently, and an agent arriving later reads a wrong picture of the project
**Check** : `architecture-map`

## Business (APP)

## APP-001 — Sécurité-visibilité : le réel reste visible
**Rule** : en réalité mixte, la ville ne masque jamais le tapis réel : (1) tête baissée au-delà de 25° sous l'horizontale, l'opacité de la ville décroît jusqu'à 0 ; (2) le volume « zone tapis » défini par l'utilisateur est toujours rendu transparent ; (3) l'opacité globale réglée par l'utilisateur reste bornée entre 30 % et 100 % ; (4) la session XR est `immersive-ar` (passthrough), jamais `immersive-vr`.
**Scope** : le module safety de la couche `app/` et tout code qui fixe l'opacité ou le mode de la session XR
**Source of truth** : `app/src/safety/visibility.ts` (fondu, opacité), `app/src/xr/session.ts` (mode de session), appliqués par `app/src/xr/frame.ts` et `app/src/city/souq.ts`
**Proof** : des tests de cette règle, nommés par son ID, déclarés comme contrôle propre (`.drwil/ia-first.json` → `checks`, avec un `id`, filtrant les tests par l'ID : `npm test -- -t "APP-001"`), rejoués par `drwil verify` à chaque chantier ; les points (1) et (4) sont aussi rejoués de bout en bout par l'e2e des chemins critiques (QUA-020)
**Reason** : l'utilisateur marche sur un tapis en mouvement avec un casque : s'il ne voit plus le tapis, la rampe ou le bouton d'arrêt, il risque de chuter (risque du projet : élevé)
**Check** : `app-001`
**Tests** : `app/src/safety/visibility.test.ts`, `app/src/xr/session.test.ts`, `app/src/xr/frame.test.ts`, `app/src/xr/experience.test.ts`, `app/src/city/souq.test.ts`, `app/src/ui/home.test.ts`
**Manual** : le point (2), zone tapis, n'est pas encore codé (chantier suivant) : il n'est prouvé par aucun test. D'ici là, vérification humaine sur le Quest 3 que le tapis reste visible ; une fois la zone tapis codée et testée sous cet ID, retirer ce champ. Les points (1), (3) et (4) sont prouvés par le contrôle ci-dessus, dans un Quest 3 émulé : jamais encore sur un vrai casque.

## APP-002 — La marche suit le parcours GPS de l'itinéraire choisi : en boucle, sauf un trajet libre qui s'arrête à l'arrivée
**Rule** : la position de marche suit le parcours GPS de la boucle de l'itinéraire choisi à l'accueil (`app/data/souq-waqif-boucle.json` pour le souk de Doha, `app/data/pune-vieille-ville-boucle.json` pour la Vieille ville de Pune, `app/data/doha-corniche-boucle.json` pour la Corniche de Doha, `app/data/pune-fc-road-boucle.json` pour FC Road, convertis en mètres locaux ; `app/src/city/cities.ts` associe chaque itinéraire à sa boucle) : la distance parcourue est égale à la vitesse réglée multipliée par le temps de marche, la position est celle du tracé à cette distance, et la boucle reprend au départ à la fin de sa longueur. Un trajet libre (itinéraire « libre », chemin à pied calculé à l'accueil par le service de routage choisi : Valhalla par défaut, sans clé, derrière l'interface `Router`, Google Routes en option avec une clé) ne boucle pas : la marche s'arrête à l'arrivée, y reste et le dit sur la page et dans le casque ; les quatre itinéraires figés gardent leur boucle.
**Scope** : le déplacement de la couche `app/` : `app/src/route/` (parcours, conversion GPS), `app/src/city/souq.ts` (placement de la ville), `app/src/city/cities.ts` (ville et boucle par itinéraire), `app/src/xr/experience.ts` (assemblage), `app/src/xr/frame.ts` (arrêt à l'arrivée), `app/src/city/free-route.ts` (tracé d'un trajet libre)
**Source of truth** : `app/src/route/providers.ts` (interfaces de routage et d'adresses), `app/src/route/valhalla.ts` (routage par défaut), `app/src/route/create-providers.ts` (choix des services, adresses réglables), `app/src/route/path.ts` (position, direction, reprise de la boucle ou arrêt à l'arrivée), `app/src/route/walk.ts` (distance à la vitesse réglée), `app/data/souq-waqif-boucle.json`, `app/data/pune-vieille-ville-boucle.json`, `app/data/doha-corniche-boucle.json` et `app/data/pune-fc-road-boucle.json` (tracés)
**Proof** : des tests nommés par l'ID (contrôle `app-002`, `npm test -- -t "APP-002"`), dont la longueur du tracé (entre 1,2 et 1,8 km pour les boucles du souk et de Pune, entre 3,5 et 4,5 km pour l'aller-retour de la Corniche, entre 3 et 4 km pour celui de FC Road), son retour au départ et le fait que chacun de ses points est un sommet d'une voie de l'extrait OpenStreetMap ; la distance égale au temps marché est aussi rejouée de bout en bout (QUA-020)
**Reason** : le demandeur veut marcher dans un vrai quartier, à la vitesse de son tapis. Limite : le tracé est relu par le demandeur (lot 1 de la fiche doha-souq-waqif) mais jamais encore essayé sur un vrai Quest 3 ; quelques dizaines de mètres de la boucle du souk traversent des passages couverts que l'extrait OpenStreetMap dessine comme des bâtiments ; la boucle de Pune (calculée par plus court chemin, hypothèse de cadrage de l'agent) attend la relecture du demandeur (lot 1 de la fiche pune-vieille-ville) ; l'aller-retour de la Corniche (environ 2 km à l'aller, même chemin au retour) aussi (lot 1 de la fiche doha-corniche) : il part du point relié le plus proche du Musée d'art islamique, car le réseau de voies du musée n'est pas relié à celui de la Corniche dans l'extrait ; l'aller-retour de FC Road (environ 1,76 km à l'aller, même chemin au retour) attend aussi la relecture (lot 1 de la fiche pune-fc-road).
**Origin** : doha-souq-waqif — « La position de marche suit le parcours GPS de la boucle du souk : la distance parcourue est égale à la vitesse réglée multipliée par le temps, et la boucle reprend au départ à la fin »
**Check** : `app-002`
**Tests** : `app/src/route/path.test.ts`, `app/src/city/souq.test.ts`, `app/src/city/souq-data.test.ts`, `app/src/city/cities.test.ts`, `app/src/xr/experience.test.ts`, `app/src/xr/frame.test.ts`, `app/src/city/free-route.test.ts`, `app/src/xr/experience-free.test.ts`, `app/src/route/valhalla.test.ts`, `app/src/route/create-providers.test.ts`, `app/src/route/routes-api.test.ts`

## APP-003 — Les bâtiments viennent de l'extrait OpenStreetMap (ou, pour un trajet libre, d'OpenStreetMap chargé pour le trajet), avec leur attribution
**Rule** : en rendu OpenStreetMap (le rendu par défaut), les bâtiments affichés sont ceux de l'extrait OpenStreetMap versionné de l'itinéraire choisi (`app/data/souq-waqif.json`, `app/data/pune-vieille-ville.json`, `app/data/doha-corniche.json`, `app/data/pune-fc-road.json`, aucun appel réseau dans le casque) ; en rendu Google 3D, choisi à l'accueil et possible avec une clé seulement, les tuiles Google remplacent ces bâtiments et le casque appelle le réseau (décision du demandeur du 2026-10-31) ; pour un trajet libre, il n'y a pas d'extrait versionné : la ville vient du rendu Google 3D si choisi, ou des bâtiments OpenStreetMap proches du tracé, chargés à l'accueil quand le trajet se prépare (jamais pendant la marche), et les adresses viennent de Photon (OpenStreetMap, interface `Geocoder`, sans clé) par défaut, de Google Geocoding en option avec une clé ; la mention « © contributeurs OpenStreetMap » est visible à l'accueil, dans le panneau de marche de la page et dans le casque (panneau de la scène, effacé avec la ville), et la mention de Google s'y ajoute en rendu Google 3D. Le rendu OpenStreetMap est enrichi des seules balises de l'extrait : couleur (`building:colour`), couleur de toit (`roof:colour`) et matériau (`building:material`) teintent le bâtiment, qui garde sinon un ton de la palette de l'itinéraire ; un ombrage par sommet assombrit les murs vers le pied ; les arbres (`natural=tree`), lampadaires (`highway=street_lamp`) et bancs (`amenity=bench`) s'affichent en peu de maillages (arbres instanciés, plafonnés à 300, mobilier fusionné, plafonné à 400, les plus proches du parcours d'abord), et tout cela s'efface avec la ville (APP-001) ; l'extraction d'un trajet libre lit les mêmes balises.
**Scope** : `app/src/city/` (ville, mention), `app/src/ui/` (accueil, panneau), `app/src/xr/google-mode.ts` (rendu choisi et mentions affichées), `app/data/` et `app/scripts/` (extrait et script d'extraction), `app/src/city/free-route.ts` (ville d'un trajet libre)
**Source of truth** : `app/src/city/licence.ts` (texte des mentions d'OpenStreetMap et de Google), `app/src/city/souq-data.ts` (lecture de l'extrait), `app/scripts/osm-tags.ts` (balises retenues), `app/src/city/tint.ts` (teintes des matériaux), `app/src/city/buildings.ts` (teinte et ombrage), `app/src/city/props.ts` (arbres et mobilier), `app/scripts/extract-souq.ts`, `app/scripts/extract-pune.ts`, `app/scripts/extract-corniche.ts` et `app/scripts/extract-fc-road.ts` (production des extraits)
**Proof** : des tests nommés par l'ID (contrôle `app-003`, `npm test -- -t "APP-003"`) : autant de bâtiments lus que dans le fichier, mention présente à l'accueil, dans le panneau et dessinée sur le panneau de la scène, extrait qui porte l'attribution ODbL, balises de couleur et de matériau lues et teintes appliquées (toit à part, ombrage vers le pied), arbres et mobilier lus de l'extrait et du trajet libre, plafonnés, effacés par le fondu, mention de Google ajoutée à l'accueil, dans le panneau et dans le casque en rendu Google 3D ; la mention de l'accueil et du panneau est aussi rejouée de bout en bout (QUA-020)
**Reason** : les données OpenStreetMap sont sous licence ODbL, dont l'attribution est une obligation. Limite : la mention dessinée dans le casque n'a jamais été regardée sur un vrai Quest 3 (taille, lisibilité) ; pour Google, le texte « Google » et les droits des tuiles tiennent lieu de logo, et leur conformité aux conditions de Google reste à vérifier par l'humain.
**Origin** : doha-souq-waqif — « Les bâtiments affichés sont ceux de l'extrait OpenStreetMap versionné, et la mention « © contributeurs OpenStreetMap » est visible dans l'accueil et dans le casque »
**Check** : `app-003`
**Tests** : `app/src/city/souq-data.test.ts`, `app/src/city/cities.test.ts`, `app/src/city/attribution.test.ts`, `app/src/city/extract-souq.test.ts`, `app/src/city/extract-pune.test.ts`, `app/src/city/extract-corniche.test.ts`, `app/src/city/extract-fc-road.test.ts`, `app/src/ui/home.test.ts`, `app/src/ui/panel.test.ts`, `app/src/city/google-tiles.test.ts`, `app/src/xr/google-mode.test.ts`, `app/src/ui/render-choice.test.ts`, `app/src/city/free-route.test.ts`, `app/src/city/buildings.test.ts`, `app/src/city/props.test.ts`, `app/src/city/tint.test.ts`, `app/src/xr/experience-free.test.ts`, `app/src/route/photon.test.ts`, `app/src/route/geocoding.test.ts`

## QUA-014 — Contraste du texte et de son fond (RGAA 4.1 / WCAG AA)
**Rule** : tout texte de l'accueil du casque a un rapport de contraste d'au moins 4,5:1 avec son fond (3:1 pour le grand texte : 24 px, ou 18,5 px gras) ; les couleurs sont déclarées une seule fois, dans les variables de `app/src/ui/home.css`, jamais en dur ailleurs dans la feuille.
**Scope** : les écrans de `app/src/ui/` (accueil, cartes d'itinéraire, panneau de marche)
**Source of truth** : `app/src/ui/home.css` (couleurs), `app/src/ui/contrast.ts` (mesure WCAG)
**Proof** : des tests nommés par l'ID, qui lisent les couleurs dans la feuille de style et mesurent chaque couple texte / fond ; ils tournent avec tous les tests de la couche dans le contrôle `coverage-app`, à chaque commit et en CI
**Reason** : `catalog:QUA-014` adopté par le chantier accueil-casque ; un accueil sombre lu dans un casque doit rester lisible. Limite : les couples sont déclarés dans le test, un nouveau texte sur un nouveau fond doit y être ajouté ; les scripts du kit (le contrôle des couleurs en dur du kit, le contrôle de contraste du kit) ne sont pas installés : `docs/intentions/controles-couleurs-kit.md`.
**Origin** : accueil-casque — « Le texte et son fond respectent un contraste d'au moins 4,5:1 (3:1 pour le grand texte) »
**Check** : `coverage-app`
**Tests** : `app/src/ui/contrast.test.ts`

## Out of registry (these are not contracts)

| Rule | Nature | Where it lives |
|---|---|---|
| Commits, personal data in an AI's outputs, secrets in tool output, attack testing on a real target, docs kept current in the same commit | conduct (human) | `AGENTS.md`, Conduct section |
| Refactor without behavior change | procedure (human) | `docs/recipes/refactor-without-breaking.md` |
| File size, project-specific code hygiene rules | opt-in tooling (the kit proposes 200 lines, no imposed threshold) | `.githooks/check-file-size.mjs`, `.githooks/check-code-rules.mjs`, `docs/recipes/refactor-without-breaking.md` |
| Tests shipped with every new component | convention (human) | the relevant layer's `AGENTS.md` |
