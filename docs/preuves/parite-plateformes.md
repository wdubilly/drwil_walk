# Preuve de clôture — parite-plateformes

**Clos le** : 2026-11-06
**Commit vérifié** : `e04c5849c0` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Un **contrat APP-015** (« les trois plateformes montrent la même ville ») est ajouté à docs/contracts.md, avec la liste fermée de ce qui peut différer : commandes, passthrough (sécurité-visibilité), ciel, profils par défaut | `QUA-011` | `docs-references` | — |
| Un **test unique**, paramétré sur les trois modes (casque, PC, tablette), échoue quand une option de l'accueil qui agit sur la ville (matériaux, lampadaires produits, lampadaires allumés, ville vivante, arbres) n'atteint pas la scène d'un mode ; le test porte l'ID APP-015 | `QUA-029` | `contract-tests` | — |
| Le même test, pour une même ville et les mêmes options, vérifie que les trois scènes contiennent les mêmes éléments de ville (bâtiments, arbres, mobilier, lampadaires, figurants) | `APP-015` | `coverage-app` | — |
| Une option qui n'atteint pas un mode est **corrigée** dans ce chantier ; l'écart du rendu Google 3D reste déclaré et testé comme exception (repli annoncé) | `APP-015` | `coverage-app` | — |
| APP-001 reste vérifié sur le casque, inchangé [humain] | `APP-001` | `app-001` | — |
| La recette de chantier (docs/recipes/) et app/AGENTS.md disent : toute fonction d'accueil se vérifie sur les trois modes ; docs/features.md et docs/architecture.md listent ce qui est propre à chaque plateforme | `QUA-011` | `docs-references` | — |
