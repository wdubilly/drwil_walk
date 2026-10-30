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
**Source of truth** : —
**Proof** : `license-checker` avec une liste de licences autorisées, au commit et en CI
**Reason** : une dépendance mal licenciée peut interdire de distribuer l'application
**Manual** : contrôle à câbler au premier chantier, quand la stack de `app/` existe (fiche `docs/projects/couverture-app.md`) : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

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
**Source of truth** : —
**Proof** : ESLint (`no-empty`, `@typescript-eslint/no-floating-promises`)
**Reason** : une erreur avalée dans la boucle XR masque une panne au moment où l'utilisateur marche
**Manual** : contrôle à câbler au premier chantier, quand la stack de `app/` existe (fiche `docs/projects/couverture-app.md`) : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

## QUA-004 — Couverture de test à 100 % de la couche app
**Rule** : la couverture de test de la couche `app/`, mesurée par c8 autour de `npm test` (Vitest), est de 100 % en lignes, branches, fonctions et instructions, sans aucune exclusion de fichier (configuration et point d'entrée compris).
**Scope** : tout le code de `app/` (hors `node_modules/` et fichiers de test)
**Source of truth** : le contrôle `coverage-app` de `.drwil/ia-first.json`, écrit par `npx drwil guarantees`
**Proof** : c8 `--check-coverage` à 100 % sur les quatre mesures, avec `--all` (un fichier jamais importé par un test compte à 0 %), au commit, en CI et par `drwil verify`
**Reason** : garantie obligatoire du kit (`catalog:QUA-004`) ; sans casque pour déboguer, chaque ligne doit avoir été exécutée par un test. Limite : 100 % prouve que chaque ligne est exécutée, pas qu'elle est juste.
**Origin** : couverture-app — « Le contrôle de couverture de la couche `app` est déclaré, cité par le contrat de couverture du projet et vert à 100 % »
**Check** : `coverage-app`

## QUA-005 — Typage strict
**Rule** : TypeScript en mode `strict`, aucun `any` injustifié.
**Scope** : le code de `app/`
**Source of truth** : —
**Proof** : `tsc --noEmit` en mode strict
**Reason** : le typage attrape les erreurs avant le casque, où déboguer est difficile
**Manual** : contrôle à câbler au premier chantier, quand la stack de `app/` existe (fiche `docs/projects/couverture-app.md`) : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

## QUA-006 — Un module de logique pure a son test à côté
**Rule** : chaque module de logique pure (sans effet de bord) a son fichier `*.test.ts` juste à côté.
**Scope** : le code de `app/`
**Source of truth** : —
**Proof** : script ou règle de lint listant les modules sans test voisin
**Reason** : la logique de vitesse, d'opacité et de trajectoire reste testable sans casque
**Manual** : contrôle à câbler au premier chantier, quand la stack de `app/` existe (fiche `docs/projects/couverture-app.md`) : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

## QUA-007 — Lint sans avertissement
**Rule** : le lint ne tolère aucun avertissement.
**Scope** : le code de `app/`
**Source of truth** : —
**Proof** : ESLint avec `--max-warnings 0`
**Reason** : un avertissement toléré finit en dette invisible
**Manual** : contrôle à câbler au premier chantier, quand la stack de `app/` existe (fiche `docs/projects/couverture-app.md`) : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

## QUA-008 — Toute suppression de type est justifiée
**Rule** : chaque `@ts-ignore`, `@ts-expect-error` ou `as any` est accompagné d'un commentaire qui en donne la raison.
**Scope** : le code de `app/`
**Source of truth** : —
**Proof** : ESLint (`@typescript-eslint/ban-ts-comment` avec description obligatoire) ou script dédié
**Reason** : une suppression sans raison cache un vrai défaut de type
**Manual** : contrôle à câbler au premier chantier, quand la stack de `app/` existe (fiche `docs/projects/couverture-app.md`) : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

## QUA-009 — Un test désactivé cite la fiche qui le justifie
**Rule** : un test désactivé (`skip`, `todo`) cite l'ID d'une fiche ouverte de `docs/projects/` qui justifie sa désactivation (QUA-019 appliqué aux tests).
**Scope** : le code de `app/`, `docs/projects/`
**Source of truth** : —
**Proof** : script listant les tests désactivés sans fiche citée à côté
**Reason** : un test éteint en silence est un contrôle contourné
**Manual** : contrôle à câbler au premier chantier, quand la stack de `app/` existe (fiche `docs/projects/couverture-app.md`) : le déclarer dans `.drwil/ia-first.json` → `checks` avec un `id`, le citer ici en **Check**, puis retirer ce champ.

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
**Source of truth** : le module safety de `app/` (à écrire au premier chantier)
**Proof** : des tests de cette règle, nommés par son ID, déclarés comme contrôle propre (`.drwil/ia-first.json` → `checks`, avec un `id`, filtrant les tests par l'ID : `npm test -- -t "APP-001"`), rejoués par `drwil verify` à chaque chantier
**Reason** : l'utilisateur marche sur un tapis en mouvement avec un casque : s'il ne voit plus le tapis, la rampe ou le bouton d'arrêt, il risque de chuter (risque du projet : élevé)
**Manual** : contrôle à compléter au premier chantier : écrire les tests, les déclarer dans `checks` avec un `id`, les citer ici en **Check**, lister leurs fichiers en **Tests**, puis retirer ce champ (`docs/recipes/adopt-the-kit.md`, étape 5). D'ici là, vérification humaine sur le Quest 3.


## Out of registry (these are not contracts)

| Rule | Nature | Where it lives |
|---|---|---|
| Commits, personal data in an AI's outputs, secrets in tool output, attack testing on a real target, docs kept current in the same commit | conduct (human) | `AGENTS.md`, Conduct section |
| Refactor without behavior change | procedure (human) | `docs/recipes/refactor-without-breaking.md` |
| File size, project-specific code hygiene rules | opt-in tooling (the kit proposes 200 lines, no imposed threshold) | `.githooks/check-file-size.mjs`, `.githooks/check-code-rules.mjs`, `docs/recipes/refactor-without-breaking.md` |
| Tests shipped with every new component | convention (human) | the relevant layer's `AGENTS.md` |
