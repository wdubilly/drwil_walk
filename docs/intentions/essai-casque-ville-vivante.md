# Intention : essayer la ville vivante du souk sur un vrai Quest 3

**Statut** : proposée le 2026-11-05, à la clôture du chantier `docs/projects/ville-vivante-souk.md` (lot 4, humain).

## Besoin

La ville vivante du souk (`APP-014`) n'a été jugée que sur des tests et un Quest 3 émulé, jamais en marchant avec un vrai
casque. Cela vaut pour les lanternes allumées la nuit, les véhicules et les piétons. Il faut dire si elle reste supportable
en vision périphérique sur le tapis, sans détourner l'attention du réel (`APP-001`). À dérouler dans la séance groupée
(`docs/intentions/seance-casque-parcours.md`), à la marche du souk.

## Existant

Lu le 2026-11-05.

- **Lanternes** : allumées avant 6 h et après 18 h, à l'heure de l'appareil, avec un halo au sol et sans source de lumière.
  La case « Lampadaires allumés la nuit » est cochée par défaut.
- **Figurants** : la case « Circulation et piétons » est décochée par défaut. Plafonds véhicules / piétons : 8 / 16 en
  performance, 20 / 40 en équilibré, 30 / 60 en qualité.
- **Vitesses du catalogue au golfe** : 15 à 20 km/h pour les véhicules, 3,5 km/h pour les flâneurs.
- **Distance** : chaque figurant est retiré de l'image à moins de 10 m de l'utilisateur, avec un fondu sur 4 m.
- **Modèles** : les piétons sont figés et glissent. Les personnages Kenney sont trapus et mis à 1,70 m de haut.
- **Orientation** : sur la capture e2e (`souk-circulation.png`), les figurants sont trop loin et trop petits pour juger
  l'avant des voitures et de la moto, supposé +Z.
- **Coût mesuré** : de 15 à 27 appels de rendu et de 90 865 à 203 618 triangles sur la scène du souk entière, en
  qualité. Les images par seconde n'ont jamais été mesurées au casque.

## Questions à trancher

- [decision] La densité (plafonds par profil, densités `golfe`) est-elle supportable en vision périphérique, ou faut-il la
  baisser ?
- [decision] Les vitesses et la distance de retrait (10 m) paraissent-elles calmes et prévisibles ?
- [decision] Voitures, moto et piétons roulent-ils et marchent-ils dans le bon sens, à une taille crédible ?
- [decision] Des piétons qui glissent sans marche animée sont-ils acceptables (voir `docs/intentions/pietons-animes.md`) ?
- Les images par seconde avec et sans circulation (diagnostic de rendu, joystick droit) : le surcoût est-il invisible ?
- Le souk de nuit, lanternes allumées : la lueur gêne-t-elle la vision du tapis ?
