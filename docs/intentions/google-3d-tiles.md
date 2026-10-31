# Intention : Google Photorealistic 3D Tiles, plus tard

**Statut** : proposée le 2026-10-30 (reportée : décision du demandeur, pas de Google en v0.1).

**Revue le 2026-10-31 (EEA)** : Google n'offre pas les Photorealistic 3D Tiles aux projets créés après le 8 juillet 2025 liés à une facturation de l'EEA (403). Le rendu reste livré mais inaccessible depuis la France ; voir `docs/intentions/fournisseurs-ouverts.md`.

**Revue le 2026-10-31** : le premier essai sur un vrai Quest 3 juge le rendu OSM « mono-orange, formes plates ». Le demandeur
lève le report : accès réseau pendant la marche et clé Google acceptés. Cadré dans la fiche google-3d-tiles (résumée au journal)
(rendu Google en option, OSM conservé en plan B). Reste vivant : Unity + Cesium, non retenu pour l'instant (la pile reste TypeScript).

**Traité le 2026-10-31** (chantier google-3d-tiles, lots 2 et 3) : rendu Google 3D en option à l'accueil, repli OpenStreetMap avec
raison dite à l'écran, fondu de sécurité sur les tuiles, mentions de Google, e2e sur tuiles factices (journal `docs/projects/journal.md`).
Reste aux humains : la clé et la couverture (`docs/intentions/cle-google-couverture.md`) et l'essai au casque
(`docs/intentions/essai-casque-google.md`).

## Besoin

`MISSION.md` prévoyait les Google Photorealistic 3D Tiles comme ville principale. Le demandeur a choisi
OpenStreetMap seul pour la v0.1. À reconsidérer si les bâtiments extrudés déçoivent.

## Existant

Lu le 2026-10-30 : aucun code Google, aucune clé. Limites connues : clé « Map Tiles API » payante au-delà d'un
quota, rendu souvent flou à hauteur de piéton, couverture de Pune incertaine.

## Questions à trancher

- [decision] Après un essai du souk en OSM, faut-il plus de réalisme ?
- [decision] Si oui : 3D Tiles dans le navigateur, ou passage à Unity + Cesium (recommandation attendue de `MISSION.md`, § 8) ?
