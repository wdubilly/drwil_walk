# Intention : essayer la marche à haute vitesse et un très long trajet libre sur un vrai Quest 3

**Statut** : proposée le 2026-11-02 (reste du chantier limites-vitesse-distance, lot 4, réservé à l'humain).

## Besoin

Essayer au casque, sur le tapis, avec précaution (clé de sécurité attachée), ce que l'e2e émulé ne voit pas : la ville
reste-t-elle lisible et s'efface-t-elle toujours tête baissée au-dessus de 8 km/h, la cadence tient-elle, et un trajet libre
de plus de 5 km se charge-t-il (ou retombe-t-il sur le sol seul en le disant) sans gêne ?

## Existant

Lu le 2026-11-02 : la vitesse n'a plus de maximum (minimum de 1 km/h, `app/src/route/speed.ts`) et le trajet libre n'a plus de
limite de longueur (`app/src/route/providers.ts`) ; la requête Overpass d'un long trajet grossit avec le tracé (réduit à un
nombre de points au plus dans `app/src/city/free-route.ts`). Rien n'a été vu au casque.

## Questions à trancher

- [decision] À quelle vitesse la lecture de la ville devient-elle inconfortable ? Faut-il un avertissement ou une montée progressive (écarté du chantier, à cadrer à part) ?
- [decision] Le chargement d'un trajet de plus de 5 km tient-il (Overpass public) ?
