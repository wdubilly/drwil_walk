# Preuve de clôture — carrefours-choix

**Clos le** : 2026-11-02
**Commit vérifié** : `44127db9a3` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| À l'approche d'un carrefour du réseau de voies de l'extrait, les rues possibles sont signalées dans la scène, et l'utilisateur en choisit une en la pointant avec la manette | `APP-002` | `app-002` | — |
| Sans choix avant le carrefour, la marche continue tout droit (la rue la plus proche de la direction courante) : jamais d'arrêt ni de choix imposé | `APP-002` | `app-002` | — |
| Un choix ne déclenche qu'une action et ne change ni la vitesse réglée ni la distance déjà parcourue | `APP-002` | `app-002` | — |
| Au bout d'une voie sans issue ou en bordure de l'extrait, la marche fait demi-tour : on ne sort jamais de la ville chargée, et les rues qui en sortent ne sont pas proposées | `APP-002` | `app-002` | — |
| Sans aucun choix, la marche suit le tracé d'origine de l'itinéraire : le comportement actuel reste le comportement par défaut | `APP-002` | `app-002` | — |
| Pointer une rue ne masque jamais le tapis : les repères de choix suivent le fondu tête baissée [humain] | `APP-001` | `app-001` | — |
| Le choix à un carrefour est rejoué de bout en bout dans le Quest 3 émulé, sur un itinéraire figé | `QUA-020` | `e2e` | — |
