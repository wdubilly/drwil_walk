# Preuve de clôture — osm-enrichi

**Clos le** : 2026-10-31
**Commit vérifié** : `ef81f665ad` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Les couleurs et matériaux OSM des bâtiments (building:colour, roof:colour, building:material) teintent le bâtiment ; sans balise, il garde un ton de la palette de l'itinéraire | `APP-003` | `app-003` | — |
| Les arbres (natural=tree) et du mobilier urbain simple de l'extrait s'affichent, en peu de maillages | `APP-003` | `app-003` | — |
| Un ombrage par sommet (assombrissement vers le pied des bâtiments) donne du relief aux volumes | `APP-003` | `app-003` | — |
| Le fondu de sécurité efface tout ce qui s'ajoute : arbres, mobilier, bâtiments teintés [humain] | `APP-001` | `app-001` | — |
| Les quatre extraits versionnés portent les nouvelles balises, et l'extraction d'un trajet libre les lit aussi | `APP-003` | `app-003` | — |
| Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le rendu enrichi | `QUA-020` | `e2e` | — |
