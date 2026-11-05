# Preuve de clôture — ville-vivante-souk

**Clos le** : 2026-11-05
**Commit vérifié** : `31d9f61bad` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| La nuit (soleil sous l'horizon), les lanternes des lampadaires, du relevé comme produits par règle, brillent et posent un halo au sol, sans aucune source de lumière par mât ; le jour, elles sont éteintes | `APP-011` | `app-011` | — |
| Une case « Lampadaires allumés la nuit », cochée par défaut, éteint les lanternes quand elle est décochée | `APP-011` | `app-011` | — |
| Une case « Circulation et piétons », décochée par défaut, fait apparaître véhicules et piétons ; décochée, la scène n'en contient aucun | `APP-014` | `coverage-app`, `e2e` | — |
| Véhicules (voitures, deux-roues) sur les seules voies carrossables, dans le sens de la voie (oneway lu de l'extrait) ; piétons sur les trottoirs (sidewalk) et les voies piétonnes ; aucun figurant dans un bâtiment | `APP-014` | `coverage-app`, `e2e` | — |
| Aucun figurant ne traverse devant l'utilisateur ni n'entre dans la zone tapis ; leur vitesse est plafonnée ; le fondu tête baissée et la vignette s'appliquent à eux comme au reste de la ville — APP-001, | `APP-014` | `coverage-app`, `e2e` | — |
| Placement et trajets reproductibles (graine tirée de l'identifiant OSM de la voie) et réglés par une table de région (golfe réglé ici, inde prévu avec des valeurs provisoires) | `APP-014` | `coverage-app`, `e2e` | — |
| Nombre de figurants plafonné par profil graphique (moins en « performance ») ; triangles et appels de rendu relevés avant et après, dans les budgets de docs/projects/rendu-lod-cellules.md | `APP-006` | `app-006` | — |
| Les modèles viennent d'un pack gratuit sous licence CC0, allégé et embarqué dans app/assets/, provenance et licence dans app/assets/PROVENANCE.md | `APP-014` | `coverage-app`, `e2e` | — |
| Le souk est réextrait avec les balises lanes, oneway et sidewalk ; bâtiments, mobilier et boucle inchangés, chaque point de la boucle reste un sommet d'une voie — APP-002, | `APP-003` | `app-003` | — |
| Les trois autres itinéraires sont inchangés, case cochée ou non | `APP-003` | `app-003` | — |
| Le souk de nuit, avec et sans circulation, jugé sur un vrai Quest 3 [humain] | `APP-001` | `app-001` | — |
