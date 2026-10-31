# Intention : essayer le rendu Google 3D au casque

**Statut** : proposée le 2026-10-31 (reste du chantier google-3d-tiles, lot 4, réservé à l'humain ; dépend de `docs/intentions/cle-google-couverture.md`).

## Besoin

Marcher sur le tapis avec le Quest 3 et une vraie clé, en rendu Google 3D, et juger ce qu'aucun test ne voit : la netteté
à hauteur d'yeux, le fondu de sécurité (tête baissée, tout doit s'effacer, y compris les tuiles Google), l'alignement des
tuiles sur la boucle et les 72 images par seconde.

## Existant

Lu le 2026-10-31 : le fondu applique l'opacité à tous les matériaux de la ville, tuiles Google comprises, et la scène n'a ni ciel
ni fond (`APP-001`), prouvé par tests unitaires et e2e sur des tuiles factices seulement. Les tuiles sont calées sur l'origine
de la boucle (repère local est/sud) ; la hauteur du sol des tuiles par rapport à celui du tapis n'est pas réglée. Les tuiles sont
rendues sans éclairage (matériau de base) ; l'erreur d'écran visée est celle recommandée par la bibliothèque (20) et la
mémoire des tuiles est celle par défaut : rien n'est mesuré. La résolution d'un œil est prise sur la caméra XR, avec une valeur de
repli. Le panneau de mentions du casque n'a jamais été lu au casque.

## Questions à trancher

- [decision] Les 72 images par seconde tiennent-elles ? Sinon, quel budget d'erreur et de mémoire des tuiles, ou quelle part de la boucle à charger ?
- [decision] Le rendu est-il assez net à hauteur d'yeux pour justifier le coût de la clé, ou reste-t-on par défaut en OpenStreetMap ?
- [decision] Le sol des tuiles est-il à la bonne hauteur sous les pieds, et le fondu efface-t-il bien tout tête baissée ?
