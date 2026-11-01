# Preuve de clôture — arbres-pack-quaternius

**Clos le** : 2026-11-01
**Commit vérifié** : `d58c656062` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Les arbres de l'extrait sont les modèles du pack Standard, choisis de façon déterministe parmi quelques variantes, dessinés en instances, dans le plafond d'arbres existant (MAX_TREES) et sous un plafond de triangles testé | `APP-003` | `app-003` | — |
| La provenance du pack (nom, adresse de la page, version Standard, date de téléchargement, licence CC0, fichiers retenus, nombre d'arbres réellement fournis) est écrite dans le dépôt, à côté des fichiers | `APP-003` | `app-003` | — |
| Aucun appel réseau dans le casque pour les arbres : les modèles sont embarqués dans le dépôt | `APP-003` | `app-003` | — |
| Un modèle qui ne se charge pas est dit à l'écran et la marche continue avec l'arbre procédural actuel | `QUA-002` | `lint-app` | — |
| Les arbres du pack sont dans le groupe de la ville : effacés par le fondu tête baissée, découpés par la zone tapis ; aucun ciel ni fond opaque, la session reste immersive-ar [humain] | `APP-001` | `app-001` | — |
| Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec les arbres du pack, avec et sans contours | `QUA-020` | `e2e` | — |
