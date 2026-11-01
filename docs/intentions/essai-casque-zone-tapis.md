# Intention : juger la zone tapis et la vignette réelle sur un vrai Quest 3

**Statut** : proposée le 2026-11-01 (reste du chantier zone-tapis-vignette, lot 6, réservé à l'humain).

## Besoin

Juger au casque ce que l'e2e émulé ne voit pas : la découpe de la zone tapis (rendu GPU) laisse-t-elle bien voir le tapis,
la rampe et la console, et la vignette réelle est-elle discrète ? La zone se pose-t-elle et se règle-t-elle bien avec les
manettes Touch ?

## Existant

Lu le 2026-11-01 : la ville est découpée par six plans de coupe (`clipIntersection`, `app/src/city/zone-clip.ts`), boîte par
défaut de 1,2 m sur 2,4 m et 1,2 m de haut autour de la position de départ (`app/src/safety/zone.ts`). Manette gauche :
X pose la boîte sous la tête dans le sens du regard, joystick = déplacer, prise tenue + joystick = redimensionner, Y = boîte
par défaut (`app/src/safety/zone-edit.ts`, `app/src/xr/left-controller.ts`) ; vitesses 0,6 m/s (déplacement) et 0,5 m/s
(taille), zone morte 0,2, enregistrement quand le joystick revient au centre. Vignette : fondu entre 60 % et 125 % du
rayon de l'image de chaque œil (`app/src/xr/vignette.ts`), quadrilatère plein écran à fondu multiplicatif. Tout cela est un
choix de l'agent, jamais vu au casque. Le test ne voit pas les pixels : seul l'essai prouve que la découpe et la vignette
rendent bien.

## Questions à trancher

- [decision] Le tapis, la rampe et la console restent-ils visibles avec la boîte par défaut ? Ses dimensions conviennent-elles ?
- [decision] La boîte posée « sous soi » (X) convient-elle, ou faut-il la poser devant ? Les vitesses de réglage et les boutons conviennent-ils ?
- [decision] La vignette est-elle discrète (rayons 60 % et 125 %) et n'abîme-t-elle pas le panneau d'infos ? Le fondu multiplicatif est-il correct sur le compositeur du Quest ?
- [decision] Faut-il pouvoir tourner la boîte ou régler sa hauteur au casque (aujourd'hui son cap est celui du regard à la pose, sa hauteur fixe) ?
- [decision] Faut-il montrer le contour de la zone pendant le réglage (aujourd'hui, seul le trou dans la ville la montre) ?
