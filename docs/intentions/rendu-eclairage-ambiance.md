# Intention : éclairage et ambiance de la ville

**Statut** : partiellement livrée le 2026-11-03 par le chantier rendu-eclairage-ambiance (lumière suivant l'heure réelle,
brouillard plafonné et désactivable, sons d'ambiance facultatifs : contrat `APP-011`, voir le journal des chantiers) ;
**laissée ouverte** pour ce qui reste : ombres portées, reflets, surfaces mouillées, pluie, particules, éclairage des
vitrines, et des sons enregistrés plutôt qu'un murmure produit par code (`docs/intentions/sons-ambiance-ville.md`).

## Besoin

Une lumière crédible (soleil, heure de la journée, ombres adaptées au casque, éclairage des vitrines), des reflets, des
surfaces mouillées, peut-être de la pluie, des particules et des sons d'ambiance (circulation, pas, oiseaux). Tout est
facultatif et réglable selon le profil de performance.

## Existant

Lu le 2026-11-02 : pas d'ombre portée ni d'éclairage dynamique ; ombrage vers le pied et matériaux toon. Le passthrough
sans ciel virtuel est tranché (2026-10-31) pour garder le réel visible (`APP-001`) : un ciel, un brouillard ou des effets
qui couvrent le champ de vision sont en tension avec ce contrat. Aucun son dans l'application.

## Questions à trancher

- ~~Un ciel ou un brouillard virtuel est-il acceptable, sachant qu'il cache le réel (`APP-001`) ?~~ tranché le
  2026-11-03 : oui au casque, voile plafonné à 0,15 et désactivable, aucun ciel posé (`APP-011`).
- ~~Le son est-il voulu (le casque a déjà ses propres sons) ?~~ tranché le 2026-11-03 : oui, coupé par défaut et plafonné.
- ~~L'heure de la journée suit-elle l'heure réelle, un réglage, ou reste fixe ?~~ tranchée le 2026-11-03 : l'heure réelle.
- Des ombres portées coûtent cher : à décider après les mesures (`docs/intentions/rendu-mesures-diagnostic.md`).
