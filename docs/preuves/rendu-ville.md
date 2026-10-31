# Preuve de clôture — rendu-ville

**Clos le** : 2026-10-31
**Commit vérifié** : `c027737b13` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Les voies de l'extrait OpenStreetMap sont dessinées sur le sol, d'une teinte distincte du sol, avec une largeur selon leur classe (hypothèse : principales plus larges) | `APP-003` | `app-003` | — |
| Les bâtiments ne sont plus d'une seule teinte : la teinte varie d'un bâtiment à l'autre (hypothèse : trois ou quatre tons de la palette de l'itinéraire, choisis de façon déterministe) | `APP-003` | `app-003` | — |
| Chaque itinéraire a sa palette (sol, voies, bâtiments) ; l'accueil et la mention restent lisibles | `APP-003` | `app-003` | — |
| Le fondu de sécurité agit sur la ville entière, voies et bâtiments teintés compris : tête baissée, tout s'efface [humain] | `APP-001` | `app-001` | — |
| Aucun ciel ni fond opaque : scene.background reste nul, le réel reste visible [humain] | `APP-001` | `app-001` | — |
| Les chemins de marche existants restent verts dans le Quest 3 émulé | `QUA-020` | `e2e` | — |
