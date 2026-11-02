# Preuve de clôture — tableau-allure-progression

**Clos le** : 2026-11-02
**Commit vérifié** : `7d5758f34f` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| L'allure en minutes par kilomètre se calcule à partir de la vitesse courante, et reste lisible « — » à l'arrêt ou en pause plutôt qu'une valeur absurde | `APP-002` | `app-002` | — |
| La distance restante et la progression en pourcentage s'affichent pour un parcours qui a une arrivée (trajet libre) ; pour une boucle, ce sont celles du tour en cours | `APP-002` | `app-002` | — |
| Le panneau de la page et le tableau de bord du casque disent les mêmes valeurs | `APP-002` | `app-002` | — |
| Le tableau de bord, plus chargé, reste hors de la zone tapis, fondu tête baissée et masqué par le bouton B [humain] | `APP-001` | `app-001` | — |
| Le parcours est rejoué de bout en bout dans le Quest 3 émulé, l'allure, la distance restante et la progression étant lues dans le casque et sur la page | `QUA-020` | `e2e` | — |
| La lisibilité du tableau de bord plus chargé et le tapis resté visible sont jugés sur un vrai Quest 3 [humain] | `APP-001` | `app-001` | — |
