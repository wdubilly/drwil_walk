# Intention : ne pas exposer les clés Google restantes dans le navigateur

**Statut** : proposée le 2026-10-31 (question ouverte du chantier fournisseurs-ouverts).

## Besoin

Les clés `VITE_` sont insérées en clair dans le code envoyé au navigateur. Le rendu Google 3D (hors EEA) et l'option Google du trajet
libre en dépendent encore ; le demandeur veut savoir s'il faut les cacher.

## Existant

Lu le 2026-10-31 : `VITE_GOOGLE_MAPS_API_KEY` (tuiles) et `VITE_GOOGLE_ROUTES_API_KEY` (option Routes et Geocoding) sont lues de
`.env.local` (dans `app/`) par le point d'entrée de l'application ; `INSTALL.md` conseille de les restreindre aux référents HTTP. Les services ouverts par défaut
n'ont aucune clé.

## Questions à trancher

- [decision] Un relais sur le serveur de développement pour les clés Google (elles ne quittent plus la machine), ou accepter l'exposition avec un plafond de budget ?
