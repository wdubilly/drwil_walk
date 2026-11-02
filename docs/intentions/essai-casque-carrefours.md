# Intention : juger le choix de la rue aux carrefours sur un vrai Quest 3

**Statut** : proposée le 2026-11-02 (reste du chantier carrefours-choix, lot 5, réservé à l'humain).

## Besoin

Juger au casque, en marchant sur le tapis, ce que l'e2e émulé ne voit pas : le pointage de la rue avec la manette droite
est-il assez précis et confortable, la prise droite se presse-t-elle sans gêne, les flèches au sol sont-elles lisibles
sans cacher le tapis, et le choix reste-t-il sûr (aucun virage brusque, rien de choisi tête baissée) ?

## Existant

Lu le 2026-11-02 : les rues sont proposées à 40 m d'un carrefour (`APPROACH_M` dans `app/src/route/network.ts`), par des flèches
à plat de 5 m posées à 8 m du carrefour (`app/src/xr/choice-markers.ts`) ; le rayon de la manette droite pointe une rue à 10°
près (`POINT_TOLERANCE_DEG`, `app/src/xr/choice-ray.ts`), la prise droite (index 1) la choisit. Cap lissé sur 4 m. Tous ces
réglages sont des choix techniques de l'agent, jamais vus au casque.

## Questions à trancher

- [decision] La tolérance de 10° et la distance d'approche de 40 m conviennent-elles en marchant à 4 à 8 km/h ?
- [decision] La prise droite est-elle le bon bouton pour confirmer (ou la gâchette, mais elle est la pause) ?
- [decision] Les flèches sont-elles lisibles (taille, couleurs jaune / blanc / vert) et le tapis reste-t-il visible ?
- [decision] Le choix doit-il se faire aussi sans pointer (par exemple joystick gauche ou droit) ?
- [decision] L'essai se joint-il à `essai-casque-commandes-panneau.md` ?
