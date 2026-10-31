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

## Questions à trancher

- [decision] Service de routage : API Google Routes (même clé que les 3D Tiles) ou OSRM / Valhalla sans clé ?
- [decision] Aller simple (arrêt ou retour à l'arrivée) ou aller-retour automatique ?
- [decision] Choix des points : carte touchée à l'accueil, recherche d'adresse, ou coordonnées saisies ?
- [decision] Longueur maximale d'un trajet libre, pour borner les chargements et la durée de marche ?
