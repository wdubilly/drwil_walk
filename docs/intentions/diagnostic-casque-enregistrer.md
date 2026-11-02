# Intention : enregistrer les mesures de rendu depuis le casque

**Statut** : proposée le 2026-11-02 (limite constatée au chantier `rendu-mesures-diagnostic`) ; non cadrée.

## Besoin

Sur casque, le diagnostic de rendu s'affiche et se masque par le clic du joystick droit et se lit dans le tableau flottant,
mais le fichier JSON des mesures ne se télécharge que depuis la page : le casque en session `immersive-ar` n'affiche pas la
page (aucun DOM overlay), son bouton « Enregistrer les mesures » n'y est donc pas atteignable. Le demandeur veut pouvoir
consigner les chiffres du Quest 3 sans quitter la marche.

## Existant

Lu le 2026-11-02 : `app/src/xr/diagnostics-report.ts` écrit le fichier par un bouton de la page ; la manette droite n'a plus
de bouton libre (gâchette, prise, A, B, clic du joystick sont pris, `app/src/xr/buttons.ts`) ; la manette gauche règle la
zone tapis (`app/src/xr/left-controller.ts`).

## Questions à trancher

- [decision] Quel geste de manette enregistre les mesures sur casque (un bouton de la manette gauche, un appui long) ?
- [decision] Ou bien enregistrer à la sortie de la session, quand la page redevient visible ?
- [human] Le fichier téléchargé dans le navigateur du Quest 3 : où le retrouver et comment le récupérer sur le PC ?
