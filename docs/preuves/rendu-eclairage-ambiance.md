# Preuve de clôture — rendu-eclairage-ambiance

**Clos le** : 2026-11-03
**Commit vérifié** : `4f9e04d954` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| L'éclairage de la ville suit l'heure locale réelle de l'utilisateur ; un repli fixe s'applique si l'heure est illisible | `APP-011` | `app-011` | — |
| Au casque, aucun ciel ni brouillard ne réduit la visibilité du réel : la sécurité-visibilité reste testée avec chaque effet actif [humain] | `APP-001` | `app-001` | — |
| Sur PC et tablette (sans passthrough), un ciel et un brouillard virtuels sont permis | `APP-011` | `app-011` | — |
| Les sons d'ambiance sont coupés par défaut, se règlent à l'accueil et se coupent d'un geste ; aucun son n'est joué sans choix de l'utilisateur | `APP-011` | `app-011` | — |
| Chaque effet se règle par le profil graphique et garde un repli désactivé | `APP-011` | `app-011` | — |
| La marche se rejoue avec chaque effet actif, sans erreur | `QUA-020` | `e2e` | — |
