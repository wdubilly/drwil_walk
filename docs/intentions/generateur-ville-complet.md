# Intention : un générateur de ville complet — `npm run city` donne une ville prête à parcourir, sans code

**Statut** : proposée le 2026-11-04 ; feuille de route décidée le 2026-11-05.

## Besoin

Exprimé par le demandeur le 2026-11-04 : un générateur d'itinéraire qui reprend tout ce qui a été fait (extrait,
boucle, façades, matériaux locaux tirés des photos, lampadaires produits, et demain la ville vivante), mis au point sur
**un quartier de référence, le Souq Waqif**, puis appliqué ville par ville. Une ville nouvelle doit apparaître à l'accueil,
complète, par la seule commande `npm run city -- <identifiant>`.

Cette fiche d'ensemble ne décrit aucune réalisation : elle **ordonne** les intentions qui y mènent.

## But

Créer un parcours, c'est **une entrée dans `app/data/villes.json` et `npm run city -- <identifiant>`**, rien d'autre : ni
code ni réglage propre à la ville. La ville apparaît à l'accueil, complète (façades, matériaux, lampadaires, ville
vivante), réglée par sa région ; seul le jugement au casque reste humain.

## Architecture cible

Six blocs ; tout ce qui est propre à une ville est une **donnée**, tout ce qui est propre à une région est un
**paramètre**, le code ne connaît ni l'une ni l'autre.

1. **Données par ville, produites par la commande** : extrait OSM (bâtiments, voies avec `lanes`, `oneway`, `sidewalk`,
   mobilier), boucle (APP-002), inventaire de photos, bibliothèque de matériaux (APP-012).
2. **Moteurs génériques, par règle** : façades (APP-008), lampadaires (APP-013) allumés la nuit (APP-011), figurants
   véhicules et piétons (APP-014).
3. **Paramètres par région** (`regionOf`, `app/src/city/facade-family.ts`) : palettes, densités, table des figurants
   (`app/assets/figurants-catalogue.json`), toujours avec un défaut `ailleurs`.
4. **Bibliothèque de modèles partagée** (`app/assets/`, provenance dans `app/assets/PROVENANCE.md`) : un modèle ajouté
   sert à toutes les régions qui le pondèrent.
5. **Inscription automatique** : la ville créée a sa carte d'accueil (nom, attribution, région), sans code.
6. **Tests communs** : les contrats se vérifient sur toute ville du catalogue, pas sur une ville nommée.

## Existant

Lu le 2026-11-05.

- **Fait** :
  - blocs 1 et 2 : la commande (PR #80) ; les façades, lampadaires et la ville vivante se calculent au chargement d'après
    la région ;
  - ville vivante au Souq Waqif (PR #83) : lanternes allumées la nuit, véhicules et piétons décrits par un catalogue de
    types et une table par région (`golfe` réglé, `inde` provisoire, `ailleurs` par défaut) ; l'extraction commune lit
    `lanes` et `oneway`.
- **Reste** :
  - juger au casque les matériaux et la ville vivante du souk (`docs/intentions/essai-casque-materiaux-souk.md`,
    `docs/intentions/essai-casque-ville-vivante.md`, séance groupée `docs/intentions/seance-casque-parcours.md`) ;
  - bloc 5 : une ville créée n'est pas inscrite à l'accueil (`docs/intentions/inscrire-une-ville-creee.md`) ;
  - la commande n'a jamais tourné contre les vrais services (`docs/intentions/essai-commande-creation-reseau.md`) ;
  - bloc 3 : seule la région `golfe` est réglée pour les figurants, les palettes ne s'appuient sur aucune référence
    (`docs/intentions/palettes-regions-references.md`), les modèles propres aux régions manquent (rickshaws,
    `docs/intentions/ville-vivante.md`) ;
  - bloc 6 : aucune recette ne prouve qu'une ville nouvelle se crée sans une ligne de code.

## Ordre proposé

Décidé le 2026-11-04 (le souk d'abord, puis la généralisation) et complété le 2026-11-05 ; la fiche
`docs/projects/corniche-west-bay.md` reste en P3.

1. **Le souk, quartier de référence** : ville vivante faite (PR #83) ; jugement au casque des matériaux et de la ville
   vivante.
2. **Inscription automatique** d'une ville créée (`docs/intentions/inscrire-une-ville-creee.md`).
3. **Essai de la commande contre les vrais services** (`docs/intentions/essai-commande-creation-reseau.md`).
4. **Paramètres de toutes les régions** : table des figurants et densités pour chaque région, défaut `ailleurs` jugé
   acceptable, palette de matériaux de repli quand les photos manquent, modèles propres aux régions ; s'appuie sur
   `docs/intentions/palettes-regions-references.md` et `docs/intentions/ville-vivante.md`.
5. **Recette du générateur** : créer une ville nouvelle par la seule commande et constater qu'aucun fichier de code n'a
   changé ; les tests communs (bloc 6) tournent sur toute ville du catalogue.
6. **Une fiche par ville**, qui ne fait que lancer la commande et juger le rendu : la Corniche, Pune Vieille ville, FC
   Road, puis les villes nouvelles (`docs/intentions/villes-a-parcourir.md`).

## Décisions du demandeur (2026-11-05)

- Les quatre quartiers existants sont **régénérés par la commande** : leurs boucles rejouées, valides mais différentes des
  boucles versionnées, remplacent celles-ci.
- Une ville **complète** pour apparaître à l'accueil : la palette de repli est acceptée quand les photos manquent, et la
  ville vivante de la région `ailleurs` (défaut) est acceptée.
- Une fiche de ville **se clôt avant** le jugement au casque, qui est reporté dans une intention.

## Questions à trancher

*(aucune)*
