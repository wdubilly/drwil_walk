# Intention : mesurer le rendu (images par seconde, appels de rendu, triangles)

**Statut** : proposée le 2026-11-02 (lots 1 et 8 de `docs/intentions/rendu-jeu-video.md`) ; à faire en premier ; livrée le 2026-11-02 par le chantier `rendu-mesures-diagnostic` (`docs/projects/journal.md`) ; reste l'essai sur un vrai Quest 3 (`docs/intentions/essai-casque-diagnostic-rendu.md`) et l'enregistrement depuis le casque (`docs/intentions/diagnostic-casque-enregistrer.md`).

## Besoin

Savoir objectivement si le rendu tient les 72 images par seconde du Quest 3 et où il consomme, avant d'ajouter du détail.
Un diagnostic affichable sur casque, PC et tablette : images par seconde, temps d'image, appels de rendu, triangles, objets
visibles, mémoire graphique quand elle est accessible. Un protocole d'essai physique sur Quest 3 pour confirmer.

## Existant

Lu le 2026-11-02 : aucun diagnostic dans `app/src/` (aucune lecture de `renderer.info`, aucun compteur d'images). Les essais
au casque déjà notés (`docs/intentions/essai-casque-osm-enrichi.md`, `docs/intentions/essai-casque-ambiance-cartoon.md`)
jugent à l'œil, sans chiffre.

## Questions à trancher

- Tranché le 2026-11-02 : diagnostic masqué par défaut ; touche en version PC, bouton dans le panneau d'infos sur casque et tablette.
- Tranché le 2026-11-02 : mesures aussi consignées, fichier JSON téléchargeable pour comparer avant et après.
- Un budget chiffré par profil (appels de rendu, triangles) se fixe après les premières mesures, pas avant.
- [human] L'essai sur un vrai Quest 3 pour confirmer les chiffres.
