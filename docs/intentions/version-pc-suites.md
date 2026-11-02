# Intention : suites de la version PC

**Statut** : proposée le 2026-11-02, à la clôture du chantier version-pc (limites non traitées).

## Besoin

Rendre la version PC plus complète et plus confortable, sans toucher à la sécurité du casque.

## Existant

Lu le 2026-11-02 (`app/src/pc/`, `docs/features.md`) :

- La version PC marche dans un canvas de la page, clavier et souris (Espace, flèches, R, H, Échap ; glisser pour regarder),
  en OpenStreetMap seulement, sans minicarte, sans manette de jeu, sans tactile.
- Le regard se tourne en glissant la souris, bouton enfoncé : pas de verrouillage du pointeur.
- Le choix « Google 3D » est dit indisponible en version PC et ignoré.
- Les touches et la sensibilité de la souris sont des choix techniques de l'agent, jamais essayés par une personne.
- L'e2e tourne sur Chromium seulement ; Firefox et Safari ne sont pas essayés.

## Questions à trancher

- [decision] Quelles touches et quelle sensibilité de souris conviennent à celui qui s'en sert (essai du demandeur) ?
- [decision] Faut-il le rendu Google 3D, la minicarte, la manette de jeu ou le tactile en version PC ?
- Le regard par verrouillage du pointeur (sans bouton) vaut-il sa complexité (sortie par Échap) ?
- Essayer la version PC sur Firefox et sur Safari.
