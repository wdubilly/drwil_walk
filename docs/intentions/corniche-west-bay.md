# Intention : la Corniche de Doha jusqu'à West Bay

**Statut** : proposée le 2026-10-31.

## Besoin

Le chantier doha-corniche marche sur un aller-retour d'environ 4 km (2 km à l'aller) qui part près du Musée d'art
islamique et longe le front de mer : il n'atteint pas West Bay, et ne part pas du musée lui-même. Le demandeur voudra
peut-être un parcours qui relie vraiment le musée aux tours de West Bay.

## Existant

Lu le 2026-10-31 (chantier doha-corniche) : dans l'extrait `app/data/doha-corniche.json`, le réseau de voies du musée
n'est pas relié à celui de la Corniche (174 m d'écart) ; le départ de `app/data/doha-corniche-boucle.json` est donc le
point relié le plus proche. West Bay est à environ 3,5 km du départ : hors du tronçon de 2 km cadré.

## Questions à trancher

- [decision] Allonger l'aller (environ 5 à 6 km, jusqu'aux tours) ou garder le tronçon de 2 km ?
- [decision] Relier à la main le réseau du musée à celui de la Corniche (ajout d'un segment sans voie OSM) ou accepter le départ décalé ?
