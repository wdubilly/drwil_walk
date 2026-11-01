# Intention : une interface pour PC, sans le casque

**Statut** : proposée le 2026-11-01, à partir d'un retour du demandeur ; cadrée le 2026-11-01 par `docs/projects/version-pc.md` (une version PC de l'appli, clavier et souris).

## Besoin

Une interface qui marche aussi sur un PC, sans casque. Le retour ne dit pas à quoi elle servirait : voir la ville et le
parcours à l'écran, ou accompagner une marche sur le tapis avec un écran, ou préparer un trajet sans être équipé.

## Existant

Lu le 2026-11-01 (`docs/features.md`, `app/src/xr/session.ts`, `MISSION.md`) :

- L'application est une page web servie par Vite ; l'accueil (itinéraires, trajet libre, vitesse, opacité) s'ouvre dans un
  navigateur de bureau.
- Marcher exige une session WebXR `immersive-ar` : sur un navigateur sans WebXR, l'échec s'affiche sur la page ; il n'existe
  aucun rendu 3D hors casque.
- Les parcours sont prouvés en e2e dans un Quest 3 émulé (IWER) ; `MISSION.md` cite l'émulateur du navigateur pour les essais
  sans casque.
- Le contrat de sécurité `APP-001` est écrit pour la réalité mixte (le réel reste visible) : hors casque, il n'y a ni
  passthrough ni tapis à protéger.

## Questions à trancher

- [decision] À quoi sert le mode PC : un aperçu 3D de l'itinéraire à l'écran, une marche pilotée au clavier ou à la souris
  (avec un tapis réel et un écran), ou seulement un tableau de bord et une carte sans 3D ?
- [decision] Les commandes (pause, vitesse, recalage) : clavier, souris, ou manette de jeu ?
- [decision] Comment `APP-001` et `APP-002` s'appliquent-ils hors réalité mixte (la sécurité-visibilité n'a plus d'objet) ?
- Le changement de pile (rendu three.js dans un canvas ordinaire) est une décision du demandeur, à ne prendre qu'en
  connaissance du coût.
