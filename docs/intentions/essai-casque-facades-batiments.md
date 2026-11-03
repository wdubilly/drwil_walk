# Intention : juger les façades procédurales sur un vrai Quest 3 (lot du casque de rendu-facades-batiments)

**Statut** : proposée le 2026-11-03.

## Besoin

Marcher sur le tapis avec les façades procédurales (`APP-008`) dans un vrai Quest 3 : mesurer les images par seconde (72 visées) avec le diagnostic de rendu,
juger à hauteur d'homme la lisibilité des fenêtres, portes, volets, balcons et corniches, et vérifier que le tapis reste visible tête baissée (`APP-001`).

## Existant

Lu le 2026-11-03 : les façades sont livrées et prouvées par des tests (`APP-008`) et par l'e2e des quatre itinéraires, dont un Quest 3 émulé tête baissée
(`app/e2e/facades-batiments.test.ts`) ; aucune image par seconde n'a été mesurée au casque. Les budgets (« performance » 40 bâtiments à 160 triangles,
« équilibré » et « qualité » 120 bâtiments à 500 triangles, distance de 80 m) sont des choix techniques de l'agent (`app/src/city/facades.ts`).

## Questions à trancher

- [decision] Quelles images par seconde donne chaque profil avec les façades, et faut-il ajuster les budgets (nombre de bâtiments, triangles, distance) ?
- [decision] Les façades se voient-elles et plaisent-elles à hauteur d'homme ? Sinon, quoi changer (couleurs, densité d'ouvertures, relief) ?
- Le réel reste-t-il visible, tête baissée, avec les façades (`APP-001`) ?
