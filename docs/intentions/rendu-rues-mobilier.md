# Intention : des rues, trottoirs et mobilier urbain crédibles

**Statut** : traitée en partie le 2026-11-03 par le chantier `rendu-rues-mobilier` (voir `docs/projects/journal.md`) ; reste
ouverte pour ce qui n'a pas été fait (ci-dessous).

## Reste à faire

Livrés : lampadaires, bancs, poubelles et panneaux produits par code d'après les balises (`app/src/city/furniture.ts`),
bordures de trottoir et lignes d'arrêt des passages (`app/src/city/markings.ts`), passages piétons déjà dessinés.
Non traités : caniveaux, pavés, rampes, arrêts de bus, barrières. Les données manquantes (lampadaires, poubelles,
panneaux absents des quatre extraits) sont portées par `docs/intentions/extraction-mobilier-manquant.md`, le mobilier
remarquable en glTF par `docs/intentions/mobilier-remarquable-gltf.md`.

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
  Tranché le 2026-11-03 : passages, lampadaires et bancs d'abord, puis poubelles et panneaux.
- Les données OpenStreetMap des extraits portent-elles assez de balises (passages, mobilier) ? Relevé le 2026-11-03 :
  passages et arbres oui, bancs seulement au souk et à la Corniche, **aucun lampadaire, poubelle ni panneau**.
- [decision] Mobilier en modèles glTF d'un pack sous licence compatible, ou généré par code ? Tranché le 2026-11-03 :
  mobilier courant généré par code ; le glTF reste réservé à un élément remarquable.
