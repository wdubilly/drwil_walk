# Intention : une mécanique fiable pour créer un itinéraire, avec des photos de rue comme inspiration

**Statut** : proposée le 2026-11-04 (demande du demandeur, pendant le cadrage de `villes-itineraires`).

## Besoin

Ajouter une ville ne doit plus être un petit chantier artisanal. Le demandeur veut une mécanique **fiable et répétable** :
on donne un nom, une emprise et un départ/arrivée, et on obtient un itinéraire complet (extrait, tracé de boucle,
façades de la région, matériaux locaux) sans écrire de code propre à la ville. Les photos de rue servent d'inspiration
pour les couleurs et les matériaux, comme pour le souk (`APP-012`).

## Existant

Lu le 2026-11-04 :
- l'extraction paramétrée (`app/scripts/cities.ts`, chantier `extraction-generique`) produit extrait et boucle, hors marche,
  par Overpass ;
- les palettes par région (`APP-008`, `app/src/city/facade-palettes.ts`) sont choisies par l'agent, sans photo ;
- la chaîne photos → couleurs → textures existe pour le souk (`app/scripts/panoramax.ts`, `materials-*.ts`), générique
  dans son code, mais Panoramax n'a aucune photo à moins de 30 m du souk et Mapillary demande un jeton
  (`docs/intentions/couleurs-photos-souk.md`) ;
- le brief `docs/projects/villes-itineraires.md` (Rome, Erevan, Paris) ne prévoit pas de photos.

## Décisions du demandeur (2026-11-04)

- La création est **une seule commande hors marche** (nom, emprise, départ/arrivée), sans code propre à la ville.
- Les photos viennent de **Panoramax puis Mapillary** (jeton hors dépôt, `SEC-007`) **et** de photos fournies par le demandeur.
- On tire des photos les **couleurs et les matériaux (textures)**, comme pour le souk.
- **Ordre** : on bâtit d'abord la commande, puis on crée Rome, Erevan et Paris avec elle ; `villes-itineraires` passe donc
  après ce chantier.
- **Sans photo à moins de 30 m du tracé** : repli sur les photos du quartier voisin (jusqu'à 1 km du tracé), puis sur la palette
  de la région.
- **Couleurs** : pas de relecture sur captures avant embarquement, elles sont jugées après coup au casque.
- **Vérifications** : pas de contrôle propre à la commande, les tests existants suffisent.

## Questions à trancher

*(aucune)*

## Suite

Cadrée le 2026-11-04 en chantier : `docs/projects/creation-itineraire.md`.
