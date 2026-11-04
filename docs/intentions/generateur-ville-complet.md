# Intention : un générateur de ville complet — `npm run city` donne une ville prête à parcourir, sans code

**Statut** : proposée le 2026-11-04.

## Besoin

Exprimé par le demandeur le 2026-11-04 : un générateur d'itinéraire qui reprend tout ce qui a été fait (extrait,
boucle, façades, matériaux locaux tirés des photos, lampadaires produits, et demain la ville vivante), mis au point sur
**un quartier de référence, le Souq Waqif**, puis appliqué ville par ville. Une ville nouvelle doit apparaître à l'accueil,
complète, par la seule commande `npm run city -- <identifiant>`.

Cette fiche d'ensemble ne décrit aucune réalisation : elle **ordonne** les intentions qui y mènent.

## Existant

Lu le 2026-11-04.

- **Déjà générique** :
  - `npm run city -- <id>` (`app/scripts/create-city.ts`, PR #80) écrit l'extrait OSM, la boucle (APP-002, la marche suit le
    parcours), l'inventaire de photos et la bibliothèque de matériaux d'une ville de `app/data/villes.json` (APP-012) ;
  - les façades procédurales (APP-008) et les lampadaires produits par règle (APP-013) se calculent au chargement, d'après
    la région de la ville (`app/src/city/facade-family.ts`, `regionOf`) : une ville nouvelle les a sans rien faire.
- **Propre au souk aujourd'hui** :
  - seule la bibliothèque de matériaux du souk existe (`app/assets/materials/doha-souq-waqif.json`) ; les trois autres
    quartiers n'ont pas été générés (hors périmètre de `creation-itineraire`) ;
  - les matériaux du souk n'ont pas été jugés au casque (`docs/intentions/essai-casque-materiaux-souk.md`).
- **Manquant** :
  - une ville créée n'est pas inscrite dans l'application : ni carte d'accueil, ni entrée dans `cityFor`, ni palette
    (`docs/intentions/inscrire-une-ville-creee.md`) ;
  - la commande n'a jamais tourné contre les vrais services (`docs/intentions/essai-commande-creation-reseau.md`) ;
  - la ville vivante, circulation, piétons et lampadaires allumés (`docs/intentions/ville-vivante.md`).

## Ordre proposé

Décidé le 2026-11-04 par le demandeur : le souk d'abord, puis la généralisation. Les intentions des étapes 1 et 2 passent en
`[P1]` dans l'index des intentions, pour finir une ville complète avec le générateur ; la fiche
`docs/projects/corniche-west-bay.md` reste en P3.

1. **Le souk, quartier de référence complet** :
   1. juger les matériaux locaux au casque (`docs/intentions/essai-casque-materiaux-souk.md`, séance groupée
      `docs/intentions/seance-casque-parcours.md`) ;
   2. la ville vivante au souk seul (`docs/intentions/ville-vivante.md`).
2. **La chaîne complète** :
   1. essayer la commande contre les vrais services (`docs/intentions/essai-commande-creation-reseau.md`) ;
   2. inscrire automatiquement une ville créée (`docs/intentions/inscrire-une-ville-creee.md`), avec la ville vivante
      réglée par sa région.
3. **Une fiche par ville**, qui ne fait que lancer la commande, régler les paramètres de région et juger le rendu :
   la Corniche, Pune Vieille ville, FC Road, puis les villes nouvelles (`docs/intentions/villes-a-parcourir.md`).

## Questions à trancher

- [decision] Les quatre quartiers figés sont-ils régénérés par la commande (boucles rejouées, aujourd'hui valides mais
  différentes des boucles versionnées), ou gardent-ils leurs données actuelles et ne reçoivent-ils que les matériaux ?
- [decision] Critère de « ville complète » : quels éléments une ville doit-elle avoir pour apparaître à l'accueil
  (matériaux tirés des photos ou palette de repli acceptée, ville vivante réglée ou désactivée) ?
- Le jugement au casque reste humain à chaque ville : une fiche de ville peut-elle se clore avant lui ?
