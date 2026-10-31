# Intention : un rendu OpenStreetMap plus riche

**Statut** : proposée le 2026-10-31.

## Besoin

Le rendu OSM est jugé « moche, mono-couleur, formes plates » sur un vrai Quest 3. Faute de photogrammétrie ouverte à Pune
et à Doha (à ma connaissance : aucune trouvée) et du rendu Google inaccessible depuis l'EEA, le demandeur veut le rendu
**stylisé le plus riche possible**, sans dépendance commerciale.

## Existant

Lu le 2026-10-31 : bâtiments fusionnés en un seul maillage à quatre tons de palette, voies dessinées (`app/src/city/`).
L'extraction ne conserve que `kind` et `heightM` (`app/scripts/extract-souq.ts`) : couleurs, matériaux et arbres sont perdus.
`building:levels` sert déjà à calculer la hauteur ; les bâtiments sans hauteur ni niveaux prennent 7 m par défaut.

## Décisions du demandeur (2026-10-31)

Éléments voulus : matériaux et couleurs de toit, arbres et mobilier urbain, relief du sol, ombrage par sommet.

## Pistes évaluées le 2026-10-31

- **Bing Maps for Enterprise** : écartée (arrêt des comptes gratuits le 30 juin 2025, entreprise le 30 juin 2028).
- **ArcGIS Location Platform (Esri)** : candidate pour le relief et l'imagerie du sol (World Elevation, World Imagery),
  mais non vérifiée : couverture de Pune et de Doha, conditions de la formule gratuite, disponibilité pour une facturation
  de l'EEA, attribution. Elle exige un compte et une clé : un fournisseur commercial optionnel, pas le défaut.

## Questions à trancher

- [decision] Relief du sol : quelle source d'élévation (ouverte, ou ArcGIS World Elevation en option), et est-elle assez précise à hauteur de piéton pour Pune
  et Doha ? Non vérifié ; le relief n'est pas dans le chantier `osm-enrichi` tant que ce n'est pas tranché.
- [decision] Quelle part des arbres et du mobilier OSM existe réellement à Pune et à Doha ? À constater sur les extraits.
