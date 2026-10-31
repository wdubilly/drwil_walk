# Preuve de clôture — itineraire-libre

**Clos le** : 2026-10-31
**Commit vérifié** : `b56ebb457c` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| L'accueil propose « Itinéraire libre » en plus des quatre cartes ; le demandeur y choisit un départ et une arrivée en touchant une carte ou en cherchant un lieu ou une adresse (les deux modes se remplissent mutuellement) | `QUA-020` | `e2e` | — |
| Une adresse introuvable, une saisie vide, une clé absente ou refusée, un trajet de plus de 5 km : la raison est dite à l'écran, les quatre itinéraires figés restent utilisables | `QUA-002` | `lint-app` | — |
| Le chemin à pied entre les deux points est calculé par un service de routage, puis la marche le suit à la vitesse réglée ; en cas d'échec du calcul, une raison est dite à l'écran (jamais silencieux) | `QUA-002` | `lint-app` | — |
| Un trajet libre ne boucle pas : à l'arrivée la marche s'arrête et le dit | `APP-002` | `app-002` | — |
| La ville autour du trajet vient du rendu Google 3D (chantier google-3d-tiles) ou, à défaut, de bâtiments OpenStreetMap chargés pour le trajet, avec l'attribution de la source | `APP-003` | `app-003` | — |
| Le fondu de sécurité reste actif sur un trajet libre [humain] | `APP-001` | `app-001` | — |
| Le parcours libre est rejoué de bout en bout dans le Quest 3 émulé, service de routage factice | `QUA-020` | `e2e` | — |
