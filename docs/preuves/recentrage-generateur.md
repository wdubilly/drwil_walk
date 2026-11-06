# Preuve de clôture — recentrage-generateur

**Clos le** : 2026-11-06
**Commit vérifié** : `4568fcca16` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| **Google 3D supprimé** : plus de fabrique de tuiles, mode Google, choix de rendu de l'accueil, mention ni crédit Google, plus de test ni de contrat qui le cite ; le rendu OpenStreetMap est le seul | `APP-003` | `app-003` | — |
| **Parcours libre supprimé** : plus de recherche d'adresse, écran/préparation ni fournisseur de trajet libre, plus d'e2e spécifique, de clé ni de réseau à la marche ; la marche reste une boucle d'itinéraire | `APP-002` | `app-002` | — |
| **Accueil réduit** : seuls l'itinéraire et la vitesse sont visibles ; poids, matériaux, lampadaires, ville vivante, arbres, brouillard, sons, côté et opacité du panneau, vignette n'y sont plus ; les préférences réglables en marche reprennent le dernier choix, sinon leur valeur initiale (qualité Équilibré). Les anciens réglages sont ignorés sauf le profil déjà mémorisé. Matériaux locaux, poids et vignette ne sont pas exposés comme préférences ; aucune calorie personnalisée calculée avec un poids supposé ne doit être présentée comme exacte — APP-006, APP-008, APP-011, APP-012, APP-013, | `APP-014` | `coverage-app`, `e2e` | — |
| **Préférences en marche** : l'utilisateur règle pendant la marche, sur Quest, PC et tablette, sans la quitter, les préférences retenues (qualité, ville vivante, lampadaires, arbres, brouillard, sons, côté et opacité du panneau) ; chaque choix devient son dernier choix, repris au départ de la marche suivante ; la première marche part des valeurs par défaut (qualité Équilibré) ; chaque changement s'applique à chaud, sans reconstruire la ville — APP-006, APP-011, APP-013, | `APP-014` | `coverage-app`, `e2e` | — |
| La **sécurité-visibilité ne bouge pas** : aucun niveau ni retrait d'option n'affecte le passthrough, et le changement de qualité en marche ne cache jamais le réel [humain] | `APP-001` | `app-001` | — |
| Les e2e des chemins critiques sont **réécrits** pour le parcours réduit (sans Google ni parcours libre), pas supprimés | `QUA-011` | `docs-references` | — |
| Docs à jour : README.md, app/AGENTS.md, docs/architecture.md, docs/features.md, docs/guide-utilisateur.md ; docs/contracts.md : APP-002 et APP-003 perdent le trajet libre et Google, les contrats d'options de l'accueil sont relus | `QUA-011` | `docs-references` | — |
