# Preuve de clôture — panneau-discret

**Clos le** : 2026-11-01
**Commit vérifié** : `94a69c6552` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le fond du panneau est légèrement transparent : la réalité se devine derrière, et le texte reste lisible (contraste minimal testé) [humain] | `APP-001` | `app-001` | — |
| Le panneau se place en bas du champ de vision, décalé sur le côté choisi, à l'horizontale, tourné vers soi, et il suit le cap du regard [humain] | `APP-001` | `app-001` | — |
| Le panneau tout entier reste hors de la zone tapis, avec la boîte par défaut comme avec une zone réglée plus haute ou plus large ; sans pose de la tête, il reste caché [humain] | `APP-001` | `app-001` | — |
| Le panneau garde son fondu tête baissée et son masquage par le bouton B [humain] | `APP-001` | `app-001` | — |
| Le côté (gauche ou droite) se choisit à l'accueil, est gardé dans ce navigateur seulement, a un côté par défaut, et une valeur illisible est remplacée par ce défaut | `APP-002` | `app-002` | — |
| Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le panneau de chaque côté | `QUA-020` | `e2e` | — |
| La lisibilité du texte sur fond transparent, le confort de la place et le tapis resté visible sont jugés sur un vrai Quest 3 [humain] | `APP-001` | `app-001` | — |
