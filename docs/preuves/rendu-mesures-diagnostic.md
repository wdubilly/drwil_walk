# Preuve de clôture — rendu-mesures-diagnostic

**Clos le** : 2026-11-02
**Commit vérifié** : `d20d51d89e` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le diagnostic mesure les images par seconde (moyenne glissante), le temps d'image (moyen et pire sur la fenêtre), les appels de rendu et les triangles du dernier rendu (renderer.info), les objets visibles, et la mémoire graphique (géométries, textures) quand elle est lisible ; une valeur illisible est dite « indisponible », jamais inventée | `QUA-002` | `lint-app` | — |
| Le diagnostic est **masqué par défaut** : la marche démarre sans lui, et le mesurer ne change ni la vitesse réglée ni la distance parcourue | `APP-002` | `app-002` | — |
| En version PC, une touche l'affiche et le masque (une pression, une action) ; sur casque et tablette, un bouton du panneau d'infos fait de même | `APP-002` | `app-002` | — |
| Affiché, il suit le fondu tête baissée, reste hors de la zone tapis et ne masque aucune information de sécurité sur casque [humain] | `APP-001` | `app-001` | — |
| Un bouton « Enregistrer les mesures » télécharge un fichier JSON (cible, ville, version, date, valeurs mesurées et leur fenêtre) pour comparer avant et après ; rien n'est envoyé, aucun appel réseau, aucune donnée personnelle | `SEC-007` | `secrets` | — |
| Un téléchargement impossible est dit à l'écran, la marche continue | `QUA-002` | `lint-app` | — |
| Le diagnostic se rejoue de bout en bout : affiché, ses valeurs sont lues sur la page en version PC et dans le Quest 3 émulé, masquées par défaut, et le fichier consigné est lu et validé | `QUA-020` | `e2e` | — |
