# Preuve de clôture — rendu-sources-donnees

**Clos le** : 2026-11-03
**Commit vérifié** : `3b656540c1` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Un script mesure, sur les quatre zones des extraits, ce qu'Overture apporte que OpenStreetMap n'a pas (hauteurs, types, adresses) et écrit un relevé chiffré | `QUA-011` | `docs-references` | — |
| La licence de chaque couche d'Overture utilisée est vérifiée et écrite avant tout import | `APP-003` | `app-003` | — |
| Aucune donnée d'Overture n'entre dans app/data/ ni dans l'application : la ville reste celle d'OpenStreetMap | `APP-003` | `app-003` | — |
| Le script n'est jamais lancé par l'application ni pendant la marche : aucun accès réseau en marche (hors trajet libre) | `APP-003` | `app-003` | — |
| Le relevé chiffré et les licences sont écrits dans l'intention, pour que le demandeur décide d'intégrer ou non Overture (la décision elle-même est le lot 3, un point à trancher) | `QUA-011` | `docs-references` | — |
