# Intention : inscrire dans l'application une ville créée par la commande, et rattraper les docs hors périmètre

**Statut** : proposée le 2026-11-04 (limite du chantier `creation-itineraire`).

## Besoin

La commande `npm run city` écrit l'extrait, la boucle et la bibliothèque de matériaux d'une ville, mais ne l'inscrit pas dans
l'application : une ville créée n'a ni carte d'accueil, ni entrée dans `cityFor`, ni palette. Il faut que créer une ville
suffise à la voir apparaître à l'accueil, sans code propre à elle, et que les docs qui parlent encore des anciennes commandes
soient remises d'aplomb.

## Existant

Lu le 2026-11-04 :
- `app/src/city/cities.ts` importe à la main les extraits et boucles des quatre villes et porte une palette par itinéraire ;
  les cartes d'accueil et les identifiants d'itinéraire sont dans `app/src/route/` et `app/src/ui/`, hors du périmètre du chantier ;
- `app/AGENTS.md` (lignes sur `npm run extract*` et sur `app/scripts/cities.ts`) et `README.md` (lignes `npm run extract…`) citent
  encore les scripts retirés ; ils étaient hors du bloc scope de `creation-itineraire` ;
- `docs/intentions/villes-a-parcourir.md` et `docs/intentions/entree-npm-pack-arbres.md` citent `npm run extract:*` pour le
  contexte d'alors.

## Décisions (2026-11-05)

- Inscription par lecture du catalogue `app/data/villes.json` à la construction.
- Palette déduite de la région (`APP-008`).

Cadrée en chantier : `docs/projects/inscrire-ville-creee.md`.

## Questions à trancher

*(aucune)*
