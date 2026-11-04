# Intention : essayer les lampadaires produits par règle sur un vrai Quest 3

**Statut** : proposée le 2026-11-04.

## Besoin

Les lampadaires produits par règle (`APP-013`) sont jugés sur des tests et un Quest 3 émulé, jamais en marchant avec un vrai
casque. Il faut dire si la densité, la hauteur et la crédibilité tiennent, et si les images par seconde restent là où elles
étaient. À dérouler dans la séance groupée (`docs/intentions/seance-casque-parcours.md`), pendant les quatre marches.

## Existant

Lu le 2026-11-04. Intervalle moyen 27,5 m (voie passante), 37,5 m (rue de quartier), 17,5 m (ruelle), écart de ±20 % ; mât de
4,5 m à 0,6 m de la bordure ; plafond 300 (100 en profil performance). Sur les extraits figés, la règle atteint le plafond de 300 mâts dans les quatre quartiers (les plus proches du parcours
d'abord ; sans plafond, 845 à 1 890 mâts selon le quartier). Le
coût est calculé, pas mesuré : environ 21 600 triangles pour 300 mâts et aucun appel de rendu en plus.

## Questions à trancher

- [decision] La densité est-elle crédible en marchant, ou faut-il resserrer / espacer les intervalles par classe de voie ?
- [decision] Les mâts de 4,5 m, bras vers la chaussée, paraissent-ils à la bonne hauteur et du bon côté ?
- Les images par seconde avant et après (diagnostic de rendu, joystick droit) : le surcoût est-il invisible, comme calculé ?
- Le réglage « Lampadaires produits par règle » de l'accueil est-il facile à trouver et à manier à la manette ?
