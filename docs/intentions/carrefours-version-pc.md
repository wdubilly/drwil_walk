# Intention : le choix de la rue aux carrefours dans la version PC

**Statut** : proposée le 2026-11-02 (limite du chantier carrefours-choix, la version PC était hors de son périmètre).

## Besoin

La version PC (`poste-sans-casque`) suit toujours le tracé d'origine : on n'y choisit pas sa rue aux carrefours.

## Existant

Lu le 2026-11-02 : le choix de la rue n'existe que dans le casque (`app/src/xr/junctions.ts`, rayon et prise de la manette
droite). `app/src/pc/` ne l'utilise pas ; le guide (`app/src/xr/guide.ts`) et le réseau (`app/src/route/network.ts`) sont purs
et réutilisables.

## Questions à trancher

- [decision] Quelle commande au clavier ou à la souris (flèches gauche / droite, clic sur la flèche) ?
- [decision] Les flèches au sol sont-elles dessinées dans la version PC comme dans le casque ?
