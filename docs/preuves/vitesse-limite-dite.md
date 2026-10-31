# Preuve de clôture — vitesse-limite-dite

**Clos le** : 2026-10-31
**Commit vérifié** : `9263f2ed48` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Une vitesse saisie hors de la plage de 1 à 8 km/h est ramenée à la borne et l'écran le dit, en nommant la limite et la raison (sécurité sur le tapis) | `QUA-002` | `lint-app` | — |
| La plage de 1 à 8 km/h est lisible à l'accueil avant la saisie, sans avoir à se tromper | `QUA-002` | `lint-app` | — |
| Dans le casque, une vitesse déjà à la borne le dit quand le joystick tente de la dépasser (pas de bascule silencieuse) | `QUA-002` | `lint-app` | — |
| La plage reste de 1 à 8 km/h et le pas de 0,1 : rien d'autre ne change dans le réglage de la vitesse | `APP-002` | `app-002` | — |
| Le message est rejoué de bout en bout dans le Quest 3 émulé : 50 saisi, 8 retenu, limite annoncée | `QUA-020` | `e2e` | — |
