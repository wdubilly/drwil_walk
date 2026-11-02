# Preuve de clôture — limites-vitesse-distance

**Clos le** : 2026-11-02
**Commit vérifié** : `6272b92d8a` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Une vitesse de plus de 8 km/h se règle (accueil, joystick, touches de la version PC) et la ville avance à cette vitesse, sans plafond ; le minimum de 1 km/h et le pas de 0,1 km/h restent | `APP-002` | `app-002` | — |
| Une saisie illisible (non numérique, infinie) retombe sur la vitesse par défaut en le disant à l'écran, et plus aucun message ne parle d'un maximum ni d'une « limite de sécurité sur le tapis » | `QUA-002` | `lint-app` | — |
| Un trajet libre de n'importe quelle longueur est accepté : aucun refus avant l'appel au service de routage, ni sur la distance à vol d'oiseau ni sur la longueur du chemin | `APP-002` | `app-002` | — |
| Si la ville d'un trajet très long ne peut pas se charger (Overpass refuse ou ne répond pas), la marche se fait sur le sol seul et la raison est dite à l'écran, sans bloquer le trajet | `QUA-002` | `lint-app` | — |
| La marche à plus de 8 km/h et un trajet libre de plus de 5 km sont rejoués de bout en bout dans le Quest 3 émulé, sans requête hors de la page servie et avec des services factices | `QUA-020` | `e2e` | — |
| La ville s'efface toujours tête baissée, quelle que soit la vitesse [humain] | `APP-001` | `app-001` | — |
