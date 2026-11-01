# Preuve de clôture — rendu-ville-riche

**Clos le** : 2026-11-01
**Commit vérifié** : `a1f5cf3909` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le sol et la route montrent trottoirs et passages piétons tirés des voies d'OpenStreetMap, et le chemin suivi se distingue par son contraste ; les marquages au sol sont ceux d'ambiance-cartoon | `APP-003` | `app-003` | — |
| Le sol montre de l'herbe, des parcs, des jardins et des haies tirés de l'occupation du sol d'OpenStreetMap ; l'extrait figé porte ces balises | `APP-003` | `app-003` | — |
| Les bâtiments ont des toits plus variés (deux pans selon la balise OSM) et des auvents ; la couleur des toits suit le matériau toon d'ambiance-cartoon, sans augmenter le nombre de maillages au-delà d'un budget fixé | `APP-003` | `app-003` | — |
| Les noms des rues s'affichent dans la scène, lisibles, tirés de la balise name de l'extrait | `APP-003` | `app-003` | — |
| Tout ce qui s'ajoute (sol, végétation, toits, noms) est effacé par le fondu tête baissée et reste hors de la zone tapis [humain] | `APP-001` | `app-001` | — |
| Les quatre extraits versionnés portent les nouvelles balises, et l'extraction d'un trajet libre les lit aussi | `APP-003` | `app-003` | — |
| Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le rendu riche | `QUA-020` | `e2e` | — |
