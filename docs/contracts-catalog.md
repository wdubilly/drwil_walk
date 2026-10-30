# Catalog of contracts to adopt

Common **generic** contracts, not installed by default (only the baseline
of `docs/contracts.md` is). `catalog:` prefix: prevents an ID not yet
adopted from being taken for a gap in the registry (same mechanism as for
an ID from another repo). A project adopting a line copies it **without
this prefix** into the `docs/contracts.md` table, adapted to its stack,
then removes it from here once active (no duplicate between catalog and
registry). See `docs/recipes/adopt-the-kit.md` for the adoption process.

Contracts very specific to a business domain (e.g. an HR document format, a
protocol specific to a partner) are **not** in this catalog: they are
written as they come, directly in the project's registry, following the
model of the lines below.

| ID | Rule | Scope | Typical check (to adapt to the stack) |
|---|---|---|---|
| catalog:SEC-001 | Every route declares the permission it requires; default deny if nothing is declared. | API routes | script listing routes without a declared permission |
| catalog:SEC-002 | The front hides a forbidden action, the backend always re-validates it: no authorization decision relies on the front alone. | backend | integration test: direct call bypassing the front, with a role lacking the right |
| catalog:SEC-009 | Every incoming piece of data (request, uploaded file, webhook) is validated/sanitized at the boundary, never used as-is. | API entry points | systematic validation schema (e.g. zod, pydantic) on every route |
| catalog:SEC-011 | Personal data: minimized, access-restricted, never in clear in a log or an AI output. | the whole repo | human review + grep of known fields in logs (partial proof, to document as such) |
| catalog:QUA-003 | CI installs dependencies in locked mode (frozen lockfile, no on-the-fly version resolution). | CI pipeline | `npm ci` / the stack's locked equivalent, never `npm install` in CI |
| catalog:QUA-004 | Test coverage does not drop below a declared threshold; on a project already in test debt at adoption time, the threshold can apply only to the new/changed lines of a staged file (diff coverage), to catch up on untouched legacy code over time. On a new project (a stack started from scratch), the threshold is 100 % from the start on lines, branches, functions and statements, as far as the stack's tool measures them — a mandatory guarantee wired by `npx drwil guarantees`, with no light profile; only a declared and justified file exclusion is allowed. | project source code | coverage report of the stack's test tool, threshold in CI; diff coverage tool (e.g. `diff-cover`, Codecov's "patch" coverage) if adopted on a project in debt |
| catalog:QUA-014 | Text/background contrast per RGAA 4.1 / WCAG AA (4.5:1, 3:1 for large text), light and dark. | front-end screens | `.githooks/check-colors.mjs` (to create), `.githooks/check-contrast.mjs` (to create) — copied from `templates/common/optional/front-quality/` in the kit package, see its README |
| catalog:QUA-020 | The project's critical paths are covered by an automated end-to-end test, replayed in CI. Mandatory guarantee at adoption, for every project: `npx drwil guarantees` writes a blocking brief asking the requester to name the critical paths, closed only once an `e2e` check replays the test. | the project's critical paths | e2e test (e.g. Playwright, Cypress) per path, dedicated CI job |

`catalog:QUA-004` and `catalog:QUA-020` are both mandatory guarantees,
wired by `npx drwil guarantees` once the stack is known: a **new project**
starts at 100 % coverage and with its e2e test of the critical paths; an
**existing project in test debt** gets its coverage threshold at the
measured level (a ratchet, never lowered), 100 % on new or modified code
(diff coverage) and a non-blocking brief to climb to 100 % — the e2e test
is required the same way. A guarantee the tool cannot hold (stack outside
the table, tool missing or not launchable) gets a blocking brief, never a
« passed ». Limit: 100 % coverage proves that every line is **run** by a
test, not that it is **correct** — the e2e test and the business contracts
judge the behavior. Unlike the other lines in this catalog, `catalog:QUA-020`
is not a practice observed as-is in an existing project (its e2e stays
manual there): it is a guarantee specific to drwil, not a direct carry-over.
