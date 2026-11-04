# Preuve de clôture — lampadaires-generes

**Clos le** : 2026-11-04
**Commit vérifié** : `9ad8d8c66e` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Les lampadaires produits suivent les rues, avec un intervalle qui dépend de la classe de voie (highway) et non d'une constante unique | `APP-013` | `app-013` | — |
| L'espacement n'est jamais mécaniquement régulier : un écart tiré d'une graine stable le fait varier | `APP-013` | `app-013` | — |
| Le même quartier donne toujours les mêmes lampadaires, promenade après promenade (graine dérivée de l'identifiant de la voie) | `APP-013` | `app-013` | — |
| Aucun lampadaire ne tombe dans une emprise de bâtiment, sur un trottoir trop étroit, ni à moins de 2 m d'un autre objet | `APP-013` | `app-013` | — |
| Les objets issus d'OpenStreetMap sont posés les premiers et ne sont jamais écartés au profit d'un objet produit | `APP-013` | `app-013` | — |
| Chaque objet porte sa provenance (source), et un relevé dit combien viennent d'OpenStreetMap et combien sont produits | `APP-003` | `app-003` | — |
| Les lampadaires produits ont leur propre plafond, réglé par profil graphique, distinct de celui du mobilier | `APP-006` | `app-006` | — |
| Un réglage éteint les lampadaires produits et ne laisse que le mobilier réel ; ils sont visibles par défaut | `APP-013` | `app-013` | — |
| Les lampadaires s'effacent comme le reste de la ville tête baissée [humain] | `APP-001` | `app-001` | — |
| Les images par seconde avant et après sur un vrai Quest 3 [humain] | `APP-001` | `app-001` | — |
