# Preuve de clôture — champ-de-vision-casque

**Clos le** : 2026-11-01
**Commit vérifié** : `3a75af5332` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Pour un champ de vision cible du Quest 3 (valeurs et marge déclarées en un seul endroit, sourcées), un calcul de projection dit si un point ou un rectangle posé dans la scène est dans la vue d'une tête donnée (position, cap, inclinaison), marge comprise ; il est juste sur des cas synthétiques aux bornes (juste dedans, juste dehors, tête tournée, tête inclinée) [humain] | `APP-004` | `app-004` | — |
| Le Quest 3 émulé (IWER) rejoue la marche avec le masque de champ de vision de la cible, et une capture du rendu masqué est publiée par la CI, comme les captures des parcours existants | `QUA-020` | `e2e` | — |
