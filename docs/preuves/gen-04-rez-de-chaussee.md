# Preuve de clôture — gen-04-rez-de-chaussee

**Clos le** : 2026-11-12
**Commit vérifié** : `32e6f74eb7` — verdict `drwil verify` : PASS
**Critères acceptés** : empreinte `sha256:10fa90cac7b64b6c`, acceptés par l'humain au lancement le 2026-11-12

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le rez-de-chaussée d'un commerce a vitrine, porte et auvent selon la règle de sa région | `APP-008` | `app-008` | — |
| Deux rez-de-chaussée voisins ne sont jamais identiques et le tirage reste déterministe | `APP-008` | `app-008` | — |
| Les façades restent légères : plafond de triangles respecté, réglé par le profil graphique | `APP-008` | `app-008` | — |
| Sans balise d'usage ou de hauteur, la valeur de repli de la région s'applique, sans géométrie invalide | `APP-008` | `app-008` | — |
| Les rez-de-chaussée s'effacent avec la ville tête baissée [humain] | `APP-001` | `app-001` | — |
| Les mêmes rez-de-chaussée sur Quest, PC et tablette | `APP-015` | `coverage-app` | — |
| Les boutiques ajoutées par règle sont distinguées des commerces relevés dans les données | `APP-013` | `app-013` | — |
| Les rues commerçantes du souk et de Pune Vieille ville se reconnaissent d'emblée au casque [humain] | `APP-001` | `app-001` | — |
