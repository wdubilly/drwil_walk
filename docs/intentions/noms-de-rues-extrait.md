# Intention : le nom de la rue courante dans le tableau de bord

**Statut** : proposée le 2026-11-01 (limite du chantier hud-tableau-de-bord).

## Besoin

La maquette du casque affiche le lieu courant (nom de la rue ou du lieu). Le tableau de bord montre aujourd'hui le nom de
l'itinéraire choisi, faute de nom de rue disponible.

## Existant

Lu le 2026-11-01 : les extraits OpenStreetMap figés (`app/data/*.json`) ne portent pas la balise `name` des voies (propriétés
`kind` et `highway` seulement) ; `Road` (`app/src/city/souq-data.ts`) n'a pas de nom ; les trajets libres chargent leurs voies par
Overpass sans nom non plus (`app/src/city/free-route.ts`). Ce chantier ne pouvait modifier ni les scripts d'extraction, ni les
extraits, ni la couche `app/src/city/` (hors de sa portée).

## Questions à trancher

- [decision] Ajouter `name` aux extraits (relancer les cinq extractions, réseau) puis lire le nom de la voie la plus proche de la
  position dans le tableau de bord, « rue sans nom connue » en repli ? Et pour un trajet libre ?
