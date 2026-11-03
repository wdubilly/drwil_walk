# Preuve de clôture — rendu-rues-mobilier

**Clos le** : 2026-11-03
**Commit vérifié** : `3866056ef6` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Les lampadaires et les bancs sont posés d'après les balises OpenStreetMap des extraits, au sol, à l'échelle réelle ; aucun n'est inventé quand les données n'en portent pas | `APP-009` | `app-009` | — |
| Le mobilier courant (bancs, poubelles, lampadaires, panneaux) est généré par code ; un élément particulier ou remarquable peut venir d'un modèle glTF CC0 dont la licence et la provenance sont documentées | `APP-003` | `app-003` | — |
| Les passages piétons, bordures et marquages sont posés d'après les balises de voie des extraits ; une balise absente ne produit rien | `APP-009` | `app-009` | — |
| Le mobilier se règle par le profil graphique (densité réduite en « performance ») et reste plafonné | `APP-009` | `app-009` | — |
| Rien de ce mobilier ne masque le réel visible : tête baissée, la ville s'efface [humain] | `APP-001` | `app-001` | — |
| La marche se rejoue sur les quatre itinéraires avec le mobilier, sans erreur WebGL | `QUA-020` | `e2e` | — |
| Le mobilier est posé à hauteur d'homme, aux dimensions réelles, et tourné dans l'axe de sa rue | `APP-009` | `app-009` | — |
