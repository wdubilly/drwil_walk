# Intention : essayer la marche à haute vitesse et un très long trajet libre sur un vrai Quest 3

**Statut** : proposée le 2026-11-02 (reste du chantier limites-vitesse-distance, lot 4, réservé à l'humain).

## Besoin

Essayer au casque, sur le tapis, avec précaution (clé de sécurité attachée), ce que l'e2e émulé ne voit pas : la ville
reste-t-elle lisible et s'efface-t-elle toujours tête baissée au-dessus de 8 km/h, la cadence tient-elle, et un trajet libre
de plus de 5 km se charge-t-il (ou retombe-t-il sur le sol seul en le disant) sans gêne ?

## Existant

Actualisé le 2026-11-05 : la vitesse n'a plus de maximum (minimum 1 km/h, `app/src/route/speed.ts`).
Le parcours libre et son chargement distant ont été retirés ; seul l'essai de vitesse sur itinéraire embarqué reste applicable.
Rien n'a été vu au casque.

## Questions à trancher

- [decision] À quelle vitesse la lecture de la ville devient-elle inconfortable ? Faut-il un avertissement ou une montée progressive (écarté du chantier, à cadrer à part) ?
- Le chargement d'un long trajet libre n'est plus dans le produit ; autre cadrage s'il revient.
