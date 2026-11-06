# Intention : essayer un trajet libre sur les instances publiques d'OpenStreetMap

**Statut** : proposée le 2026-10-31 (reste du chantier fournisseurs-ouverts, lot 4, réservé à l'humain).

## Besoin

Vérifier avec de vraies requêtes ce que les tests factices ne voient pas : que Valhalla (routage) et Photon (adresses) répondent
depuis le navigateur du Quest 3 et d'un ordinateur (accès inter-origines, délais), que le profil piéton donne des chemins justes
à Pune et à Doha, que le premier résultat d'une adresse est le bon, et que l'usage reste raisonnable pour des services publics.

## Existant

Le 2026-10-31, les fournisseurs étaient testés avec des réponses factices, sans essai réel.
Depuis le recentrage du 2026-11-05, parcours libre, fournisseurs et leurs variables sont retirés.
Cette intention n'autorise plus d'essai réseau ; elle ne s'applique que si un futur cadrage réintroduit ce besoin.

## Questions à trancher

- [decision] Les instances publiques tiennent-elles l'usage prévu (une requête par validation, un calcul par trajet), ou faut-il passer à une instance auto-hébergée (`auto-heberger-valhalla-photon.md`) ?
- [decision] Le profil piéton de Valhalla donne-t-il des chemins acceptables dans les rues de Pune et de Doha ?
- [decision] Le premier résultat de Photon est-il le bon dans ces villes, ou faut-il proposer une liste ?
- [decision] L'essai au casque se joint-il à `essai-casque-itineraire-libre.md` ?
