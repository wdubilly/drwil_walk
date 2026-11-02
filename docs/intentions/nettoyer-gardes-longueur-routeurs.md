# Intention : retirer les gardes de longueur devenues sans effet des routeurs

**Statut** : proposée le 2026-11-02 (limite du chantier limites-vitesse-distance).

## Besoin

Supprimer entièrement la notion de limite de longueur d'un trajet libre dans le code, pas seulement son refus.

## Existant

Lu le 2026-11-02 : `assertCrowFlies` et `assertRouteLength` (`app/src/route/providers.ts`) ne refusent plus rien mais sont
encore appelées par `app/src/route/valhalla.ts` et `app/src/route/routes-api.ts`, hors du périmètre du chantier.

## Questions à trancher

- [decision] Retirer ces deux fonctions et leurs appels, dans un chantier qui inclut les deux routeurs ?
