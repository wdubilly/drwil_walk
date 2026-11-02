# Intention : essayer le diagnostic de rendu sur un vrai Quest 3

**Statut** : proposée le 2026-11-02 (lot 4 du chantier `rendu-mesures-diagnostic`, humain) ; non cadrée.

## Besoin

Confirmer sur un vrai Quest 3 que les 72 images par seconde tiennent et lire les premiers chiffres de rendu de chaque ville.
Les mesures d'un Chromium sans GPU (e2e) ne valent pas celles du casque et ne s'annoncent jamais comme telles (`QUA-013`).

## Existant

Lu le 2026-11-02 : le diagnostic existe (`app/src/xr/diagnostics.ts`, `app/src/xr/diagnostics-report.ts`), s'affiche dans le
tableau flottant du casque par le clic du joystick droit, et ne s'est jamais exécuté sur un vrai casque : seuls les tests et
l'e2e dans le Quest 3 émulé (IWER) l'ont rejoué.

## Questions à trancher

- [human] Marcher quelques minutes sur chacune des quatre villes, diagnostic affiché : les 72 images par seconde tiennent-elles ?
- [human] Le clic du joystick droit se presse-t-il sans gêner le réglage de la vitesse ? Le texte du diagnostic est-il lisible et hors de la zone tapis ?
- [human] Noter les chiffres (images par seconde, appels de rendu, triangles) par ville : ils fixent ensuite le budget par profil (`docs/intentions/rendu-profils-graphiques.md`).
