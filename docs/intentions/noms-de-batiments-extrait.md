# Intention : les noms de bâtiments dans l'extrait

**Statut** : proposée le 2026-11-03 (limite du chantier `docs/projects/rendu-sources-donnees.md`).

## Besoin

Le tableau de bord et les plaques de rue savent nommer une voie, mais aucun bâtiment n'a de nom dans le casque : on
passe devant une mosquée, une gare ou un marché sans savoir ce que c'est. Donner un nom aux bâtiments remarquables
rendrait la promenade lisible, et sert aussi les types de bâtiments (`docs/intentions/rendu-ville.md`).

## Existant

Lu le 2026-11-03 : `app/scripts/extract-souq.ts` ne garde pas la balise `name` des bâtiments (seulement celle des voies,
`app/src/city/street-names.ts`). Le relevé Overture du 2026-11-03
(`docs/intentions/rendu-sources-donnees.md`) montre 27 à 141 bâtiments nommés par zone chez Overture, là où l'extrait du
dépôt en compte zéro : l'écart vient de l'extraction, pas de la source — OpenStreetMap porte ces noms et les donnerait
sans changer de fournisseur ni de licence.

## Questions à trancher

- [decision] Garder le nom de tous les bâtiments, ou seulement de ceux qui portent aussi un type remarquable
  (lieu de culte, gare, marché, musée) ? Le poids de l'extrait et le plafond d'étiquettes dans la scène en dépendent.
- Comment l'afficher sans masquer le réel (`APP-001`) : plaque posée sur la façade, étiquette du tableau de bord, ou rien
  tant que les mesures de rendu ne le permettent pas.
- Les quatre extraits sont à réextraire : vérifier que les tracés de boucle restent valides (test des sommets).
