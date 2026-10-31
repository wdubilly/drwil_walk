# Intention : essayer un trajet libre au casque, avec une vraie clé Routes

**Statut** : proposée le 2026-10-31 (reste du chantier itineraire-libre, lot 4, réservé à l'humain).
**Relue le 2026-10-31** : le chemin à pied et les adresses ne passent plus par Google par défaut mais par Valhalla et Photon, sans clé (chantier fournisseurs-ouverts) ; la question de la clé Routes ne vaut plus que pour l'option Google, et l'essai sur les instances publiques est l'intention `essai-fournisseurs-ouverts.md`. Reste vivant : la maniabilité de la carte, le premier résultat d'une adresse, la cadence, le message d'arrivée.

## Besoin

Marcher sur le tapis avec le Quest 3 sur un trajet libre de son choix, avec de vraies clés, et juger ce qu'aucun test
ne voit : la carte de l'accueil utilisable à la manette, la recherche d'adresse, le chemin à pied réellement calculé, la
ville autour du trajet, l'arrêt à l'arrivée et le fondu de sécurité (`APP-001`).

## Existant

Lu le 2026-10-31 : tout le parcours (carte ou adresse, calcul du chemin à pied (Google Routes à l'époque, Valhalla depuis), bâtiments OpenStreetMap
proches du tracé par Overpass, marche jusqu'à l'arrivée) est prouvé par tests unitaires et par l'e2e dans un Quest 3 émulé, avec des
services **factices** : aucun appel réel à Google, à Overpass ni à OpenStreetMap n'a jamais eu lieu, faute de clé. La clé Routes
(`VITE_GOOGLE_ROUTES_API_KEY`) sert aussi à l'API Geocoding : les deux API doivent être activées et autorisées dans sa restriction
(`INSTALL.md`). La bande de bâtiments (150 m de chaque côté, jusqu'à 5 km) peut compter des milliers de bâtiments fusionnés : la cadence
n'est pas mesurée.

## Questions à trancher

- [decision] Pour l'option Google seulement : quelle clé Routes, la créer, la restreindre (référents HTTP, API Routes et Geocoding seules), fixer un quota ; garder une seule clé pour les deux API ou en séparer une troisième ?
- [decision] Les 72 images par seconde tiennent-elles sur un trajet de 5 km en bâtiments OpenStreetMap ? Sinon, réduire la bande (150 m) ou la longueur maximale (5 km) ?
- [decision] La carte de l'accueil (zoom et déplacement par boutons, sans glisser) est-elle assez maniable à la manette, ou faut-il glisser, ou une bibliothèque de carte ?
- [decision] Le premier résultat d'une adresse est-il le bon dans les rues de Pune et de Doha, ou faut-il proposer une liste ?
- [decision] Le message d'arrivée est-il lisible dans le casque, et le fondu efface-t-il bien tout tête baissée (rendu OpenStreetMap et rendu Google 3D) ?
