# Intention : la tablette et le tactile

**Statut** : proposée le 2026-11-02 (décision du demandeur : la tablette est dans le périmètre dès les premiers lots) ; prolonge `docs/intentions/version-pc-suites.md`.

## Besoin

Pouvoir ouvrir l'application sur une tablette, dans un navigateur : même marche que la version PC, mais commandée au toucher
(vitesse, pause, recalage, regard), avec une interface adaptée à la taille de l'écran. La tablette ne remplace pas le casque.

## Existant

Lu le 2026-11-02 : la version PC marche dans un canvas, au clavier et à la souris (`app/src/pc/`), sans tactile ni
minicarte ; l'accueil n'a aucun traitement propre aux petits écrans (`app/src/ui/home.css`). Le sélecteur de carte du
trajet libre (`app/src/ui/map-picker.ts`) est déjà tactile. Jamais essayé sur une vraie tablette.

## Questions à trancher

- [decision] Quels gestes : boutons à l'écran, glisser pour regarder, pincer pour la vitesse ?
- [decision] La tablette vise un appareil précis (iPad, Android) pour l'essai ?
- La minicarte et le tableau de bord s'affichent-ils à l'écran, ou seulement dans la scène ?
- [human] L'essai sur une vraie tablette.
