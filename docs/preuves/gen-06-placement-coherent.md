# Preuve de clôture — gen-06-placement-coherent

**Clos le** : 2026-11-12
**Commit vérifié** : `5bda02d92e` — verdict `drwil verify` : PASS
**Critères acceptés** : empreinte `sha256:45012a7bea3aa974`, acceptés par l'humain au lancement le 2026-11-12

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Un lampadaire n'est jamais posé sur la chaussée ou le trottoir d'une voie perpendiculaire à un carrefour | `APP-013` | `app-013` | — |
| Les lampadaires restent reproductibles (graine OSM), variés de ±20 % et jamais pris pour du réel | `APP-013` | `app-013` | — |
| Le mobilier posé (banc, poubelle, panneau) reste au sol, tourné dans l'axe du parcours, et n'est jamais inventé quand les données n'en portent pas | `APP-009` | `app-009` | — |
| Les objets produits par règle (arbres, lampadaires) n'obstruent aucun accès : passage piéton, entrée, voie du parcours | `APP-009` | `app-009` | — |
| Les arbres d'alignement suivent la voie avec un espacement varié, déterministe, et un repli quand la voie manque | `APP-009` | `app-009` | — |
| Tout objet produit par règle est marqué « ajouté par règle », distinct du relevé OSM | `APP-013` | `app-013` | — |
| Rien n'est dessiné dans la zone tapis et tout s'efface tête baissée [humain] | `APP-001` | `app-001` | — |
| Les trois plateformes montrent les mêmes arbres, lampadaires et mobilier | `APP-015` | `coverage-app` | — |
| La rue paraît composée et crédible à hauteur d'homme | `APP-013` | `app-013` | — |
