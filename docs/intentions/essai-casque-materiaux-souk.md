# Intention : juger les matériaux locaux du souk sur un vrai Quest 3 avant de les généraliser

**Statut** : proposée le 2026-11-04 (lot 4 du chantier facades-materiaux-souk, séance groupée `docs/intentions/seance-casque-parcours.md`).

## Besoin

Marcher au souk avec le rendu « Matériaux locaux (prototype) » dans un vrai Quest 3 : juger l'enduit, la pierre et le
bois à hauteur d'homme, mesurer les images par seconde avec le diagnostic de rendu, vérifier que le réel reste visible tête
baissée (`APP-001`), puis décider de la généralisation aux trois autres quartiers (`APP-012`).

## Existant

Lu le 2026-11-04 : l'option est livrée et prouvée par des tests et par l'e2e `app/e2e/materiaux-souk.test.ts` (Quest 3
émulé, tête baissée) ; le diagnostic compte 9 textures au lieu de 3 ; aucune image par seconde mesurée au casque.
Étendre à un autre quartier = une entrée dans `app/scripts/materials-areas.ts`, sa préparation et son activation dans
`app/src/city/material-library.ts` (`LIBRARIES`), sans autre code.

## Questions à trancher

- [decision] Les matériaux rendent-ils le souk reconnaissable, ou faut-il d'autres matériaux, échelles ou teintes ?
- [decision] Quelles images par seconde, et faut-il réduire le placage (distance, nombre de bâtiments) ?
- [decision] Généraliser aux autres quartiers (Pune Vieille ville, Pune FC Road, Doha Corniche), et dans quel ordre ?
