# Intention : juger le mobilier urbain et les marquages sur un vrai Quest 3 (lot 4 de rendu-rues-mobilier)

**Statut** : proposée le 2026-11-03.

## Besoin

Juger, à hauteur d'homme sur un vrai Quest 3, la crédibilité du mobilier produit par code (bancs du souk et de la Corniche, et,
après une nouvelle extraction, lampadaires, poubelles et panneaux) et des marquages au sol (bordures, passages piétons, lignes
d'arrêt) : échelle, raccords au sol, orientation dans l'axe de la rue, rien de flottant, et la cadence tenue.

## Existant

Lu le 2026-11-03 : le mobilier et les marquages sont livrés, prouvés par des tests (`APP-009`) et rejoués sur les quatre
itinéraires dans un Quest 3 émulé (`app/e2e/mobilier-urbain.test.ts`). Les dimensions (mât de 4,5 m, assise à 45 cm, corbeille
de 90 cm, panneau à 2,2 m), les teintes et les largeurs de bordure sont des choix de l'agent, jamais vus au casque.

## Questions à trancher

- [decision] Le mobilier est-il crédible à hauteur d'homme (taille, teinte, position, orientation) ?
- [decision] Les marquages au sol se lisent-ils sans gêner la marche, et faut-il les garder en profil « performance » ?
- La cadence tient-elle avec le mobilier et les marquages, tous profils confondus (`APP-006`) ?
