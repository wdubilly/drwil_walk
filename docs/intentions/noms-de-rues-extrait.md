# Intention : le nom de la rue courante dans le tableau de bord

**Statut** : proposée le 2026-11-01 (limite du chantier hud-tableau-de-bord).

## Besoin

La maquette du casque affiche le lieu courant (nom de la rue ou du lieu). Le tableau de bord montre aujourd'hui le nom de
l'itinéraire choisi, faute de nom de rue disponible.

## Existant

Actualisé le 2026-11-05 : `Road` (`app/src/city/souq-data.ts`) porte désormais `name` et l'extraction le conserve.
Le tableau indique encore l'itinéraire, pas la voie courante. Le parcours libre a été retiré ; ce besoin ne concerne
plus que les données embarquées.

## Questions à trancher

- [decision] Lire le nom de la voie la plus proche de la position dans le tableau de bord,
  « rue sans nom connue » en repli, sur les quatre itinéraires embarqués ?
