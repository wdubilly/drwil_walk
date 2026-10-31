# Preuve de clôture — doha-corniche

**Clos le** : 2026-10-31
**Commit vérifié** : `297b289b10` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| La carte de l'itinéraire passe à available: true (app/src/route/itineraries.ts) ; elle se choisit et démarre la marche sur son propre tracé | `QUA-020` | `e2e` | — |
| La marche suit le parcours GPS de la boucle : distance parcourue = vitesse réglée × temps, reprise au départ à la fin | `APP-002` | `app-002` | — |
| Les bâtiments affichés sont ceux de l'extrait OpenStreetMap versionné de cet itinéraire, avec la mention « © contributeurs OpenStreetMap » à l'accueil et dans le casque | `APP-003` | `app-003` | — |
| Le fondu de sécurité reste actif sur cet itinéraire [humain] | `APP-001` | `app-001` | — |
| Le parcours est rejoué de bout en bout dans le Quest 3 émulé, avec captures d'écran | `QUA-020` | `e2e` | — |
