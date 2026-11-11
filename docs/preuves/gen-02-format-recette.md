# Preuve de clôture — gen-02-format-recette

**Clos le** : 2026-11-11
**Commit vérifié** : `10be7f95c9` — verdict `drwil verify` : PASS
**Critères acceptés** : empreinte `sha256:9463ab9d5ebc441a`, acceptés par l'humain au lancement le 2026-11-11

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| La recette d'une région se lit dans des données ; une région sans entrée prend ailleurs sans erreur | `APP-008` | `app-008` | — |
| Une surcharge de quartier l'emporte sur la région, sans code propre au quartier | `APP-008` | `app-008` | — |
| Les façades restent déterministes, variées sans répétition voisine et légères avec la recette en données | `APP-008` | `app-008` | — |
| Les matériaux locaux tirés de photos gardent la priorité sur le repli de la recette | `APP-012` | `app-012` | — |
| Chaque élément de la recette porte son origine (relevé ou ajouté par règle) ; une preuve relit ce champ et refuse un élément ajouté présenté comme relevé | `APP-013` | `app-013` | — |
| Les figurants lisent leur table de région dans le même format | `APP-014` | `coverage-app`, `e2e` | — |
| Quest, PC et tablette montrent la même recette | `APP-015` | `coverage-app` | — |
| La ville reste effacée tête baissée avec la recette appliquée [humain] | `APP-001` | `app-001` | — |
| Les teintes de chaque région sont jugées au casque ou sur captures | `APP-008` | `app-008` | — |
