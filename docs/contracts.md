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
**Rule** : chemins critiques rejoués dans Chromium avec Quest 3 émulé (IWER), sans requête distante ni erreur WebGL :
(1) accueil → session `immersive-ar` ; (2) quatre cartes sélectionnables, itinéraire réellement démarré, accueil réduit à itinéraire/vitesse hors démarrages et sécurité ; (3) vitesse/joystick ±0,1 ; (4) fondu tête baissée ; (5) Souq par défaut, attribution et boucle ; (6–8) Pune Vieille ville, Corniche et FC Road, ville/boucle propres, captures, mêmes garanties APP-001/APP-002/APP-003.
Les anciens chemins 9 et 10 sont retirés par le recentrage autorisé ; leurs garanties conservées (ville, erreurs et sécurité) sont rejouées sur les itinéraires embarqués et les préférences.
(13) carrefour annoncé, rayon/prise droite, sortie du tracé sans toucher à la vitesse ; (14) cartoon avec/sans contours, pack arbres, modèle abîmé signalé et repli ; (15) côté du panneau mémorisé, valeur corrompue ignorée, deux côtés en marche ; (16) masque du champ de vision et capture, panneau entier dans la vue des deux côtés ; (17) ville riche sur quatre itinéraires, fondu ; (18) minicarte embarquée, point mobile ; (19) PC sans IWER ni session WebXR, clavier/souris, pause, regard, recalage, panneau et sortie, échec XR dit mais PC utilisable ; (20) 50 km/h sans maximum ni message de limite ; (21) diagnostic Quest/PC, export JSON local validé ; (22) trois profils, mémoire/repli Équilibré, sécurité maintenue ; (23) façades sur quatre villes, budget et fondu ; (24) mobilier/marquages sur quatre villes, Performance réduit, fondu ; (25) préférences Quest par vraie gâchette gauche puis rayon/prise droite : brouillard/sons, ville vivante unique, arbres, lampadaires, côté/opacité et trois profils à chaud sans arrêter la marche, bornes du voile/son, réentrée avec derniers choix, fondu du panneau, nuit/jour ; (26) matériaux automatiques, aucun choix d'accueil, fondu ; (27) lampadaires produits distincts d'OSM, plafonds et retrait.
PC et tablette rejouent les changements de préférences en marche, mémoire après nouvelle entrée, contrôles de vitesse et scène conservée (APP-006, APP-007). Zone tapis, vignette, pause/recalage et tableau de bord/calories fixes gardent leurs e2e.
**Scope** : l'application de `app/`, servie par Vite, vue comme l'utilisateur la voit (page, boutons, panneau de marche)
**Source of truth** : `app/e2e/`, `app/playwright.config.ts` (Vite HTTPS, un worker, aucune clé), gestes réellement émulés par `app/e2e/quest-preferences-helper.ts`
**Proof** : Playwright, au commit, en CI (navigateur Chromium installé par le job) et par `drwil verify` ; un chemin qui ne s'exécute pas fait échouer le contrôle, jamais un « passé »
**Reason** : garantie obligatoire du kit (`catalog:QUA-020`) ; la couverture à 100 % prouve que chaque ligne est exécutée, pas que les modules s'assemblent : l'e2e juge le comportement de bout en bout. Limite : un casque émulé, pas un vrai Quest 3 (rendu, passthrough et manettes réels restent à essayer).
**Origin** : e2e-chemins-critiques — « Les chemins critiques nommés par le demandeur (entrée en réalité mixte, marche à la vitesse réglée, fondu tête baissée) sont couverts par un test e2e rejoué par le contrôle `e2e` »
**Check** : `e2e`
**Tests** : `app/e2e/chemins-critiques.test.ts`, `app/e2e/ambiance-cartoon.test.ts`, `app/e2e/panneau-discret.test.ts`, `app/e2e/champ-de-vision.test.ts`, `app/e2e/ville-riche.test.ts`, `app/e2e/version-pc.test.ts`, `app/e2e/tablette-tactile.test.ts`, `app/e2e/diagnostic-rendu.test.ts`, `app/e2e/profils-graphiques.test.ts`, `app/e2e/facades-batiments.test.ts`, `app/e2e/carrefours.test.ts`, `app/e2e/vitesse-limite.test.ts`, `app/e2e/mobilier-urbain.test.ts`, `app/e2e/eclairage-ambiance.test.ts`, `app/e2e/lampadaires-generes.test.ts`, `app/e2e/materiaux-souk.test.ts`, `app/e2e/minicarte.test.ts`, `app/e2e/zone-tapis.test.ts`, `app/e2e/commandes-panneau.test.ts`, `app/e2e/tableau-de-bord.test.ts`

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
**Rule** : en réalité mixte, la ville ne masque jamais le tapis réel : (1) tête baissée au-delà de 25° sous l'horizontale, opacité décroissante jusqu'à 0 ; pose absente, ville effacée. (2) Rien de la ville dans le volume zone tapis, quels que soient tête et opacité ; boîte par défaut sans mémoire, boîte illisible/aberrante remplacée par défaut, jamais vide ; la zone ne fait que réduire le rendu. Vignette réelle toujours active, sans préférence de désactivation, ne fait que retirer de l'opacité. (3) Le calcul d'opacité globale reste borné entre 30 % et 100 % ; l'application utilise 100 %, sans commande d'accueil. (4) Session `immersive-ar`, jamais `immersive-vr`.
(5) Tableau d'infos (B) : même fondu, en bas de vue à 28° du côté choisi en marche, horizontal face à la tête ; fond sombre d'opacité réglable de 70 à 100 %, contraste au moins 4,5:1 même sur réel blanc. Tout entier dans la vue (APP-005), hors de la zone tapis : repoussé sur son axe et grandi pour garder sa taille apparente, caché sans pose ou sans place à moins de 5 m. Minicarte carrée de 0,22 m, côté opposé, mêmes distance/hauteur/fondu/masquage et exclusion de zone, sans ciel ou fond opaque (APP-002). Le panneau de préférences prend leur place quand ouvert ; même placement sûr et même fondu, aucune interaction quand caché. Un changement de préférence ne touche jamais ces protections.
PC sans passthrough/tapis : bouton distinct « Version PC », aucune session WebXR, aucun fondu, zone ou vignette (`app/src/pc/enter-pc.ts`) ; garanties casque inchangées.
**Scope** : le module safety de la couche `app/` et tout code qui fixe l'opacité ou le mode de la session XR
**Source of truth** : `app/src/safety/visibility.ts` (fondu, opacité), `app/src/xr/session.ts` (mode de session), `app/src/xr/hud-panel.ts` (fond, fondu, masquage) et `app/src/xr/pose.ts` (place du panneau et de la minicarte, hors de la zone tapis), `app/src/xr/minimap.ts` (fondu et masquage de la minicarte), `app/src/safety/zone.ts` (zone tapis : boîte par défaut, validation, enregistrement, plans) et `app/src/safety/zone-edit.ts` (réglage à la manette gauche), `app/src/xr/vignette.ts` (vignette réelle), appliqués par `app/src/xr/frame.ts`, `app/src/xr/zone-control.ts`, `app/src/city/zone-clip.ts` et `app/src/city/souq.ts`
**Proof** : des tests de cette règle, nommés par son ID, déclarés comme contrôle propre (`.drwil/ia-first.json` → `checks`, avec un `id`, filtrant les tests par l'ID : `npm test -- -t "APP-001"`), rejoués par `drwil verify` à chaque chantier ; les points (1), (2) (pose, déplacement et relecture de la zone, vignette) et (4) sont aussi rejoués de bout en bout par l'e2e des chemins critiques (QUA-020)
**Reason** : l'utilisateur marche sur un tapis en mouvement avec un casque : s'il ne voit plus le tapis, la rampe ou le bouton d'arrêt, il risque de chuter (risque du projet : élevé)
**Check** : `app-001`
**Tests** : `app/src/safety/visibility.test.ts`, `app/src/xr/session.test.ts`, `app/src/xr/frame.test.ts`, `app/src/xr/experience.test.ts`, `app/src/xr/experience-controls.test.ts`, `app/src/xr/hud-panel.test.ts`, `app/src/xr/pose.test.ts`, `app/src/xr/minimap.test.ts`, `app/src/city/souq.test.ts`, `app/src/ui/home.test.ts`, `app/src/safety/zone.test.ts`, `app/src/safety/zone-edit.test.ts`, `app/src/city/zone-clip.test.ts`, `app/src/xr/left-controller.test.ts`, `app/src/xr/zone-control.test.ts`, `app/src/xr/vignette.test.ts`, `app/src/xr/experience-zone.test.ts`, `app/src/xr/experience-dashboard.test.ts`, `app/src/xr/experience-pc.test.ts`, `app/src/xr/preference-panel.test.ts`, `app/src/xr/experience-preferences.test.ts`
**Manual** : le point (2) est codé et prouvé par les tests, dans un Quest 3 émulé ; la découpe et la vignette (rendu GPU) ne sont jamais vues par un test, et le réglage à la manette gauche n'a jamais été essayé sur un vrai casque : vérification humaine sur le Quest 3 que le tapis reste visible, que la vignette est discrète et que la zone se règle bien (lot 6 de la fiche zone-tapis-vignette). Les points (1), (3) et (4) sont prouvés par le contrôle ci-dessus, dans un Quest 3 émulé : jamais encore sur un vrai casque. Le panneau d'infos du casque (point 5) est prouvé par les tests, mais la lisibilité de son texte sur fond transparent, le confort de sa place (28° sur le côté, 0,31 m sous les yeux, 1,1 m ; valeurs réglées sur la simulation du champ de vision, APP-005 ; niveau de transparence ; côté par défaut : choix de l'agent) et le tapis resté visible attendent l'essai sur le Quest 3 (lot 4 de la fiche panneau-discret).

## APP-002 — La marche suit la boucle GPS choisie et l'utilisateur choisit sa rue aux carrefours
**Rule** : la position suit la boucle GPS embarquée de l'itinéraire choisi, convertie en mètres locaux ; distance = vitesse × temps marché, retour au départ après un tour. Aucun service de trajet ou d'adresse, aucun réseau pendant la marche.
Dans le casque, les carrefours du réseau OSM sont proposés à 40 m : hors autoroutes, chantiers, trottoirs et impasses de moins de 15 m ou proches du bord (30 m). Flèches de 5 m à 8 m du carrefour, jaune proposées, blanche pointée, verte choisie ; rayon droit dans un écart de cap de 10° (ciel/sol ignorés), prise droite confirme une fois par appui. Sans choix le tracé continue ; autre choix rejoint le réseau au carrefour, cap lissé sur 4 m, sans saut, sans retour guidé, sans toucher vitesse/distance. Aucun choix ville effacée ou préférences ouvertes ; flèches soumises au fondu et à la zone tapis (APP-001).
Gâchette droite : pause/reprise, temps et déplacement arrêtés mais vitesse conservée et sécurité active ; A : recalage sur position et regard sans changer la distance ; B : tableau et minicarte. Une action par front, sans répétition. Tableau initialement affiché : vitesse, allure (« 7:30 min/km » à 8 km/h, « — » en pause), durée, distance, restant/progression du tour, calories « environ pour 70 kg » (ACSM cumulée par image, poids fixe, aucun ancien poids relu), cap, lieu, heure. Texte redessiné seulement s'il change. Côté et opacité du panneau : préférences en marche (APP-006). Minicarte nord en haut sans fond ni réseau, tracé réduit à 120 points, point redessiné par case de 2 px.
PC/tablette : mêmes ville, boucle, vitesse et calculs sans WebXR. Espace/P pause ; ↑/+ et ↓/− ±0,1 km/h, PageHaut/PageBas ±1, minimum 1 sans maximum ; R recale, H masque tableau mais pas attribution, glisser regarde, Échap quitte. Pas de carrefour, minicarte, panneau flottant ou manette sur écran ; tactile APP-007. Diagnostic masqué au départ, D sur PC, clic joystick droit sur Quest, bouton sur tablette ; valeurs indisponibles dites, export JSON local sans envoi, aucun effet sur la marche.
**Scope** : `app/src/route/`, `app/src/city/cities.ts`, `app/src/city/souq.ts`, `app/src/xr/frame.ts`, `app/src/xr/experience.ts`, `app/src/xr/guide.ts`, `app/src/xr/junctions.ts`, `app/src/xr/choice-ray.ts`, `app/src/xr/choice-markers.ts`, `app/src/pc/`
**Source of truth** : `app/src/route/path.ts`, `app/src/route/walk.ts`, `app/src/route/network.ts`, `app/src/route/stats.ts`, `app/src/xr/guide.ts`, `app/src/xr/buttons.ts`, `app/src/xr/pose.ts`, `app/src/xr/hud-panel.ts`, `app/src/xr/minimap.ts`, `app/src/route/simplify.ts`, `app/src/ui/preferences.ts`, `app/src/xr/diagnostics.ts`, `app/src/xr/diagnostics-report.ts`, `app/src/pc/enter-pc.ts` ; quatre tracés `app/data/souq-waqif-boucle.json`, `app/data/pune-vieille-ville-boucle.json`, `app/data/doha-corniche-boucle.json`, `app/data/pune-fc-road-boucle.json`
**Proof** : tests nommés par l'ID (`app-002`, `npm test -- -t "APP-002"`) : longueurs souk/Pune 1,2–1,8 km, Corniche 3,5–4,5 km, FC Road 3–4 km ; retour au départ, points sur sommets des voies, distance/temps, pause, recalage, tableau, calories fixes, minicarte et carrefours. E2e : `app/e2e/commandes-panneau.test.ts`, `app/e2e/tableau-de-bord.test.ts`, `app/e2e/panneau-discret.test.ts`, `app/e2e/minicarte.test.ts`, `app/e2e/version-pc.test.ts`, `app/e2e/carrefours.test.ts` (QUA-020).
**Reason** : le demandeur veut marcher dans un vrai quartier, à la vitesse de son tapis. Limite : le lieu affiché est le nom de l'itinéraire, car l'extrait OpenStreetMap ne porte pas les noms de rues (`docs/intentions/noms-de-rues-extrait.md`) ; les calories sont une estimation (formule générale, à plat, sans dénivelé) ; la lisibilité du tableau de bord (plus chargé depuis l'allure, la distance restante et la progression) et le tapis resté visible au casque ne sont pas essayés ; pas de dénivelé (aucune source d'élévation) ; le tracé est relu par le demandeur (lot 1 de la fiche doha-souq-waqif) mais jamais encore essayé sur un vrai Quest 3 ; quelques dizaines de mètres de la boucle du souk traversent des passages couverts que l'extrait OpenStreetMap dessine comme des bâtiments ; la boucle de Pune (calculée par plus court chemin, hypothèse de cadrage de l'agent) attend la relecture du demandeur (lot 1 de la fiche pune-vieille-ville) ; l'aller-retour de la Corniche (environ 2 km à l'aller, même chemin au retour) aussi (lot 1 de la fiche doha-corniche) : il part du point relié le plus proche du Musée d'art islamique, car le réseau de voies du musée n'est pas relié à celui de la Corniche dans l'extrait ; l'aller-retour de FC Road (environ 1,76 km à l'aller, même chemin au retour) attend aussi la relecture (lot 1 de la fiche pune-fc-road). Limites du choix aux carrefours : le pointage à la manette n'est pas essayé sur un vrai Quest 3 (précision, confort de la prise) ; une fois sorti du tracé d'origine, il n'y a pas de retour guidé vers lui ; la version PC ne propose pas de carrefours ; le réseau est celui de l'extrait, qui ne porte pas les sens uniques ni les interdictions.
**Origin** : doha-souq-waqif — « La position de marche suit le parcours GPS de la boucle du souk : la distance parcourue est égale à la vitesse réglée multipliée par le temps, et la boucle reprend au départ à la fin »
**Check** : `app-002`
**Tests** : `app/src/route/path.test.ts`, `app/src/city/souq.test.ts`, `app/src/city/souq-data.test.ts`, `app/src/city/cities.test.ts`, `app/src/xr/experience.test.ts`, `app/src/xr/frame.test.ts`, `app/src/xr/buttons.test.ts`, `app/src/xr/pose.test.ts`, `app/src/xr/experience-controls.test.ts`, `app/src/route/stats.test.ts`, `app/src/xr/hud-panel.test.ts`, `app/src/xr/experience-dashboard.test.ts`, `app/src/xr/experience-pc.test.ts`, `app/src/pc/keys.test.ts`, `app/src/pc/look.test.ts`, `app/src/ui/panel.test.ts`, `app/src/route/network.test.ts`, `app/src/xr/guide.test.ts`, `app/src/xr/junctions.test.ts`, `app/src/xr/choice-ray.test.ts`, `app/src/xr/choice-markers.test.ts`, `app/src/xr/experience-junctions.test.ts`

## APP-003 — Les bâtiments viennent de l'extrait OpenStreetMap embarqué, avec leur attribution
**Rule** : un seul rendu, sans clé ni service distant : bâtiments des extraits versionnés `app/data/souq-waqif.json`, `app/data/pune-vieille-ville.json`, `app/data/doha-corniche.json`, `app/data/pune-fc-road.json`. Attribution « © contributeurs OpenStreetMap » à l'accueil, au panneau HTML et dans la scène du casque (effacée avec la ville).
Balises de l'extrait : couleurs murs/toit et matériau, sinon palette ; ombrage au pied ; arbres, mobilier, trottoirs et passages, chemin jaune, surfaces vertes/haies, toits à deux pans (300), auvents (80), noms de rues (8 plaques à 60 m), au plus 8 maillages fixes supplémentaires. Arbres instanciés (300), mobilier fusionné (400), plus proches du parcours d'abord, sans relief, tout soumis à APP-001. Arbres Quaternius Standard CC0 embarqués avec provenance complète (`app/assets/PROVENANCE.md`), variante/cap/taille déterministes, au plus 500 triangles par arbre ; chargement refusé signalé, repli procédural (QUA-002). Les préférences et matériaux locaux complètent ce rendu selon APP-006 et APP-012.
**Scope** : `app/src/city/`, `app/src/ui/`, `app/src/xr/trees-load.ts`, `app/data/`, `app/scripts/`, `app/assets/`
**Source of truth** : `app/src/city/licence.ts`, `app/src/city/souq-data.ts`, `app/scripts/osm-tags.ts`, `app/src/city/tint.ts`, `app/src/city/buildings.ts`, `app/src/city/props.ts`, `app/src/city/tree-pack.ts`, `app/src/city/tree-instances.ts`, `app/src/city/tree-assets.ts`, `app/assets/quaternius-trees.json`, `app/assets/PROVENANCE.md`, `app/scripts/prepare-nature-pack.ts`, `app/src/city/walkways.ts`, `app/src/city/vegetation.ts`, `app/src/city/roofs.ts`, `app/src/city/street-names.ts`, `app/src/city/soup.ts`, `app/src/city/near-route.ts`, `app/src/city/roads.ts`, `app/scripts/extract-souq.ts`, `app/scripts/cities.ts`
**Proof** : tests nommés par l'ID (`app-003`, `npm test -- -t "APP-003"`) : bâtiments/extraits et ODbL, attribution page/scène, balises et ombrage, arbres/mobilier plafonnés et effacés, pack déterministe et léger CC0 avec provenance, erreurs et repli ; e2e des quatre villes riches et du modèle abîmé, sans requête distante ni erreur WebGL (QUA-020).
**Reason** : attribution ODbL obligatoire. Mention de scène jamais jugée sur vrai Quest 3 (taille, lisibilité).
**Origin** : doha-souq-waqif — « Les bâtiments affichés sont ceux de l'extrait OpenStreetMap versionné, et la mention « © contributeurs OpenStreetMap » est visible dans l'accueil et dans le casque »
**Check** : `app-003`
**Tests** : `app/src/city/souq-data.test.ts`, `app/src/city/cities.test.ts`, `app/src/city/attribution.test.ts`, `app/src/city/extract-souq.test.ts`, `app/src/city/cities-extract.test.ts`, `app/src/ui/home.test.ts`, `app/src/ui/panel.test.ts`, `app/src/city/souq.test.ts`, `app/src/city/walkways.test.ts`, `app/src/city/vegetation.test.ts`, `app/src/city/roofs.test.ts`, `app/src/city/street-names.test.ts`, `app/src/city/soup.test.ts`, `app/src/city/near-route.test.ts`, `app/src/city/roads.test.ts`, `app/src/city/buildings.test.ts`, `app/src/city/props.test.ts`, `app/src/city/tint.test.ts`, `app/src/city/tree-pack.test.ts`, `app/src/city/tree-instances.test.ts`, `app/src/city/tree-assets.test.ts`, `app/src/city/souq-trees.test.ts`, `app/src/city/prepare-nature-pack.test.ts`, `app/src/city/mesh-simplify.test.ts`, `app/src/city/gltf-read.test.ts`, `app/src/city/zip-read.test.ts`, `app/src/xr/trees-load.test.ts`, `app/src/xr/experience-trees.test.ts`

## APP-004 — Le champ de vision du casque est simulé pour juger ce qui reste dans la vue
**Rule** : un calcul de projection juge qu'un point ou un rectangle posé dans la scène est dans la vue d'une tête (position, cap, inclinaison) : devant elle, et dans la part « marge » des demi-angles horizontal et vertical du champ de vision cible ; un rectangle est dans la vue quand ses quatre coins le sont ; la cible (Meta Quest 3 : 110° en horizontal, 96° en vertical) et la marge (80 % des demi-angles) sont déclarées en un seul endroit, avec leur source ; le masque de cette cible est celui que l'e2e donne à IWER.
**Scope** : tout code ou test qui juge qu'un objet de la scène reste visible dans le casque (le panneau d'infos, point 5 d'APP-001, en est le premier cas)
**Source of truth** : `app/src/xr/fov.ts` (cible `QUEST3_FOV`, marge `FOV_MARGIN`, `pointInView`, `rectInView`, `visibilityMask`)
**Proof** : des tests nommés par l'ID (contrôle `app-004`, `npm test -- -t "APP-004"`) sur des cas synthétiques aux bornes : juste dedans, juste dehors (à droite, à gauche, en haut, en bas), sans marge, point derrière la tête, tête tournée, tête inclinée, tête déplacée, rectangle dont un seul coin sort de la vue, masque d'IWER ; la marche avec ce masque est rejouée de bout en bout, capture publiée (QUA-020, `app/e2e/champ-de-vision.test.ts`)
**Reason** : à l'essai au Quest 3 du chantier panneau-discret, l'heure du panneau était hors de la vue sans qu'aucun test ne connaisse le champ de vision. Limite : les valeurs de la cible sont une hypothèse de cadrage (annoncées par Meta, aucune source relue le 2026-11-01) ; un écran plat ne simule ni la distorsion des lentilles, ni la netteté des bords, ni l'ajustement du casque sur le visage, ce que la marge approche et le jugement humain d'APP-001 au casque tranche.
**Origin** : champ-de-vision-casque — « un calcul de projection dit si un objet reste dans la vue ».
**Check** : `app-004`
**Tests** : `app/src/xr/fov.test.ts`
**Manual** : relire la source des 110° × 96° du Quest 3 et la valeur de la marge, puis les confirmer à l'essai au casque.

## APP-005 — Le panneau d'infos du casque reste dans le champ de vision, texte compris
**Rule** : le panneau d'infos du casque (ses quatre coins, donc chacune de ses cellules de texte, l'heure comprise) reste tout entier dans le champ de vision de la cible, marge comprise (APP-004), côté droit comme côté gauche, pour une tête tournée de n'importe quel cap, droite, inclinée vers le haut jusqu'à 10° ou baissée jusqu'à 30° (au-delà, le fondu l'a presque effacé), la zone tapis par défaut comme une zone qui le repousse.
**Scope** : la place et la taille du panneau d'infos (`app/src/xr/pose.ts`) et la disposition de son texte (`app/src/xr/hud-panel.ts`)
**Source of truth** : `app/src/xr/pose.ts` (`PANEL_SIDE_RAD`, `PANEL_DROP_M`, `PANEL_DISTANCE_M`, `PANEL_WIDTH_M`) jugé par `app/src/xr/fov.ts`
**Proof** : des tests nommés par l'ID (contrôle `app-005`, `npm test -- -t "APP-005"`) qui posent le vrai panneau et jugent ses quatre coins par la projection d'APP-004, pour trois caps, quatre inclinaisons, les deux côtés et deux zones ; vus échouer avant la correction (24 cas sur 24 : bord extérieur à 52,8° du regard pour un demi-champ utile de 44°) ; la marche avec le masque du champ de vision, panneau affiché des deux côtés, est rejouée de bout en bout (QUA-020, `app/e2e/champ-de-vision.test.ts`)
**Reason** : à l'essai au Quest 3 du chantier panneau-discret, l'heure, en haut à droite du panneau à 40° du regard, était hors de la vue. Limite : la cible et la marge sont une hypothèse (APP-004) ; la lisibilité et l'heure bien visible sans tourner la tête sont jugées par l'humain sur un vrai Quest 3 (APP-001).
**Origin** : panneau-heure-hors-vue — « tout le panneau, l'heure comprise, reste dans le champ de vision des deux côtés ».
**Check** : `app-005`
**Tests** : `app/src/xr/hud-panel.test.ts`

## APP-006 — Le profil graphique règle le rendu sans toucher à la sécurité
**Rule** : trois profils figés (Performance, Équilibré, Qualité) règlent ensemble contours, ville riche, marquages, plafonds d'arbres, mobilier et figurants, brouillard permis et ratio de pixels, sans logique de marche. Équilibré est le premier choix sur Quest, PC et tablette, sans détection de capacités. Le choix se fait pendant la marche et devient le dernier choix repris au départ suivant ; les anciens réglages sont ignorés sauf le profil. Une mémoire illisible ou indisponible est signalée (QUA-002), avec défaut ou choix utilisable pour la séance. Les variantes sont préparées avant la marche : tout changement s'applique à chaud sans reconstruire la ville, sans arrêter ni recréer la session. Sur écran le ratio de pixels change ; au casque la fovéation change (1, 0,5, 0), l'échelle du framebuffer restant celle fixée à l'entrée (0,8, 1, 1,2). Performance refuse le brouillard même demandé (APP-011). Aucun profil ne touche l'opacité de sécurité, la vignette ou la zone tapis (APP-001).
**Scope** : `app/src/render/profiles.ts`, `app/src/ui/preferences.ts`, `app/src/ui/walk-preferences.ts`, `app/src/xr/preference-panel.ts`, `app/src/city/live-city.ts`, `app/src/xr/live-preferences.ts`, `app/src/xr/experience.ts`, `app/src/pc/enter-pc.ts`
**Source of truth** : `app/src/render/profiles.ts` (`PROFILES`, `FALLBACK_PROFILE`), `app/src/ui/preferences.ts` (défauts, validation et mémoire), `app/src/city/live-city.ts` (variantes préparées), `app/src/xr/live-preferences.ts` (application à chaud)
**Proof** : tests nommés par l'ID (contrôle `app-006`, `npm test -- -t "APP-006"`) : profils sans réglage de sécurité, défaut commun, migration du seul ancien profil, mémoire validée, erreurs dites, changements Quest/PC sans remplacement de ville ni géométrie, marche continue ; e2e sur Quest, PC et tablette (QUA-020)
**Reason** : les options de rendu étaient dispersées (cases de l'accueil, constantes) ; une seule commande règle le rendu, et les effets à venir (fiches `rendu-*`) s'y brancheront. Limite : les images par seconde de chaque profil n'ont jamais été mesurées sur un vrai Quest 3 (`docs/intentions/essai-casque-profils-graphiques.md`) ; les plafonds d'arbres et de mobilier de « qualité » sont ceux des données (300 et 400), comme « équilibré ».
**Origin** : rendu-profils-graphiques — « trois profils figés, défaut selon l'appareil détecté, choix manuel à l'accueil, sécurité-visibilité inchangée »
**Check** : `app-006`
**Tests** : `app/src/render/profiles.test.ts`, `app/src/ui/preferences.test.ts`, `app/src/ui/walk-preferences.test.ts`, `app/src/xr/preference-panel.test.ts`, `app/src/city/live-city.test.ts`, `app/src/xr/live-preferences.test.ts`, `app/src/xr/experience-preferences.test.ts`

## APP-007 — La tablette se commande au toucher : boutons à l'écran et glisser pour regarder
**Rule** : sur un écran tactile, la version PC (`app/src/pc/`) se commande au toucher, avec les mêmes calculs que le clavier et la souris (APP-002) : des boutons à l'écran (« Moins vite », « Pause ou reprise », « Plus vite », « Recaler », « Quitter ») produisent les mêmes actions que les touches (un appui, une action ; vitesse par crans de 0,1 km/h) ; glisser un seul doigt sur la scène tourne le regard comme la souris (un second doigt est ignoré), et relâcher ou annuler le doigt arrête net le mouvement du regard. Les boutons ne sont affichés que sur un pointeur tactile ; le clavier et la souris marchent comme avant. L'accueil et le panneau de marche tiennent dans la largeur d'un petit écran (cibles d'au moins 48 px, rien de coupé) et le tableau de bord est du HTML de la page, en surimpression sur le canvas, jamais dans la scène. Aucune session WebXR n'est ouverte et aucune règle de la réalité mixte (fondu, zone tapis, vignette : APP-001) ne change.
**Scope** : le tactile de la version PC (`app/src/pc/touch.ts`, `app/src/pc/touch-controls.ts`, `app/src/pc/input.ts`, `app/src/pc/enter-pc.ts`) et l'interface petit écran (`app/src/ui/home.css`, `app/src/ui/panel.ts`)
**Source of truth** : `app/src/pc/touch.ts` (suivi du doigt, pur), `app/src/pc/touch-controls.ts` (boutons à l'écran, mêmes actions que `app/src/pc/keys.ts`) et `app/src/ui/home.css` (affichage tactile et petit écran)
**Proof** : des tests nommés par l'ID (contrôle `app-007`, `npm test -- -t "APP-007"`) : suivi du doigt (glisser, relâcher, second doigt), boutons et actions poussées, retrait des écouteurs ; la marche à la tablette est rejouée de bout en bout dans Chromium en émulation tactile sur un écran étroit (QUA-020, `app/e2e/tablette-tactile.test.ts`)
**Reason** : le demandeur veut ouvrir l'application sur une tablette, avec la même marche que sur PC. Limite : l'e2e est une émulation tactile de Chromium, jamais un vrai appareil ni un autre navigateur (`docs/intentions/essai-tablette-tactile.md`) ; ni pincer pour la vitesse, ni gyroscope (refusés) ; la minicarte à l'écran n'existe pas encore (`docs/intentions/carte-position-en-direct.md`).
**Origin** : rendu-tablette-tactile — « la même marche que la version PC, commandée au toucher, avec une interface adaptée à la taille de l'écran »
**Check** : `app-007`
**Tests** : `app/src/pc/touch.test.ts`, `app/src/pc/touch-controls.test.ts`, `app/src/pc/input.test.ts`

## APP-008 — Des façades procédurales : déterministes, variées sans répétition voisine, légères et réglées par le profil
**Rule** : les bâtiments des extraits OpenStreetMap reçoivent des façades produites par code, sans texture : corniche, porte (sur le mur le plus proche du parcours), fenêtres ou vitrines (commerces), volets et balcons, répartis en travées selon la largeur de chaque mur et le nombre d'étages d'OpenStreetMap (repli sur la hauteur divisée par 3,2 m si l'étage est absent ou incohérent, repli sur un type générique si `building` manque, jamais de géométrie invalide ni de mur trop petit pour porter une ouverture). Quatre familles existent (provençale, maison de village, bâtiment ancien, construction récente) ; la famille dépend du type et de la région de l'itinéraire (`regionOf` : la provençale n'est choisie que pour une origine en Provence, jamais à Pune ni à Doha). La région se déduit de l'origine de l'itinéraire par des fenêtres de latitude et de longitude, la première qui la contient l'emportant (Provence, France du Nord, Italie, Caucase, Inde, Golfe), sans donnée extérieure ni réseau ; chaque région porte son jeu de palettes de détails (liserés, vitrages, volets, portes, rambardes : trois par famille), deux régions n'en partagent aucune, et la Provence comme une origine hors de toute fenêtre (« ailleurs ») gardent le jeu de base. Les familles restent les mêmes partout : la région ne change que des couleurs de sommets, jamais un triangle. Pune reçoit les teintes de l'Inde, Doha celles du Golfe (changement voulu, chantier facades-regions). La graine est l'identifiant OSM du bâtiment (à défaut sa position) : deux chargements donnent exactement les mêmes façades. Les voisins d'un même quartier (cases de 60 m) partagent la palette de leur famille et ne reçoivent jamais la même signature de façade (décalage de variante, cellules de 40 m). Chaque bâtiment a un plafond de triangles de façade ; les façades sont des triangles à couleurs par sommet dans le maillage des bâtiments (aucun matériau ni maillage de plus, donc l'opacité de sécurité APP-001 et le découpage s'y appliquent) et ne reçoivent pas le motif de fenêtres du shader (`noWindows`). Le détail se règle par le profil graphique (APP-006) : « off » sans façade (repli), « reduced » (40 bâtiments, 160 triangles chacun) pour « performance », « full » (120 bâtiments, 500 triangles chacun) pour « équilibré » et « qualité » ; seuls les bâtiments à moins de 80 m du parcours sont détaillés. Les bâtiments gardent leur provenance et l'attribution OpenStreetMap (APP-003).
**Scope** : les façades de `app/src/city/` (`app/src/city/facades.ts`, `app/src/city/facade-plan.ts`, `app/src/city/facade-parts.ts`, `app/src/city/facade-family.ts`, `app/src/city/facade-palettes.ts`, `app/src/city/facade-seed.ts`), leur intégration (`app/src/city/buildings.ts`, `app/src/city/toon.ts`, `app/src/city/souq.ts`, `app/src/render/profiles.ts`) et les données (`app/scripts/osm-tags.ts`, `app/scripts/extract-souq.ts`, `app/data/*.json`)
**Source of truth** : `app/src/city/facades.ts` (budgets par détail, distance, unicité entre voisins), `app/src/city/facade-family.ts` (familles, régions), `app/src/city/facade-palettes.ts` (palettes par région, repli) et `app/src/city/facade-plan.ts` (plan d'une façade selon étages et largeur)
**Proof** : des tests nommés par l'ID (contrôle `app-008`, `npm test -- -t "APP-008"`) : graine et déterminisme, repli sans balise, étages incohérents, famille selon la région, région déduite des coordonnées et repli « ailleurs », palettes propres à chaque région sans triangle de plus, Pune et Doha sans palette commune, voisins sans façade identique, plafonds de triangles, extraits figés lus (identifiants uniques, `building` présent), profil « performance » plus léger ; la marche est rejouée sur les quatre itinéraires dans Chromium sous un budget de triangles, sans erreur WebGL, capture des teintes de la région jointe au rapport, ville effacée tête baissée (QUA-020, chemin 23, `app/e2e/facades-batiments.test.ts`)
**Reason** : le demandeur veut des bâtiments détaillés à hauteur d'homme plutôt que des blocs extrudés (`docs/intentions/rendu-facades-batiments.md`). Limites : le rendu à hauteur d'homme et les 72 images par seconde sur un vrai Quest 3 ne sont pas essayés (`docs/intentions/essai-casque-facades-batiments.md`) ; la famille provençale est livrée sans ville de Provence (`docs/intentions/ville-provence.md`) ; ni texture ni monument glTF (`docs/intentions/facades-textures-monuments.md`) ; les budgets et palettes sont des choix techniques de l'agent ; les palettes régionales ne s'appuient sur aucune référence photographique et les fenêtres de région sont grossières (`docs/intentions/palettes-regions-references.md`) ; leurs teintes n'ont jamais été jugées sur un vrai Quest 3 (`docs/intentions/seance-casque-parcours.md`).
**Origin** : rendu-facades-batiments — « des façades variées à hauteur d'homme, au lieu de blocs extrudés : fenêtres, portes, vitrines, corniches, détails de toiture »
**Check** : `app-008`
**Tests** : `app/src/city/facade-seed.test.ts`, `app/src/city/facade-family.test.ts`, `app/src/city/facade-palettes.test.ts`, `app/src/city/facade-plan.test.ts`, `app/src/city/facade-parts.test.ts`, `app/src/city/facades.test.ts`, `app/src/city/facades-data.test.ts`

## APP-009 — Mobilier urbain et marquages au sol posés d'après les balises OpenStreetMap
**Rule** : le mobilier urbain courant (lampadaire, banc, poubelle, panneau) est produit par code, aux dimensions réelles (mât de 4,5 m, assise à 45 cm et dossier à 85 cm, corbeille de 90 cm, panneau à 2,2 m), posé au sol (y = 0) et tourné dans l'axe du parcours le plus proche, jamais de travers ni flottant. Il n'est posé que là où l'extrait OpenStreetMap porte la balise exacte (`highway=street_lamp`, `amenity=bench`, `amenity=waste_basket`, `traffic_sign` ou `highway=stop|give_way`) : aucun élément n'est inventé quand les données n'en portent pas (relevé du 2026-11-03 sur les quatre extraits figés : 19 bancs au souk, 8 à la Corniche, aucun lampadaire, aucune poubelle ni panneau — ces deux balises n'étaient pas demandées à Overpass avant ce chantier et le resteront jusqu'à une nouvelle extraction). De même, les passages piétons (`footway=crossing`), les trottoirs et leurs bordures (`footway=sidewalk`, `sidewalk=both|left|right`) et les lignes d'arrêt de part et d'autre d'un passage sont posés d'après ces balises de voie : une balise absente ne produit rien. Tout le mobilier est fusionné en un seul maillage plafonné (400 pièces, les plus proches du parcours d'abord) et les marquages se fondent dans le maillage des voies : aucun maillage ni matériau en plus, donc le fondu de sécurité (APP-001) et le découpage de la zone tapis s'y appliquent comme au reste de la ville. Le profil graphique règle la densité (APP-006) : « performance » plafonne le mobilier à 120 pièces et retire les marquages, « équilibré » et « qualité » les gardent. Un élément particulier ou remarquable peut venir d'un modèle glTF CC0 dont la licence et la provenance sont documentées (`app/src/city/licence.ts`, APP-003) : aucun n'est livré à ce jour.
**Scope** : le mobilier et les marquages de `app/src/city/` (`app/src/city/furniture.ts`, `app/src/city/props.ts`, `app/src/city/markings.ts`, `app/src/city/walkways.ts`, leur branchement dans `app/src/city/souq.ts` et `app/src/render/profiles.ts`) et les balises des données (`app/scripts/osm-tags.ts`, `app/scripts/extract-souq.ts`, `app/data/*.json`)
**Source of truth** : `app/src/city/furniture.ts` (modèles et dimensions réelles), `app/src/city/markings.ts` (bordures et lignes d'arrêt lues des balises de voie) et `app/scripts/osm-tags.ts` (`propKind`, balises retenues)
**Proof** : des tests nommés par l'ID (contrôle `app-009`, `npm test -- -t "APP-009"`) : dimensions réelles et pose au sol, rotation dans l'axe de la rue, balises exactes et rien d'inventé, marquages produits seulement par les balises de voie, plafonds, relevé des quatre extraits figés, marquages retirés par le profil « performance » ; la marche est rejouée sur les quatre itinéraires dans Chromium avec le mobilier et les marquages, sans erreur WebGL, ville effacée tête baissée (QUA-020, chemin 24, `app/e2e/mobilier-urbain.test.ts`)
**Reason** : le demandeur veut du mobilier crédible à hauteur d'homme, posé là où les données le disent (`docs/intentions/rendu-rues-mobilier.md`). Limites : la crédibilité du mobilier sur un vrai Quest 3 n'est pas jugée (`docs/intentions/essai-casque-mobilier-urbain.md`) ; les extraits figés ne portent ni lampadaire, ni poubelle, ni panneau, donc ce mobilier reste invisible jusqu'à une nouvelle extraction (`docs/intentions/extraction-mobilier-manquant.md`) ; aucun modèle glTF d'élément remarquable n'est choisi (`docs/intentions/mobilier-remarquable-gltf.md`) ; les dimensions et les teintes du mobilier sont des choix de l'agent.
**Origin** : rendu-rues-mobilier — « des lampadaires, bancs, poubelles et panneaux posés d'après les balises, avec passages, bordures et marquages »
**Check** : `app-009`
**Tests** : `app/src/city/furniture.test.ts`, `app/src/city/markings.test.ts`, `app/src/city/props.test.ts`, `app/src/city/mobilier-data.test.ts`, `app/src/city/tint.test.ts`

## APP-011 — L'ambiance (lumière de l'heure réelle, brouillard, sons, lanternes) ne cache jamais le réel
**Rule** : (1) la lumière suit l'heure locale au départ : soleil de 6 h à 18 h, orange rasant puis blanc de midi, ciel et brouillard de même courbe ; heure illisible remplacée par midi, hauteur du soleil minimale 0,2, jamais de ville noire. (2) Brouillard éteint au premier départ, activable et désactivable pendant la marche : désactivé, `scene.fog` reste nul. (3) Au casque son voile est au plus 0,15 sur toute la portée de 1000 m, nul sous 8 m ; sur écran sans passthrough, plafond 0,9. (4) Aucun ciel ni fond opaque au casque (`scene.background` nul, APP-001) ; le ciel d'écran suit l'heure. (5) Sons coupés au premier départ, aucun contexte audio à volume nul, gain plafonné à 0,2 ; quitter coupe le son. (6) Brouillard et sons se règlent à chaud sur Quest, PC et tablette, sans reconstruction de ville, avec mémoire validée du dernier choix (APP-006, QUA-002). (7) Performance refuse le brouillard même demandé ; aucun profil ne touche la sécurité. (8) De nuit (`Daylight.night`), lanternes et halos brillent ; de jour ils sont éteints. Deux maillages instanciés, aucune source de lumière par mât ; le halo ne change jamais l'alpha du passthrough. La préférence unique Lampadaires, activée au premier départ, retire à chaud les mâts et leurs lanternes et est mémorisée. Lanternes et halos gardent fondu et découpe de la zone tapis (APP-001).
**Scope** : `app/src/render/daylight.ts`, `app/src/render/fog.ts`, `app/src/xr/ambience.ts`, `app/src/xr/ambience-sound.ts`, `app/src/city/street-lights.ts`, `app/src/ui/preferences.ts`, `app/src/ui/walk-preferences.ts`, `app/src/xr/preference-panel.ts`, `app/src/xr/live-preferences.ts`, `app/src/city/live-city.ts`
**Source of truth** : `app/src/render/daylight.ts` (`daylightAt`, `FALLBACK_HOUR`), `app/src/render/fog.ts` (`HEADSET_FOG_MAX`, `FOG_START_M`, `fogFor`, `fogFactorAt`), `app/src/xr/ambience-sound.ts` (`MAX_SOUND_GAIN`, `startAmbienceSound`) et `app/src/xr/ambience.ts` (`startAmbience`)
**Proof** : tests nommés par l'ID (contrôle `app-011`, `npm test -- -t "APP-011"`) : courbe du jour/repli midi, voile sous 0,15 à 1000 m et nul sous 8 m, brouillard coupé/fond XR nul, gain plafonné et son coupé à l'arrêt, mémoire validée, refus Performance, lanternes jour/nuit sans lumière par mât ni effet sur l'alpha, retrait et fondu ; e2e des gestes Quest à chaud, mémoire après réentrée, nuit et jour (QUA-020, `app/e2e/eclairage-ambiance.test.ts`)
**Reason** : le demandeur veut une ville crédible (lumière du moment, ambiance), mais marche sur un tapis : un voile ou un son qui cache un obstacle ou couvre un bruit d'alerte fait chuter (risque du projet : élevé). Les décisions du 2026-11-03 (brouillard plafonné à 0,15 et désactivable, sons coupés par défaut, heure réelle) sont traduites ici en critères mesurables. Limites : le plafond de 0,15, le seuil de 8 m, le gain de 0,2 et les teintes du jour sont des choix de l'agent jugés sur des tests, jamais encore sur un vrai Quest 3 (`docs/intentions/essai-casque-eclairage-ambiance.md`) ; les sons sont un murmure produit par code, pas un enregistrement de ville (`docs/intentions/sons-ambiance-ville.md`) ; la courbe du jour est une sinusoïde fixe, sans saison ni latitude de l'itinéraire.
**Origin** : rendu-eclairage-ambiance — « une lumière qui suit l'heure réelle, un brouillard admis au casque sous 0,15 d'opacité et désactivable, des sons d'ambiance coupés par défaut »
**Check** : `app-011`
**Tests** : `app/src/render/daylight.test.ts`, `app/src/city/street-lights.test.ts`, `app/src/render/fog.test.ts`, `app/src/xr/ambience.test.ts`, `app/src/xr/ambience-sound.test.ts`, `app/src/ui/preferences.test.ts`, `app/src/ui/walk-preferences.test.ts`, `app/src/ui/home.test.ts`, `app/src/xr/experience.test.ts`, `app/src/xr/experience-pc.test.ts`, `app/src/xr/experience-preferences.test.ts`, `app/src/render/profiles.test.ts`

## APP-012 — Les matériaux locaux d'un quartier : embarqués, bornés, appliqués automatiquement, effacés avec la ville
**Rule** : (1) une bibliothèque de matériaux embarquée est appliquée automatiquement lorsqu'elle existe pour l'itinéraire (aujourd'hui le souk Waqif seul), sans option d'accueil ni préférence ; ailleurs les teintes OpenStreetMap et la palette demeurent. (2) La bibliothèque est une donnée par quartier (`app/assets/materials/<itinéraire>.json`) préparée hors casque par un script paramétré par l'itinéraire ; le rendu n'a aucun code propre à un quartier. (3) Ses textures sont des KTX2 ou des JPEG embarqués en `data:` (aucune autre forme acceptée) ; un KTX2 est transcodé par le transcodeur WebAssembly de three.js servi avec la page (`/basis/`), jamais par un autre serveur : aucun appel réseau pendant la marche ; seules des textures CC0 y entrent, avec leur provenance (`app/assets/PROVENANCE.md`) ; les photos de rue ne sont citées que par lien et identifiant, jamais embarquées. (4) Au plus 3 matériaux par quartier et au plus 4 Mo de textures en mémoire graphique (estimation mipmaps comprises : 4 octets par pixel pour un JPEG décompressé, 1 pour un KTX2 compressé par le GPU) ; une bibliothèque hors budget est refusée. (5) Le placage n'existe qu'en détail complet des façades (profils « équilibré » et « qualité ») : le profil « performance » le retire (APP-006). (6) Le choix du matériau, de sa teinte, de son échelle et de son usure est déterministe (identifiant OSM) et diffère entre voisins (APP-008). (7) Les matériaux font partie de la ville : tête baissée ils s'effacent avec elle (opacité 0 %, APP-001) ; ils ne touchent ni la vignette, ni la zone tapis, ni le panneau.
**Scope** : la préparation (`app/scripts/panoramax.ts`, `app/scripts/materials-*.ts`), les données (`app/assets/materials/`), le rendu (`app/src/city/material-library.ts`, `app/src/city/material-variation.ts`, `app/src/city/material-mesh.ts`), les textures KTX2 (`app/src/city/material-ktx2.ts`, transcodeur servi par `app/vite.config.ts`), son branchement automatique (`app/src/city/souq.ts`, `app/src/city/live-city.ts`, `app/src/ui/home.ts`)
**Source of truth** : `app/src/city/material-library.ts` (`MAX_LOCAL_MATERIALS`, `MAX_TEXTURE_BYTES`, `textureBytes`, `parseLibrary`, `LIBRARIES`, `hasLocalMaterials`), `app/src/city/material-variation.ts` (`pickAll`) et `app/src/city/material-mesh.ts` (`buildLocalMaterials`)
**Proof** : tests nommés par l'ID (contrôle `app-012`, `npm test -- -t "APP-012"`) : bibliothèque automatique seulement si disponible, refus hors budget ou texture non embarquée (JPEG et KTX2 acceptés, KTX2 compté compressé), textures KTX2 du souk à 512 px dans le budget, KTX2 illisible dit sans casser la ville, transcodeur servi avec la page (plugin Vite, `/basis/`), déterminisme et différence entre voisins, aucun placage en Performance, budget de maillages, ville effacée tête baissée ; e2e du souk avec matériaux KTX2 réellement transcodés dans Chromium, sans requête distante (seul le transcodeur de la page est demandé) ni erreur WebGL, fondu compris (QUA-020, `app/e2e/materiaux-souk.test.ts`)
**Reason** : le demandeur veut retrouver l'identité visuelle du souk (enduit, pierre, bois) sans perdre la sécurité du tapis (risque du projet : élevé) ni la fluidité du casque. Limites : les couleurs sont provisoires (palette du souk) tant qu'aucune photo de rue n'est relevée — Panoramax n'a aucune photo à moins de 30 m du tracé et Mapillary exige le jeton du demandeur (`docs/intentions/couleurs-photos-souk.md`) ; les textures KTX2 (512 px, ETC1S) n'ont pas été jugées au casque : rendu des normales, taille à hauteur d'homme (`docs/intentions/essai-casque-materiaux-souk.md`) ; le rendu n'a jamais été jugé sur un vrai Quest 3 (`docs/intentions/essai-casque-materiaux-souk.md`).
**Origin** : facades-materiaux-souk — « Le rendu matériaux locaux se choisit à l'accueil pour le souk seulement »
**Check** : `app-012`
**Tests** : `app/src/city/material-library.test.ts`, `app/src/city/material-ktx2.test.ts`, `app/src/city/material-variation.test.ts`, `app/src/city/material-mesh.test.ts`, `app/src/city/materials-run.test.ts`, `app/src/city/souq.test.ts`, `app/src/ui/home.test.ts`

## APP-013 — Les lampadaires produits par règle : posés le long des rues, reproductibles, jamais pris pour du réel
**Rule** : (1) OpenStreetMap ne porte aucun lampadaire sur les quatre quartiers : la ville les produit par règle le long des voies, avec un intervalle moyen qui dépend de la classe de voie (`highway`) — voie passante (`trunk`, `primary`, `secondary`, `tertiary` et leurs `_link`) 27,5 m, rue de quartier (`residential`, `unclassified`, `living_street`) 37,5 m, ruelle (`service`, `pedestrian`) 17,5 m — et aucun sur les autres classes (sentiers, escaliers, cheminements `footway`) ; chaque écart est varié de ±20 % par une graine, jamais mécaniquement régulier. (2) La graine dérive de l'identifiant OpenStreetMap de la voie (sans identifiant : la position de son premier sommet) : le même quartier donne les mêmes lampadaires à chaque chargement. Le côté de la rue est choisi par tronçon et non par objet (la balise `sidewalk=left|right` l'impose), le mât est posé à 0,6 m de la bordure et son bras se tend vers la chaussée. (3) Trois refus : l'emplacement tombe dans une emprise de bâtiment, ou le trottoir (de la bordure au mur) est plus étroit que 1,2 m, ou un autre objet est à moins de 2 m. Les objets du relevé OpenStreetMap occupent la place les premiers et ne sont jamais écartés au profit d'un objet produit. (4) Chaque objet porte sa provenance (`source` : `osm` ou `generated`) et le relevé de la scène dit combien viennent de l'un et de l'autre (inscrit sur la page, `data-mobilier`). (5) Les lampadaires produits ont leur propre plafond, réglé par profil graphique (APP-006 : 100 en performance, 300 ailleurs), distinct de celui du mobilier du relevé (400) ; mâts regroupés dans un maillage séparé du mobilier OSM pour le retrait à chaud. (6) La préférence Lampadaires est activée au premier départ, réglable en marche et mémorisée ; elle retire à chaud mâts et lanternes, sans reconstruire la ville. (7) Ils s'effacent avec la ville tête baissée et sont découpés par la zone tapis comme tout le mobilier (APP-001).
**Scope** : `app/src/city/lamp-rule.ts`, `app/src/city/souq-data.ts`, `app/src/city/props.ts`, `app/src/city/souq.ts`, `app/src/city/live-city.ts`, `app/src/render/profiles.ts`, `app/src/ui/preferences.ts`, `app/src/ui/walk-preferences.ts`, `app/src/xr/preference-panel.ts`
**Source of truth** : `app/src/city/lamp-rule.ts` (`generateLamps`, `spacingOf`, `roadSeed`, `MIN_OBJECT_GAP_M`, `MIN_SIDEWALK_M`, `SPACING_JITTER`), `app/src/city/props.ts` (`MAX_GENERATED_LAMPS`, `buildFurniture`, `countSources`), `app/src/render/profiles.ts` (`maxGeneratedLamps`), `app/src/ui/preferences.ts`, `app/src/city/live-city.ts`
**Proof** : des tests nommés par l'ID (contrôle `app-013`, `npm test -- -t "APP-013"`) : intervalle par classe de voie, écart borné par la graine et jamais régulier, mêmes lampadaires à chaque chargement, côté par tronçon et bras vers la chaussée, refus bâtiment / trottoir étroit / 2 m, relevé posé le premier et jamais écarté, provenance et relevé, plafond propre par profil, réglage d'extinction, ville effacée tête baissée ; la marche est rejouée de bout en bout dans le Quest 3 émulé (QUA-020, chemin 27, `app/e2e/lampadaires-generes.test.ts`)
**Reason** : une rue sans le moindre mât paraît vide, et `highway=street_lamp` était déjà demandé sans résultat (`docs/intentions/lampadaires-generes.md`) : on les produit, sans jamais faire passer l'inventé pour du réel (APP-003). Limites : intervalle, hauteur et densité jamais jugés sur vrai Quest 3 (`docs/intentions/seance-casque-parcours.md`) ; 300 mâts coûtent environ 21 600 triangles (calcul) et leur maillage séparé ajoute un appel de rendu ; un mât peut tomber sur le trottoir d'une voie perpendiculaire, la règle ne regarde que bâtiments et objets.
**Origin** : lampadaires-generes — « des lampadaires produits par règle le long des rues, sans jamais faire passer l'inventé pour du réel »
**Check** : `app-013`
**Tests** : `app/src/city/lamp-rule.test.ts`, `app/src/city/souq-lampadaires.test.ts`, `app/src/city/souq-data.test.ts`, `app/src/ui/preferences.test.ts`, `app/src/ui/walk-preferences.test.ts`, `app/src/xr/experience-preferences.test.ts`, `app/src/render/profiles.test.ts`

## APP-014 — La ville vivante : véhicules et piétons produits par règle, jamais devant l'utilisateur
**Rule** : (1) Les figurants sont décrits par données : catalogue de types (`app/assets/figurants-catalogue.json` : modèles, lieu — chaussée, trottoir ou voie piétonne —, vitesse, gabarit), classes de voie et tables régionales de densité, poids et côté de conduite, défaut `ailleurs` ; `golfe` réglé, `inde` provisoire. Aucun type en dur : ajout par modèle et donnée. (2) Circulation sur les voies de leur lieu : véhicules selon `oneway`, côté régional et nombre de `lanes` ; piétons sur trottoirs et voies piétonnes, jamais sur un passage piéton seul ; aucun trajet dans un bâtiment. (3) Graine OSM reproductible, même vitesse et écart conservé sur une voie et un sens. (4) Vitesses plafonnées à 30 km/h et 6 km/h ; transition sur 4 m aux bouts de trajet, retrait entre 14 et 10 m de l'utilisateur ; fondu, vignette et découpe tapis inchangés (APP-001). (5) Plafonds par profil (APP-006), plus proches du parcours d'abord ; un maillage instancié par modèle. (6) Une seule préférence Ville vivante commande ensemble véhicules et piétons, désactivée au premier départ, sur les seuls itinéraires du catalogue (Souq Waqif). Choix à chaud mémorisé, sans reconstruction de ville : désactivés, les groupes préparés restent invisibles. (7) Modèles CC0 lus en mémoire sans exécution, allégés et embarqués dans `app/assets/figurants.json` ; origine, empreinte et licence dans `app/assets/PROVENANCE.md`. Fichier illisible ou hors plafond refusé avec raison.
**Scope** : moteur `app/src/city/traffic-*.ts`, catalogue/modèles `app/assets/`, préparation `app/scripts/prepare-traffic-pack.ts`, `app/scripts/glb-scene.ts`, `app/scripts/png-read.ts`, branchement `app/src/city/souq.ts`, `app/src/city/live-city.ts`, plafonds `app/src/render/profiles.ts`, préférences `app/src/ui/preferences.ts`, `app/src/ui/walk-preferences.ts`, balises `app/scripts/osm-tags.ts`, `app/scripts/extract-souq.ts`, `app/src/city/souq-data.ts`
**Source of truth** : `app/assets/figurants-catalogue.json`, `app/src/city/traffic-rule.ts` (`planTraffic`, `MAX_SPEED_KMH`), `app/src/city/traffic-motion.ts` (`KEEP_OUT_M`, `FADE_M`), `app/src/render/profiles.ts` (`maxVehicles`, `maxPedestrians`), `app/src/ui/preferences.ts`, `app/src/city/live-city.ts`
**Proof** : tests nommés par l'ID dans `coverage-app` : catalogue/régions en données, sens/côté/voies multiples, trottoirs et bâtiments, graine, vitesses, retrait près de l'utilisateur, plafonds, défaut désactivé et itinéraires listés, commande unique à chaud, mémoire, pack valide/refusé avec raison ; e2e Quest avec et sans figurants, marche continue et fondu (QUA-020, `app/e2e/eclairage-ambiance.test.ts`)
**Reason** : le demandeur veut une ville vivante produite par un moteur générique réglé par région, mis au point au souk seul, sans jamais retirer la vue du réel (risque de chute). Limites : densités, vitesses et gabarits sont des choix de l'agent jugés sur des tests, jamais sur un vrai Quest 3 (`docs/intentions/essai-casque-ville-vivante.md`) ; les piétons glissent (sans squelette, un appel de rendu par modèle plutôt qu'un par piéton, `docs/intentions/pietons-animes.md`) ; le coût (de 15 à 27 appels de rendu, de 90 865 à 203 618 triangles sur la scène du souk entière en qualité) est relevé par un test, pas au casque.
**Origin** : ville-vivante-souk — « Une case « Circulation et piétons », décochée par défaut, fait apparaître véhicules et piétons ; décochée, la scène n'en contient aucun »
**Check** : `coverage-app`, `e2e`
**Tests** : `app/src/city/traffic-catalog.test.ts`, `app/src/city/traffic-lanes.test.ts`, `app/src/city/traffic-rule.test.ts`, `app/src/city/traffic-motion.test.ts`, `app/src/city/traffic-pack.test.ts`, `app/src/city/traffic.test.ts`, `app/src/city/traffic-budget.test.ts`, `app/src/city/prepare-traffic-pack.test.ts`, `app/src/ui/preferences.test.ts`, `app/src/ui/walk-preferences.test.ts`, `app/src/xr/experience-preferences.test.ts`, `app/src/render/profiles.test.ts`, `app/src/city/extract-souq.test.ts`

## APP-015 — Les trois plateformes (casque, PC, tablette) montrent la même ville
**Rule** : (1) Pour une même ville et les mêmes options de l'accueil, le casque, le PC et la tablette montrent les mêmes éléments de ville : bâtiments, voies, verdure, arbres, mobilier, lampadaires produits et leurs lanternes, figurants, noms de rues, matériaux locaux. Chaque option de l'accueil qui agit sur la ville (matériaux, lampadaires produits, lampadaires allumés, ville vivante, arbres, profil) atteint la scène des trois modes. (2) La liste fermée de ce qui peut différer : les commandes (dont les repères de choix aux carrefours, la minicarte et les panneaux du casque), le passthrough et ses protections (APP-001, casque seul), le ciel et le brouillard (APP-011), les profils par défaut. (3) Exception déclarée : le rendu Google 3D est indisponible sur PC et tablette, avec repli annoncé (`PC_GOOGLE_NOTICE`). (4) Toute nouvelle fonction d'accueil qui agit sur la ville est vérifiée sur les trois modes par ce test, dans le même chantier.
**Scope** : `app/src/xr/experience.ts`, `app/src/pc/enter-pc.ts`, `app/src/xr/live-preferences.ts`, `app/src/city/live-city.ts`, `app/src/city/souq.ts`
**Source of truth** : `app/src/xr/parity.test.ts` (la liste des options et des modes), `app/src/city/live-city.ts` (`createLiveCity`, construction commune)
**Proof** : un test unique nommé par l'ID, paramétré sur le casque, le PC et la tablette, deux villes (Pune Vieille ville, Souq Waqif) et cinq jeux d'options : il compare les groupes et maillages visibles de la ville, les matériaux distincts et les relevés de la page ; retirer le branchement d'une option dans un mode le fait échouer (essai fait à la main sur les matériaux et sur les préférences à chaud). Le test tourne dans `coverage-app`, sans casque réel (doublures du renderer et de la session)
**Reason** : le demandeur exige la même ville partout et que toute évolution vaille pour les trois (`docs/intentions/parite-plateformes.md`) ; sans test, une option pouvait n'atteindre qu'un mode. Limites : la tablette suit le même chemin de code que le PC (`enterPc`), le test ne simule pas le toucher (couvert par `app/e2e/tablette-tactile.test.ts`) ; les figurants ne se chargent pas dans la doublure, seul leur relevé de page est comparé ; rien n'est jugé sur un vrai Quest 3.
**Origin** : parite-plateformes — « un contrat testé dont le test échoue quand une option de l'accueil n'atteint pas un mode »
**Check** : `coverage-app`
**Tests** : `app/src/xr/parity.test.ts`

## QUA-014 — Contraste du texte et de son fond (RGAA 4.1 / WCAG AA)
**Rule** : tout texte de l'accueil du casque a un rapport de contraste d'au moins 4,5:1 avec son fond (3:1 pour le grand texte : 24 px, ou 18,5 px gras) ; les couleurs sont déclarées une seule fois, dans les variables de `app/src/ui/home.css`, jamais en dur ailleurs dans la feuille.
**Scope** : les écrans de `app/src/ui/` (accueil, cartes d'itinéraire, panneau de marche)
**Source of truth** : `app/src/ui/home.css` (couleurs), `app/src/ui/contrast.ts` (mesure WCAG)
**Proof** : des tests nommés par l'ID, qui lisent les couleurs dans la feuille de style et mesurent chaque couple texte / fond ; ils tournent avec tous les tests de la couche dans le contrôle `coverage-app`, à chaque commit et en CI
**Reason** : `catalog:QUA-014` adopté par le chantier accueil-casque ; un accueil sombre lu dans un casque doit rester lisible. Limite : les couples sont déclarés dans le test, un nouveau texte sur un nouveau fond doit y être ajouté ; les scripts du kit (le contrôle des couleurs en dur du kit, le contrôle de contraste du kit) ne sont pas installés : `docs/intentions/controles-couleurs-kit.md`.
**Origin** : accueil-casque — « Le texte et son fond respectent un contraste d'au moins 4,5:1 (3:1 pour le grand texte) »
**Check** : `coverage-app`
**Tests** : `app/src/ui/contrast.test.ts`

## QUA-041 — La CI reste complète quand on l'allège
**Rule** : alléger la CI (un seul run par commit de PR, runs périmés annulés, caches, tranches e2e) ne retire ni n'affaiblit aucun contrôle : l'e2e, la couverture, les secrets et le rejeu des hooks de la branche principale tournent toujours en CI ; `push` ne déclenche le workflow que sur la branche principale, la `concurrency` n'annule jamais un run de la branche principale ; en local, l'e2e est « non exécuté », jamais « passé ».
**Scope** : `.github/workflows/ia-first.yml`, `.drwil/ia-first.json`
**Source of truth** : `.github/workflows/ia-first.yml` (déclencheurs, `concurrency`, jobs), `.drwil/ia-first.json` (contrôles, `runAt`, `shards`)
**Proof** : **machine** : la couverture des contrôles par la CI est rejouée à chaque commit (`ci-coverage`, QUA-013) ; **humain** : les déclencheurs et la `concurrency` du workflow, et la durée d'un run de référence avant et après, sur une PR de test
**Reason** : un chantier d'allègement peut retirer un contrôle sans que personne le voie ; la CI est la seule à jouer l'e2e (`runAt: ["ci"]`)
**Origin** : ci-allegee — « Les contrôles qui tournent en CI sont exactement les mêmes qu'avant »
**Check** : `ci-coverage`
**Manual** : lire le workflow (`push` limité à la branche principale, `concurrency` sans annulation sur la branche principale) et relever la durée d'un run de référence avant et après dans le journal du chantier.

## Out of registry (these are not contracts)

| Rule | Nature | Where it lives |
|---|---|---|
| Commits, personal data in an AI's outputs, secrets in tool output, attack testing on a real target, docs kept current in the same commit | conduct (human) | `AGENTS.md`, Conduct section |
| Refactor without behavior change | procedure (human) | `docs/recipes/refactor-without-breaking.md` |
| File size, project-specific code hygiene rules | opt-in tooling (the kit proposes 200 lines, no imposed threshold) | `.githooks/check-file-size.mjs`, `.githooks/check-code-rules.mjs`, `docs/recipes/refactor-without-breaking.md` |
| Tests shipped with every new component | convention (human) | the relevant layer's `AGENTS.md` |
