# Intention : essayer un trajet libre sur les instances publiques d'OpenStreetMap

**Statut** : proposée le 2026-10-31 (reste du chantier fournisseurs-ouverts, lot 4, réservé à l'humain).

## Besoin

Vérifier avec de vraies requêtes ce que les tests factices ne voient pas : que Valhalla (routage) et Photon (adresses) répondent
depuis le navigateur du Quest 3 et d'un ordinateur (accès inter-origines, délais), que le profil piéton donne des chemins justes
à Pune et à Doha, que le premier résultat d'une adresse est le bon, et que l'usage reste raisonnable pour des services publics.

## Existant

Lu le 2026-10-31 : routage (`app/src/route/valhalla.ts`, `https://valhalla1.openstreetmap.de`) et adresses (`app/src/route/photon.ts`,
`https://photon.komoot.io`) sont codés derrière les interfaces `Router` et `Geocoder` et prouvés par tests et par l'e2e avec des
services factices ; aucun appel réel n'a eu lieu. Les adresses de ces deux instances et leur accès inter-origines (requête GET simple
pour le routage, sans en-tête personnalisé) sont des hypothèses de l'agent, non vérifiées. Le navigateur ne laisse pas fixer l'en-tête
d'identification : l'instance voit l'origine de la page. Les conditions d'usage de Nominatim, de Photon et de Valhalla sont à relire.

## Questions à trancher

- [decision] Les instances publiques tiennent-elles l'usage prévu (une requête par validation, un calcul par trajet), ou faut-il passer à une instance auto-hébergée (`auto-heberger-valhalla-photon.md`) ?
- [decision] Le profil piéton de Valhalla donne-t-il des chemins acceptables dans les rues de Pune et de Doha ?
- [decision] Le premier résultat de Photon est-il le bon dans ces villes, ou faut-il proposer une liste ?
- [decision] L'essai au casque se joint-il à `essai-casque-itineraire-libre.md` ?
