# Intention : sourcer le champ de vision du Quest 3

**Statut** : proposée le 2026-11-01 (limite du chantier champ-de-vision-casque).

## Besoin

Que les valeurs du champ de vision cible (110° en horizontal, 96° en vertical) et la marge (80 % des demi-angles) reposent sur une
source relue, avant de régler la place du panneau d'infos dessus.

## Existant

Lu le 2026-11-01 : `app/src/xr/fov.ts` porte ces valeurs comme hypothèse de cadrage (annoncées par Meta, de mémoire). Aucune page
n'a pu être relue : le site de Meta refuse la lecture automatisée, et ni Wikipédia ni UploadVR ne donnent les degrés dans leur texte.
Le masque d'IWER donne le même champ à chaque œil, sans recouvrement binoculaire ni asymétrie.

## Questions à trancher

- [decision] Quelle source fait foi (page de Meta, mesure au casque par l'essai du panneau) ?
- [decision] La marge de 80 % est-elle la bonne, ou faut-il la régler à l'essai du chantier panneau-heure-hors-vue ?
