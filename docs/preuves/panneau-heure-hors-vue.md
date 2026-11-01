# Preuve de clôture — panneau-heure-hors-vue

**Clos le** : 2026-11-01
**Commit vérifié** : `7e3bdf7019` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le panneau d'infos (ses quatre coins et chacune de ses cellules de texte, l'heure comprise) reste tout entier dans le champ de vision de la cible, marge comprise, côté droit comme côté gauche, pour une tête droite, tournée et inclinée dans les limites où le panneau est affiché ; le test a été vu échouer sur le code actuel (l'heure hors vue à droite) avant la correction | `APP-005` | `app-005` | — |
| Le panneau reste hors de la zone tapis, fondu tête baissée, masqué par le bouton B et caché sans pose de la tête, comme avant [humain] | `APP-001` | `app-001` | — |
| La lisibilité du texte, le confort de la place et l'heure bien visible sans tourner la tête sont jugés sur un vrai Quest 3 [humain] | `APP-001` | `app-001` | — |
| Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le masque de champ de vision, les deux côtés | `QUA-020` | `e2e` | — |
