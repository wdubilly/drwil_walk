# Preuve de clôture — ci-allegee

**Clos le** : 2026-11-11
**Commit vérifié** : `07e4b73e4d` — verdict `drwil verify` : PASS
**Critères acceptés** : empreinte `sha256:725c65d5d096bc12`, acceptés par l'humain au lancement le 2026-11-11

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Un commit poussé sur une branche avec PR ne lance qu'un run de contrôles complet, et la branche principale garde le sien [humain] | `QUA-041` | `ci-coverage` | — |
| Un push qui rend un run en cours périmé l'annule, sans jamais annuler un run de la branche principale [humain] | `QUA-041` | `ci-coverage` | — |
| L'e2e est réservé à la CI (runAt) : joué par la CI de chaque PR, « non exécuté » (jamais « passé ») en local | `QUA-020` | `e2e` | — |
| Les contrôles qui tournent en CI sont exactement les mêmes qu'avant (e2e, couverture, secrets, rejeu des hooks de la branche principale) : le workflow n'en retire aucun | `QUA-013` | `ci-coverage` | — |
| Le contrôle e2e est découpé en tranches parallèles (shards, kit 0.11.1) : la CI joue une tranche par job, le job checks agrège leurs verdicts, et une tranche manquante, en double ou en échec fait échouer l'agrégation | `QUA-013` | `ci-coverage` | — |
| En local, run-checks et drwil verify ne jouent plus l'e2e (runAt: ["ci"]) : il est « non exécuté », jamais « passé », et aucune tranche n'est jouée à moitié [humain] | `QUA-041` | `ci-coverage` | — |
| La durée d'un run de référence, avant et après, est relevée dans le journal du chantier [humain] | `QUA-041` | `ci-coverage` | — |
