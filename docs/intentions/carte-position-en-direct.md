# Intention : voir la carte et sa position bouger pendant la marche

**Statut** : proposée le 2026-11-01, à partir d'un retour du demandeur ; cadrée le 2026-11-01 par `docs/projects/carte-position-casque.md` (minicarte dans le casque, tracé seul, sans réseau).

## Besoin

« Voir la carte et sa position bouger sur la carte » : pendant une marche, par exemple une course Vidauban → Sainte-Maxime,
le demandeur veut voir son parcours évoluer sur une carte, avec un point qui avance.

## Existant

Lu le 2026-11-01 (`docs/features.md`, `app/src/ui/`, `docs/intentions/hud-casque.md`, `docs/projects/hud-defis-progression.md`) :

- La carte légère (tuiles OpenStreetMap) n'existe qu'à l'accueil, pour poser le départ et l'arrivée d'un trajet libre
  (`app/src/ui/map-picker.ts`) ; aucune position en direct n'y est dessinée.
- Le panneau de marche de la page affiche vitesse, distance et temps ; la page n'est pas visible en réalité mixte, donc rien
  de cela n'est vu dans le casque. Le tableau de bord du casque (`app/src/xr/hud-panel.ts`) n'a ni carte ni tracé.
- Le mini-globe avec tracé de la maquette a été écarté pour les défis (distance seule, `hud-defis-progression`) ; sa place
  pour la carte de l'itinéraire est restée une question ouverte dans `docs/intentions/hud-casque.md`.
- Les quatre itinéraires figés n'appellent pas le réseau pendant la marche (`APP-003`) : un fond de tuiles en direct ne serait
  pas permis sans changer ce contrat.

## Questions à trancher

- [decision] Où voir la carte : dans le casque (une minicarte flottante, à côté du panneau d'infos), sur la page d'un écran
  voisin, ou les deux ?
- [decision] Quel fond : un fond de tuiles OpenStreetMap (réseau pendant la marche, mention d'attribution à porter) ou le seul
  tracé du parcours avec un point, tiré du fichier de l'itinéraire, sans réseau ?
- [decision] La carte montre-t-elle le parcours entier avec le point qui avance, la portion à venir, ou les deux ?
- Une minicarte dans le casque touche la place du panneau d'infos et `APP-001` (jamais dans la zone tapis, effacée tête
  baissée) : à cadrer avec `docs/projects/panneau-discret.md`.
