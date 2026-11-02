# Intention : des rues, trottoirs et mobilier urbain crédibles

**Statut** : proposée le 2026-11-02 (lot 4 de `docs/intentions/rendu-jeu-video.md`).

## Besoin

Des chaussées et trottoirs lisibles à hauteur d'homme : marquages, passages piétons, bordures, caniveaux, pavés, rampes, et
du mobilier posé là où les données le disent (lampadaires, bancs, panneaux, poubelles, arrêts de bus, barrières). Raccords
propres, échelle crédible, rien de flottant ni de posé au hasard.

## Existant

Lu le 2026-11-02 : voies bordées dessinées sur le sol (`app/src/city/roads.ts`), cheminements (`app/src/city/walkways.ts`), mobilier et
arbres (`app/src/city/props.ts`, `app/src/city/vegetation.ts`, pack d'arbres Quaternius), noms de rues (`app/src/city/street-names.ts`, limités aux extraits qui
en portent). Pas de marquage au sol, de passage piéton ni de bordure en relief.

## Questions à trancher

- [decision] Quels éléments, parmi ceux listés, pèsent le plus pour le demandeur (passages piétons, lampadaires, bancs) ?
- Les données OpenStreetMap des extraits portent-elles assez de balises (passages, mobilier) ? À vérifier avant de cadrer.
- [decision] Mobilier en modèles glTF d'un pack sous licence compatible, ou généré par code ?
