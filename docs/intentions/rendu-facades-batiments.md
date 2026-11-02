# Intention : des bâtiments détaillés, plus des blocs extrudés

**Statut** : proposée le 2026-11-02 (lot 3 de `docs/intentions/rendu-jeu-video.md`) ; le lot le plus important du rendu.

## Besoin

Des façades variées à hauteur d'homme : fenêtres, portes, balcons, vitrines, enseignes, corniches, détails de toiture, selon le
type de bâtiment, le nombre d'étages, la largeur de façade, l'usage et la région. Des valeurs de repli cohérentes quand
OpenStreetMap ne dit ni la hauteur ni le type, sans jamais produire de géométrie invalide. Des modèles glTF pour quelques
monuments. Pas de répétition visible.

## Existant

Lu le 2026-11-02 : bâtiments extrudés, teintes déterministes, fenêtres et contours en option dans le rendu cartoon
(`app/src/city/buildings.ts`, `app/src/city/toon.ts`, `app/src/city/outlines.ts`), toits (`app/src/city/roofs.ts`). Les extraits figés ne portent pas la balise
`building` : le type (église, mosquée, commerce) n'est pas connu (`docs/intentions/rendu-ville.md`). Aucune texture de façade ni matériau PBR.

## Questions à trancher

- [decision] Façades procédurales (sans texture) d'abord, ou textures PBR sous licence compatible (source à choisir) ?
- [decision] Relancer les extractions Overpass pour conserver `building` et le nombre d'étages (cela change les fichiers de `app/data/`) ?
- [decision] Quels monuments en glTF, et d'où viennent-ils (licence) ?
- Le poids des données et des textures reste-t-il acceptable pour un chargement dans le navigateur du casque ?
