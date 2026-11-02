# Intention : éclairage et ambiance de la ville

**Statut** : proposée le 2026-11-02 (lot 6 de `docs/intentions/rendu-jeu-video.md`) ; après des façades détaillées.

## Besoin

Une lumière crédible (soleil, heure de la journée, ombres adaptées au casque, éclairage des vitrines), des reflets, des
surfaces mouillées, peut-être de la pluie, des particules et des sons d'ambiance (circulation, pas, oiseaux). Tout est
facultatif et réglable selon le profil de performance.

## Existant

Lu le 2026-11-02 : pas d'ombre portée ni d'éclairage dynamique ; ombrage vers le pied et matériaux toon. Le passthrough
sans ciel virtuel est tranché (2026-10-31) pour garder le réel visible (`APP-001`) : un ciel, un brouillard ou des effets
qui couvrent le champ de vision sont en tension avec ce contrat. Aucun son dans l'application.

## Questions à trancher

- [decision] Un ciel ou un brouillard virtuel est-il acceptable, sachant qu'il cache le réel (`APP-001`) ?
- [decision] Le son est-il voulu (le casque a déjà ses propres sons) ?
- [decision] L'heure de la journée suit-elle l'heure réelle, un réglage, ou reste fixe ?
- Des ombres portées coûtent cher : à décider après les mesures (`docs/intentions/rendu-mesures-diagnostic.md`).
