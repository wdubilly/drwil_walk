# Preuve de clôture — gen-03-sols-rues

**Clos le** : 2026-11-12
**Commit vérifié** : `1461c120c5` — verdict `drwil verify` : PASS
**Critères acceptés** : empreinte `sha256:1e1790339c838f2e`, acceptés par l'humain au lancement le 2026-11-11

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le revêtement d'une voie suit une règle (balise surface si relevée, sinon valeur de la région) | `APP-009` | `app-009` | — |
| Les bordures restent cohérentes avec les trottoirs et passages, sans raccord flottant ni géométrie invalide | `APP-009` | `app-009` | — |
| Une balise absente donne la valeur de repli de la région, jamais un élément inventé présenté comme relevé | `APP-009` | `app-009` | — |
| Le rendu est reproductible : mêmes données, mêmes sols | `APP-013` | `app-013` | — |
| Les sols s'effacent avec la ville tête baissée [humain] | `APP-001` | `app-001` | — |
| Quest, PC et tablette montrent les mêmes sols | `APP-015` | `coverage-app` | — |
| Le profil « performance » règle la densité des détails sans toucher à la sécurité | `APP-006` | `app-006` | — |
| Les sols du souk et de Pune Vieille ville se reconnaissent d'emblée au casque [humain] | `APP-001` | `app-001` | — |
