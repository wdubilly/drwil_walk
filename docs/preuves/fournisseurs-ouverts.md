# Preuve de clôture — fournisseurs-ouverts

**Clos le** : 2026-10-31
**Commit vérifié** : `338e308be6` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le routage piéton, la recherche d'adresse et le géocodage inverse passent par des interfaces ; Valhalla (routage) et Photon (adresses) sont les implémentations par défaut, sans aucune clé | `APP-002` | `app-002` | — |
| Sans aucune clé, l'itinéraire libre marche de bout en bout : adresse ou carte, chemin à pied, marche, arrêt à l'arrivée | `QUA-020` | `e2e` | — |
| L'adresse du service de routage et celle du service d'adresses se règlent par une variable non secrète, pour pointer vers une instance auto-hébergée | `APP-002` | `app-002` | — |
| Si un service public est indisponible ou refuse la demande, la raison est dite à l'écran, et les quatre itinéraires figés restent utilisables | `QUA-002` | `lint-app` | — |
| Le rendu Google 3D reste choisissable avec une clé ; sur un refus 403 des tuiles, le message évoque la restriction de l'EEA | `QUA-002` | `lint-app` | — |
| L'attribution OpenStreetMap couvre les sources d'adresses et de routage utilisées | `APP-003` | `app-003` | — |
| Le fondu de sécurité reste actif sur un trajet libre [humain] | `APP-001` | `app-001` | — |
