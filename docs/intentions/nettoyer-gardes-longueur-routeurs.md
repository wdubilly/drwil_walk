# Intention : retirer les gardes de longueur devenues sans effet des routeurs

**Statut** : couverte le 2026-11-05 par le retrait des fournisseurs du parcours libre.

## Besoin

Supprimer entièrement la notion de limite de longueur d'un trajet libre dans le code, pas seulement son refus.

## Existant

Le retrait des fournisseurs a supprimé les gardes `assertCrowFlies` et `assertRouteLength` et leurs appels.
Il n'y a plus de code de routage libre à nettoyer.

## Questions à trancher

Aucune : le retrait demandé les couvre.
