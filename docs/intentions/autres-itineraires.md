# Intention : les trois autres itinéraires de la v0.1

**Statut** : proposée le 2026-10-30.

## Besoin

Après le souk de Doha (`docs/projects/journal.md`), ajouter les autres balades de `MISSION.md` : **Pune
Vieille ville** (Shaniwar Wada → temple Dagdusheth Ganpati, itinéraire par défaut prévu), **Pune FC Road** et **Doha
Corniche** (Musée d'art islamique → West Bay), avec la même méthode (extrait OpenStreetMap figé, boucle ou aller simple).

## Existant

Lu le 2026-10-30 : aucun itinéraire réel ; le souk est le premier, cadré dans sa propre fiche.

**Mis à jour le 2026-10-31** (chantier accueil-casque) : l'accueil affiche déjà les quatre cartes ; ces trois itinéraires
y sont « Bientôt » et non sélectionnables (`available: false` dans `app/src/route/itineraries.ts`). L'itinéraire choisi
est lu (`HomeView.readRouteId`) et inscrit sur la page (`data-route`), mais `app/src/xr/experience.ts` ne le consomme pas
encore : la marche reste la rue simple. Chaque ville livrée passe son itinéraire à `available: true` et branche son
extrait dans `app/src/xr/experience.ts`.

## Questions à trancher

- [decision] Ordre : Pune Vieille ville d'abord (itinéraire par défaut de `MISSION.md`) ?
- [decision] Boucle ou aller simple pour chacun ?
- [decision] La couverture OpenStreetMap des bâtiments de Pune (hauteurs, densité) suffit-elle ? À vérifier sur l'extrait.
