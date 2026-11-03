# Intention : l'identité visuelle locale des quartiers, d'après des photos de rue

**Statut** : proposée le 2026-11-03 ; cadrée le 2026-11-03 en fiche `docs/projects/facades-materiaux-souk.md` (décisions
reportées dans la fiche).

## Besoin

Reproduire l'identité visuelle locale de chaque quartier dans les façades 3D : couleurs, textures, matériaux et aspect de
surface (enduits, pierre, béton, brique, bois). Il ne s'agit **pas** de reproduire chaque bâtiment photographié. Des
photographies géolocalisées (Panoramax en priorité) servent de **références locales** pour bâtir, par quartier, une
bibliothèque de matériaux qui enrichit les profils architecturaux déjà prévus (familles et palettes de `APP-008`), avec
une variation procédurale contre la répétition et des textures optimisées pour le Quest 3. Toute texture réutilisée doit
être compatible avec sa licence. Les photos ne sont ni affichées pendant la marche ni plaquées en perspective sur les
bâtiments : la géométrie procédurale et le déplacement libre restent tels quels. Premier pas : un prototype sur Souq
Waqif, sans modifier les quatre quartiers ni le moteur général avant validation du demandeur.

## Existant

Lu le 2026-11-03 : les façades sont des triangles à couleurs par sommet, **sans texture**, par décision du demandeur du
2026-11-03 (`docs/intentions/facades-textures-monuments.md`, qui pose la question « textures photographiques ou PBR ») ;
`app/src/city/facade-family.ts` ne connaît que deux régions (`provence`, `ailleurs`) et `docs/projects/facades-regions.md`
prévoit une palette par région, choisie sans référence documentée ; le rendu enrichi lit `building:colour`, `roof:colour`
et `building:material` dans les extraits figés (`APP-003`). Aucune mention de Panoramax dans le dépôt.

## Proposition

1. **Inventaire Souq Waqif** (documentation, hors casque) : photos à moins de 30 m du tracé, avec identifiant, position,
   cap, date, auteur, licence et URL ; la couverture réelle est dite, sans rien supposer.
2. **Références locales** : couleurs dominantes extraites des façades, matériaux observés (enduit, pierre, bois…), chacun
   relié aux photos qui l'appuient.
3. **Bibliothèque de matériaux du quartier** : des textures PBR tuilables (couleur, normales, rugosité) teintées et choisies
   d'après ces références. Deux sources possibles, à comparer : des matériaux CC0 (licence sans contrainte) recolorés, ou
   des échantillons découpés dans les photos (œuvre dérivée : CC-BY-SA impose la même licence et l'attribution).
4. **Prototype** : la bibliothèque appliquée aux familles de façades du souk, variation procédurale (teinte, usure,
   échelle), textures compressées pour le Quest 3, mesuré par le diagnostic de rendu ; validé par le demandeur avant
   toute généralisation.

## Ordre proposé

Avant `docs/projects/facades-regions.md` : les palettes par région en découlent. Indépendante de
`docs/projects/extraction-mobilier.md`. Répond à la question « textures » de `docs/intentions/facades-textures-monuments.md`
(dont la partie monuments reste à part).

## Questions à trancher

- [decision] Lever la décision « façades sans texture » du 2026-11-03 pour le prototype ?
- [decision] Source des textures : CC0 recolorées, échantillons tirés des photos (CC-BY-SA, attribution, partage à
  l'identique), ou les deux ?
- [decision] Seuil de couverture utile (nombre de photos, distance, date) ; source de secours si Panoramax ne couvre pas
  le souk (Mapillary : jeton requis, jamais dans le dépôt).
- [decision] Extraction des couleurs et découpe des échantillons : à la main ou par un script de préparation ?
- Forme du prototype : profil de rendu choisi à l'accueil, ou page de démonstration séparée, pour ne pas toucher au moteur
  général ? Il touche `app/` : chantier HIGH, garanties obligatoires (couverture, e2e).
- Budget Quest 3 : taille et nombre de textures, format compressé (KTX2), poids dans le dépôt.
- Les textures s'effacent-elles avec la ville tête baissée (`APP-001`) ?
