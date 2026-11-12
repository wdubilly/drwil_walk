# Preuve de clôture — gen-05-materiaux-repli

**Clos le** : 2026-11-12
**Commit vérifié** : `a4cbfa4172` — verdict `drwil verify` : PASS
**Critères acceptés** : empreinte `sha256:dfadb49bc73f4f54`, acceptés par l'humain au lancement le 2026-11-12

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Un quartier sans photo ni bibliothèque reçoit des matériaux de repli de sa région, appliqués automatiquement, sans code propre à une ville | `APP-012` | `app-012` | — |
| Une région sans repli propre prend celui d'« ailleurs » ; une donnée de matériau illisible ne casse pas la ville | `APP-012` | `app-012` | — |
| Le repli reste dans les bornes du contrat (nombre de matériaux, mémoire graphique, textures embarquées, CC0 avec provenance) et sans appel réseau pendant la marche | `APP-012` | `app-012` | — |
| Les matériaux de repli diffèrent entre bâtiments voisins et sont déterministes (identifiant OSM) | `APP-012` | `app-012` | — |
| Le profil « performance » retire tout placage, le profil de rendu règle le reste | `APP-012` | `app-012` | — |
| Tête baissée, les matériaux (repli compris) s'effacent avec la ville [humain] | `APP-001` | `app-001` | — |
| Les trois plateformes montrent les mêmes matériaux | `APP-015` | `coverage-app` | — |
| Le souk et un quartier au repli sont reconnaissables au casque, images par seconde relevées [humain] | `APP-001` | `app-001` | — |
