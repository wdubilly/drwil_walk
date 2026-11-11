# Preuve de clôture — gen-01-essai-commande

**Clos le** : 2026-11-11
**Commit vérifié** : `a865089019` — verdict `drwil verify` : PASS
**Critères acceptés** : empreinte `sha256:29a1b41a066b4cf5`, acceptés par l'humain au lancement le 2026-11-11

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Une ville nouvelle, ajoutée dans app/data/villes.json puis créée par la seule commande, s'inscrit à l'accueil sans qu'aucun fichier de code ne change (git diff limité aux données) | `APP-003` | `app-003` | — |
| La ville créée porte l'attribution OpenStreetMap et sa région est déduite sans code propre à la ville | `APP-003` | `app-003` | — |
| Les photos et couleurs locales produites restent bornées et embarquées | `APP-012` | `app-012` | — |
| La ville créée se parcourt sur la boucle produite | `APP-002` | `app-002` | — |
| La ville créée s'efface tête baissée comme les autres [humain] | `APP-001` | `app-001` | — |
| Le rapport d'essai relève la durée, le poids écrit et les échecs ; une donnée manquante ou un service en échec laisse la commande dans un état net (message clair, rien d'à moitié écrit) | `APP-012` | `app-012` | — |
| Le rendu de la ville créée vu au casque, sans jugement de beauté [humain] | `APP-001` | `app-001` | — |
