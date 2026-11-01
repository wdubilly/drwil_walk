# Intention : juger l'ambiance cartoon sur un vrai Quest 3 (lot 7 d'ambiance-cartoon)

**Statut** : proposée le 2026-11-01.

## Besoin

Juger sur un vrai Quest 3 le style (lisibilité des paliers, des voies bordées et des fenêtres), la cadence (72 images par
seconde ou plus), le tapis resté visible (`APP-001`), puis décider du défaut des « Contours des bâtiments ».

## Existant

Lu le 2026-11-01 : matériau toon, voies bordées, fenêtres et contours en option sont livrés ; seul un casque émulé les a joués
(`app/e2e/ambiance-cartoon.test.ts`). Limites connues : les contours sont des traits fins (un pixel de large), le soleil est
fixe pour l'utilisateur, les arbres du pack manquent encore.

## Questions à trancher

- [decision] Les contours restent-ils décochés par défaut, ou le deviennent-ils si la cadence tient ?
- [decision] Le style convient-il, ou faut-il changer le nombre de paliers, la palette ou la taille des fenêtres ?
