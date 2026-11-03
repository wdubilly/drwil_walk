# Intention : essayer la marche tactile sur une vraie tablette (lot 4 de rendu-tablette-tactile)

**Statut** : proposée le 2026-11-03.

## Besoin

Marcher sur le tapis avec la version PC ouverte sur une vraie tablette, au toucher (`APP-007`) : juger la taille des boutons, le glisser pour regarder,
la lisibilité de l'accueil et du tableau de bord à l'écran, et les images par seconde du profil proposé.

## Existant

Lu le 2026-11-03 : boutons, glisser et interface petit écran sont livrés et rejoués dans Chromium en émulation tactile (`app/e2e/tablette-tactile.test.ts`) ;
jamais essayés sur un appareil réel ni sur Safari (iPad) ou Chrome Android. Aucun appareil précis n'est visé (décision du demandeur, 2026-11-03).

## Questions à trancher

- [human] Quelle tablette et quel navigateur pour l'essai ? Les boutons et le glisser sont-ils confortables en marchant ?
- [decision] Faut-il alors un geste de plus (pincer pour la vitesse, gyroscope : refusés pour l'instant) ou une minicarte à l'écran (`docs/intentions/carte-position-en-direct.md`) ?
