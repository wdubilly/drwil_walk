# Preuve de clôture — retirer-alias-extraction

**Clos le** : 2026-11-03
**Commit vérifié** : `178a50a274` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Les trois alias n'existent plus : toute ville s'extrait par extractCity et CITIES, sans fichier par ville | `APP-003` | `app-003` | — |
| Un seul test paramétré sur CITIES remplace les trois tests par ville et garde leurs vérifications : requête Overpass construite sur l'emprise de la ville, identification (User-Agent) de la ville, repères de la ville dans l'emprise | `APP-003` | `app-003` | — |
| Le test du souk (app/src/city/extract-souq.test.ts) reste tel quel, et les commandes npm run extract* fonctionnent comme avant | `APP-003` | `app-003` | — |
| La couverture reste à 100 % sans aucune exclusion | `QUA-004` | `coverage-app`, `coverage-diff-app` | — |
| app/AGENTS.md, docs/architecture.md et le contrat APP-003 ne citent plus les alias | `QUA-011` | `docs-references` | — |
