# Intention : un itinéraire libre

**Statut** : proposée le 2026-10-31.

## Besoin

Le demandeur veut marcher sur **n'importe quel trajet** de son choix (un départ, une arrivée), pas seulement sur les
quatre itinéraires figés de la v0.1. Il accepte pour cela un accès réseau pendant la marche, et une clé Google.

## Existant

Lu le 2026-10-31 : les quatre itinéraires sont des boucles calculées hors casque et versionnées dans `app/data/`
(`APP-002`) ; la ville vient d'un extrait OpenStreetMap figé par itinéraire (`APP-003`, « aucun appel réseau dans le
casque »). Rien ne permet de choisir un point, de calculer un chemin ni de charger une ville autour d'un point
quelconque. `MISSION.md` prévoyait des itinéraires configurables (un fichier de routes), pas un choix libre.

## Décisions du demandeur (2026-10-31)

- Routage : API Google Routes, mode piéton, avec **sa propre clé** (`VITE_GOOGLE_ROUTES_API_KEY`), distincte de la clé
  Map Tiles : les deux API s'activent et se restreignent séparément.
- À l'arrivée d'un trajet libre : la marche s'arrête et le dit, sans boucle ni retour.
- Départ et arrivée : deux touches sur une carte à l'accueil.
- Longueur maximale : 5 km.

- Recherche d'adresse en plus de la carte touchée (2026-10-31) : tranchée, faite dans le chantier (API Google Geocoding, même clé que Routes).

## Questions à trancher

*(aucune : la recherche d'adresse est tranchée ; l'essai réel est dans `docs/intentions/essai-casque-itineraire-libre.md`)*
