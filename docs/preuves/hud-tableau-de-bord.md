# Preuve de clôture — hud-tableau-de-bord

**Clos le** : 2026-11-01
**Commit vérifié** : `558918931d` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le tableau de bord est affiché par défaut dans le casque ; le bouton B le masque et le réaffiche | `APP-002` | `app-002` | — |
| Il montre la vitesse, la durée et la distance, justes : la distance est égale à la vitesse réglée multipliée par le temps de marche | `APP-002` | `app-002` | — |
| Il montre une estimation de calories, étiquetée « environ », calculée depuis la vitesse, la durée et le poids de l'utilisateur ; sans poids saisi, une valeur moyenne fixe est utilisée | `APP-002` | `app-002` | — |
| Le poids se saisit une fois à l'accueil, est facultatif, et n'est gardé que dans le navigateur du Quest ; il peut être effacé | `SEC-007` | `secrets` | — |
| Il montre une boussole et le lieu courant (nom de la rue ou du lieu, lu dans l'extrait) ; sans nom connu, il le dit proprement | `APP-003` | `app-003` | — |
| Il montre l'heure locale | `APP-002` | `app-002` | — |
| Tout le tableau de bord suit le fondu tête baissée, reste hors de la zone tapis et ne se pose pas là où il masquerait le tapis [humain] | `APP-001` | `app-001` | — |
| Le tableau de bord est rejoué de bout en bout dans le Quest 3 émulé | `QUA-020` | `e2e` | — |
