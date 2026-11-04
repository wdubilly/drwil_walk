# Intention : essayer la commande de création d'itinéraire contre les vrais services

**Statut** : proposée le 2026-11-04 (limite du chantier `creation-itineraire`).

## Besoin

La commande `npm run city` n'a été éprouvée que sur des réponses simulées : jamais contre Overpass, Panoramax, Mapillary ni
ambientCG, jamais avec un vrai jeton ni de vraies photos fournies. Il faut la lancer une fois pour de bon (par exemple pour la
première ville du chantier `villes-itineraires`), lire son rapport de provenance des couleurs et corriger ce que le réel révèle
(limite de 1 000 résultats d'une recherche Panoramax en quartier dense, vignettes Mapillary, délais d'Overpass).

## Existant

Lu le 2026-11-04 :
- les quatre itinéraires se rejouent par leurs entrées de `app/data/villes.json` ; les boucles rejouées sont valides (sommets de
  voies, longueur dans les bornes des tests) mais pas identiques aux boucles versionnées, qui n'ont pas été réécrites ;
- aucune bibliothèque de matériaux n'a été générée pour les trois autres quartiers (`app/assets/materials/` était hors du bloc
  scope) ; le souk garde la sienne, aux couleurs provisoires ;
- la couverture photo mesurée au lot 1 n'a pas été relevée en ligne (pas d'accès réseau pendant le chantier).

## Questions à trancher

- [decision] Génère-t-on les bibliothèques des trois autres quartiers (sans les activer à l'accueil) pour juger leurs couleurs au casque ?
- [decision] Les boucles versionnées des quatre itinéraires sont-elles remplacées par celles que la commande rejoue, ou gardées telles quelles ?
