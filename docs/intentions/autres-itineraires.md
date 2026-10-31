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

**Mis à jour le 2026-10-31** (chantier pune-vieille-ville) : `app/src/xr/experience.ts` lit enfin l'itinéraire choisi
(`app/src/city/cities.ts` : identifiant → extrait et boucle). La Vieille ville de Pune est disponible ; restent **Pune FC
Road** et **Doha Corniche**, à ajouter chacun dans `app/src/city/cities.ts` avec son extrait. Couverture OSM de Pune : 2 079 bâtiments, dont 2 041 sans
hauteur (7 m par défaut) : le relief de la ville est donc plat, à juger sur un vrai Quest 3.

**Mis à jour le 2026-10-31** (chantier doha-corniche) : la Corniche de Doha est disponible (extrait `app/data/doha-corniche.json`,
756 bâtiments dont 310 sans hauteur, aller-retour d'environ 4 km). Le réseau de voies du Musée d'art islamique n'est pas relié à
celui de la Corniche dans l'extrait (174 m d'écart) : le départ est le point relié le plus proche ; le tronçon de 2 km n'atteint
pas West Bay. Reste **Pune FC Road**, à ajouter dans `app/src/city/cities.ts` avec son extrait.

**Mis à jour le 2026-10-31** (chantier pune-fc-road) : FC Road est disponible (extrait `app/data/pune-fc-road.json`, 1 427
bâtiments dont 1 410 sans hauteur, aller-retour d'environ 3,5 km) : les quatre itinéraires de `MISSION.md` sont livrés, plus
aucun n'est « Bientôt ». Reste à les relire (lot 1) et à les essayer sur un vrai Quest 3 (lot 4).
