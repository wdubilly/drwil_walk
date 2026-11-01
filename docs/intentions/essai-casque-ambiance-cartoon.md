# Intention : juger l'ambiance cartoon sur un vrai Quest 3 (lot 7 d'ambiance-cartoon)

**Statut** : proposée le 2026-11-01.

## Besoin

Juger sur un vrai Quest 3 le style (lisibilité des paliers, des voies bordées, des fenêtres et des arbres du pack), la cadence (72 images par
seconde ou plus), le tapis resté visible (`APP-001`), puis décider du défaut des « Contours des bâtiments ».

## Existant

Lu le 2026-11-01 : matériau toon, voies bordées, fenêtres et contours en option sont livrés ; seul un casque émulé les a joués
(`app/e2e/ambiance-cartoon.test.ts`). Limites connues : les contours sont des traits fins (un pixel de large), le soleil est
fixe pour l'utilisateur. Les arbres du pack Quaternius sont posés le 2026-11-01 (fiche arbres-pack-quaternius, `docs/projects/journal.md`) (quatre variantes de 413 à 454 triangles, 300 arbres au plus, soit 150 000 triangles au plus, feuillage en cartes découpées par la transparence) : ni leur look ni leur coût de rendu n'ont été vus sur un vrai Quest 3 (l'e2e rejoue la marche avec les arbres, sans rien juger du rendu).

**Reviewed on 2026-11-01** : les arbres du pack, qui manquaient, sont livrés ; le reste est vivant.

## Questions à trancher

- [decision] Les contours restent-ils décochés par défaut, ou le deviennent-ils si la cadence tient ?
- [decision] Les arbres du pack (tronc en couleur unie, feuillage en cartes éclaircies et agrandies) conviennent-ils, et la cadence tient-elle avec 300 arbres ? Sinon : moins d'arbres, moins de cartes de feuilles ou un arbre plus simple.
- [decision] Le style convient-il, ou faut-il changer le nombre de paliers, la palette ou la taille des fenêtres ?
