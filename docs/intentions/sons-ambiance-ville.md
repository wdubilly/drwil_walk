# Intention : des sons de ville enregistrés plutôt qu'un murmure produit par code

**Statut** : proposée le 2026-11-03.

## Besoin

Donner aux sons d'ambiance la texture d'une vraie ville (rumeur lointaine, souk, bord de mer de la Corniche) au lieu du murmure
de bruit filtré produit par code aujourd'hui, sans jamais couvrir les bruits réels de la pièce et du tapis (`APP-011`).

## Existant

Lu le 2026-11-03 : `app/src/xr/ambience-sound.ts` produit une boucle de bruit filtré de 4 s, plafonnée à un gain de 0,2, coupée
par défaut. Aucun fichier audio n'est livré dans le dépôt ; la v0.1 interdit toute requête hors de la page servie, donc un son
enregistré devrait être embarqué, avec sa licence (CC0) et son poids maîtrisé, comme les modèles d'arbres (`APP-003`).

## Questions à trancher

- [decision] Embarquer des enregistrements CC0 dans le dépôt, et jusqu'à quel poids ?
- [decision] Un son par itinéraire (souk, Corniche, Pune) ou une seule rumeur commune ?
- Faut-il faire varier le son avec l'heure (`APP-011`) et la vitesse de marche ?
